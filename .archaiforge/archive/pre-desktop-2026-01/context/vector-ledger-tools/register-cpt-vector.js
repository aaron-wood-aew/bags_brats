#!/usr/bin/env node
/**
 * Register CPT in Vector Ledger
 * Uses MiniLM L6 embeddings for proper semantic search
 * 
 * FIXED: No longer depends on ledger.json - reads directly from cpt.md
 */

const lancedb = require('@lancedb/lancedb');
const path = require('path');
const fs = require('fs');
const { pipeline } = require('@xenova/transformers');

// MiniLM L6 embedding model
let embeddingPipeline = null;

async function embed(text) {
    if (!embeddingPipeline) {
        console.log('   🧠 Loading MiniLM L6 embedding model...');
        embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('   ✅ Model loaded.');
    }
    const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
    const vector = Array.from(output.data);
    if (vector.length !== 384) {
        throw new Error(`Vector dimension error: got ${vector.length}, expected 384`);
    }
    return vector;
}

function extractSection(content, sectionName) {
    const regex = new RegExp(`##\\s*${sectionName}[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n##|\\n---|$)`, 'i');
    const match = content.match(regex);
    if (!match) return '';
    return match[1].split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('|')).join(' ').substring(0, 500).trim();
}

async function main() {
    console.log('⚜️ Archaiforge Vector Ledger - CPT Registration\n');

    const vectorPath = path.join(process.cwd(), '.archaiforge/vectors');
    const cptPath = path.join(process.cwd(), '.archaiforge/cpt.md');

    // Read CPT file directly (no ledger.json dependency)
    console.log('📖 Reading CPT from cpt.md...');
    if (!fs.existsSync(cptPath)) {
        console.error('❌ CPT file not found:', cptPath);
        process.exit(1);
    }
    const cptContent = fs.readFileSync(cptPath, 'utf-8');

    // Extract fields from markdown
    const vision = extractSection(cptContent, 'Vision');
    const audience = extractSection(cptContent, 'Target Audience') || extractSection(cptContent, 'Target Users');
    const value_proposition = extractSection(cptContent, 'Value Proposition');
    const capabilities = extractSection(cptContent, 'Core Capabilities');
    const success_metrics = extractSection(cptContent, 'Success Metrics');
    const constraints = extractSection(cptContent, 'Constraints');
    const is_gold_standard = cptContent.includes('GOLD STANDARD');

    console.log('   Vision:', vision.substring(0, 60) + '...');

    console.log('\n🔌 Connecting to LanceDB...');
    const db = await lancedb.connect(vectorPath);

    console.log('📊 Opening cpt_versions table...');
    const table = await db.openTable('cpt_versions');

    // Check current count
    const beforeCount = await table.countRows();
    console.log(`   Current CPT versions: ${beforeCount}`);

    // Generate semantic embedding from CPT content
    const textToEmbed = [vision, value_proposition, audience].filter(Boolean).join(' ');
    const vector = await embed(textToEmbed || 'Central Product Theme');

    const timestamp = new Date().toISOString();
    const cptRecord = {
        id: `cpt_v${beforeCount}`,
        vector: vector,  // ✅ Real semantic embedding from MiniLM L6
        version_number: beforeCount,
        timestamp: timestamp,
        vision: vision,
        audience: audience || 'Developers and technical teams',
        value_proposition: value_proposition,
        capabilities: capabilities || 'AI-powered development tools',
        success_metrics: success_metrics,
        constraints: constraints || 'Local-first, privacy-safe',
        changelog: `v${beforeCount} - CPT registered with semantic embedding`,
        is_gold_standard: is_gold_standard
    };

    console.log('\n💾 Registering CPT (with semantic embedding)...');
    await table.add([cptRecord]);

    // Verify
    const afterCount = await table.countRows();
    console.log(`\n✅ CPT registered successfully!`);
    console.log(`📊 Total CPT versions: ${beforeCount} → ${afterCount}`);

    console.log(`\n🎯 CPT Details:`);
    console.log(`   Version: ${cptRecord.version_number}`);
    console.log(`   Gold Standard: ${is_gold_standard ? 'YES' : 'NO'}`);
    console.log(`   Vision: ${vision.substring(0, 80)}...`);
    console.log(`   Embedding: Real 384-dim MiniLM L6 vector ✅`);

    console.log(`\n⚜️ Vector ledger is now operational!`);
    console.log(`   Run: archaiforge query cpt-gold`);
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
});
