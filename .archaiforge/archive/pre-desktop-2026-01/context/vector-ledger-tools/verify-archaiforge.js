#!/usr/bin/env node
/**
 * Archaiforge System Verification
 * Confirms vector integration is operational
 * 
 * FIXED: No longer depends on ledger.json - vector-first architecture
 */

const fs = require('fs');
const path = require('path');
const lancedb = require('@lancedb/lancedb');

async function main() {
    console.log('⚜️ Archaiforge Intelligence - System Verification\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let allGood = true;

    // 1. Check CPT File (Primary source now)
    console.log('1️⃣  CPT File (North Star Document)');
    let cptTitle = 'Unknown';
    let cptVersion = 'Unknown';
    try {
        const cptPath = path.join(process.cwd(), '.archaiforge/cpt.md');
        const cptContent = fs.readFileSync(cptPath, 'utf-8');
        const wordCount = cptContent.split(/\s+/).length;
        const lineCount = cptContent.split('\n').length;

        // Extract title and version from markdown
        const titleMatch = cptContent.match(/^#\s+(.+)/m);
        const goldMatch = cptContent.includes('GOLD STANDARD');
        cptTitle = titleMatch ? titleMatch[1] : 'Untitled CPT';

        console.log(`   ✅ File exists: .archaiforge/cpt.md`);
        console.log(`   ✅ Title: ${cptTitle}`);
        console.log(`   ✅ Word count: ${wordCount}`);
        console.log(`   ✅ Line count: ${lineCount}`);
        console.log(`   ✅ Gold Standard: ${goldMatch ? 'YES ⭐' : 'NO'}`);
    } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
        allGood = false;
    }

    // 2. Check Vector Database (Primary state storage)
    console.log('\n2️⃣  Vector Ledger (Semantic Long-Term Memory)');
    try {
        const vectorPath = path.join(process.cwd(), '.archaiforge/vectors');
        const db = await lancedb.connect(vectorPath);
        const tables = await db.tableNames();

        console.log(`   ✅ Database connected`);
        console.log(`   ✅ Tables: ${tables.length}`);

        for (const tableName of tables) {
            const table = await db.openTable(tableName);
            const count = await table.countRows();
            console.log(`      • ${tableName}: ${count} rows`);
        }

        // Special check for CPT versions
        if (tables.includes('cpt_versions')) {
            const cptTable = await db.openTable('cpt_versions');
            const count = await cptTable.countRows();
            console.log(`\n   📊 CPT Versions in Vector DB: ${count}`);

            if (count <= 1) {
                console.log('   ℹ️  Tip: Run `node ledger-manager.js sync-cpt` to sync CPT to vectors');
            }
        }

        // Check for outcomes with real embeddings
        if (tables.includes('outcomes')) {
            const outcomesTable = await db.openTable('outcomes');
            const outcomes = await outcomesTable.query().limit(5).toArray();
            const realEmbeddings = outcomes.filter(o => o.vector && o.vector[0] !== 0 && o.id !== '_init');
            console.log(`\n   📊 Outcomes with real embeddings: ${realEmbeddings.length}`);
        }
    } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
        allGood = false;
    }

    // 3. Check Boundaries
    console.log('\n3️⃣  Boundaries (Project Constraints)');
    try {
        const boundariesPath = path.join(process.cwd(), '.archaiforge/boundaries.yaml');
        if (fs.existsSync(boundariesPath)) {
            const boundariesContent = fs.readFileSync(boundariesPath, 'utf-8');
            const lineCount = boundariesContent.split('\n').filter(l => l.trim()).length;
            console.log(`   ✅ File exists: .archaiforge/boundaries.yaml`);
            console.log(`   ✅ Lines: ${lineCount}`);
        } else {
            console.log('   ℹ️  No boundaries.yaml found (optional)');
        }
    } catch (e) {
        console.log(`   ⚠️  Warning: ${e.message}`);
    }

    // 4. Final Status
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (allGood) {
        console.log('✅ SYSTEM STATUS: OPERATIONAL\n');
        console.log('⚜️ Archaiforge Intelligence is ready for epic-driven development.\n');
        console.log('📋 Current Configuration:');
        console.log('   • Primary State: Vector Ledger (.archaiforge/vectors/)');
        console.log('   • North Star: CPT Document (.archaiforge/cpt.md)');
        console.log('   • Embeddings: MiniLM L6 (384-dim, local ONNX)');
        console.log('\n🚀 Ready for commands:');
        console.log('   • archaiforge query stats    - Database status');
        console.log('   • archaiforge query cpt-gold - View Gold Standard CPT');
        console.log('   • archaiforge query outcomes-query "search" - Semantic search');
        console.log('   • node ledger-manager.js add-outcome "Epic" "Description"');
    } else {
        console.log('⚠️  SYSTEM STATUS: NEEDS ATTENTION\n');
        console.log('Some components need setup. Review errors above.');
        console.log('\n💡 To fix, try:');
        console.log('   • archaiforge init    - Initialize new project');
        console.log('   • archaiforge update  - Update existing project');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
    console.error('\n❌ CRITICAL ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
});
