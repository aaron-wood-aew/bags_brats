#!/usr/bin/env node
/**
 * Inspect Vector Table Schemas
 * Shows actual field names for outcomes, context, and boundaries tables
 */

const lancedb = require('@lancedb/lancedb');
const path = require('path');

async function inspectTable(db, tableName) {
    console.log(`\n📋 ${tableName.toUpperCase()} TABLE:`);
    console.log('='.repeat(60));

    try {
        const table = await db.openTable(tableName);

        // Get a sample row to see actual fields
        const results = await table.query().limit(1).toArray();

        if (results.length > 0) {
            console.log('✅ Sample Row Fields:');
            console.log(JSON.stringify(Object.keys(results[0]), null, 2));
            console.log('\n📄 Sample Data:');
            console.log(JSON.stringify(results[0], null, 2));
        } else {
            console.log('⚠️  Table is empty - cannot determine schema from data');
            console.log('Attempting schema inspection...');
            const schema = table.schema;
            console.log(schema);
        }

        const count = await table.countRows();
        console.log(`\n📊 Total rows: ${count}`);

    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }
}

async function main() {
    console.log('⚜️ Archaiforge Vector Schema Inspector\n');

    const vectorPath = path.join(process.cwd(), '.archaiforge/vectors');
    const db = await lancedb.connect(vectorPath);

    // Inspect the three problem tables
    await inspectTable(db, 'outcomes');
    await inspectTable(db, 'context');
    await inspectTable(db, 'boundaries');
}

main().catch(err => {
    console.error('❌ Fatal Error:', err.message);
    process.exit(1);
});
