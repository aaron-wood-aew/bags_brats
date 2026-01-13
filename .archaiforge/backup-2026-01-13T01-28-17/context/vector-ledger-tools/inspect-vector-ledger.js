#!/usr/bin/env node
/**
 * Query Archaiforge Vector Ledger
 * Inspect existing schema and data
 * 
 * Updated to use MiniLM embeddings for proper semantic search
 */

const lancedb = require('@lancedb/lancedb');
const path = require('path');
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
    return Array.from(output.data);
}

async function main() {
    console.log('⚜️ Archaiforge Vector Ledger - Inspection\n');

    const vectorPath = path.join(process.cwd(), '.archaiforge/vectors');

    console.log('🔌 Connecting to LanceDB...');
    const db = await lancedb.connect(vectorPath);

    console.log('📊 Available tables:');
    const tables = await db.tableNames();
    tables.forEach(t => console.log(`   - ${t}`));

    console.log('\n📋 CPT Versions Table:');
    try {
        const table = await db.openTable('cpt_versions');
        console.log('   Row count:', await table.countRows());

        // Use semantic search with real embedding
        const queryVector = await embed('product vision central theme');

        let results;
        if (typeof table.vectorSearch === 'function') {
            results = await table.vectorSearch(queryVector).limit(5).toArray();
        } else {
            results = await table.search(queryVector).limit(5).toArray();
        }

        // Filter out init records and show relevant fields
        const cptRecords = results
            .filter(r => r.id !== '_init')
            .map(r => ({
                id: r.id,
                version: r.version_number,
                vision: r.vision?.substring(0, 80) + '...',
                is_gold_standard: r.is_gold_standard,
                timestamp: r.timestamp
            }));

        console.log('\n📄 CPT records (semantic search):');
        console.log(JSON.stringify(cptRecords, null, 2));

    } catch (e) {
        console.log('   Error:', e.message);
    }

    // Show outcomes summary
    console.log('\n📋 Outcomes Table:');
    try {
        const outcomesTable = await db.openTable('outcomes');
        const count = await outcomesTable.countRows();
        console.log(`   Row count: ${count}`);

        if (count > 1) {
            const outcomes = await outcomesTable.query().limit(5).toArray();
            const summary = outcomes
                .filter(r => r.id !== '_init')
                .map(r => ({
                    epic: r.epic,
                    outcome: r.outcome?.substring(0, 50) + '...',
                    status: r.status,
                    hasRealVector: r.vector && r.vector[0] !== 0
                }));
            console.log('   Recent outcomes:');
            summary.forEach(s => console.log(`     - [${s.status}] ${s.epic}: ${s.outcome} (real vector: ${s.hasRealVector})`));
        }
    } catch (e) {
        console.log('   Error:', e.message);
    }
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
