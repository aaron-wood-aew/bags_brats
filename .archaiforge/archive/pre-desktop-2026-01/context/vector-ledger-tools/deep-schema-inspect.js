#!/usr/bin/env node
/**
 * Deep Schema Inspector - Reads actual LanceDB table schema using Apache Arrow
 */

const lancedb = require('@lancedb/lancedb');
const path = require('path');

async function inspectTableSchema(db, tableName) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📋 ${tableName.toUpperCase()} TABLE SCHEMA`);
    console.log('='.repeat(70));

    try {
        const table = await db.openTable(tableName);

        // Get the actual Arrow schema
        const schema = table.schema;
        console.log('\n🔍 Schema Object:');
        console.log(JSON.stringify(schema, null, 2));

        // Try to get fields if available
        if (schema.fields) {
            console.log('\n📝 Fields:');
            schema.fields.forEach(field => {
                console.log(`  - ${field.name}: ${field.type}`);
            });
        }

        // Get row count
        const count = await table.countRows();
        console.log(`\n📊 Total rows: ${count}`);

        // Get sample row if exists
        if (count > 0) {
            const results = await table.query().limit(1).toArray();
            console.log('\n📄 Sample Row Structure:');
            const sampleKeys = Object.keys(results[0]);
            sampleKeys.forEach(key => {
                const value = results[0][key];
                const type = Array.isArray(value) ? `Array[${value.length}]` : typeof value;
                console.log(`  - ${key}: ${type}`);
            });
        }

    } catch (e) {
        console.log(`\n❌ Error: ${e.message}`);
        console.log('Stack:', e.stack);
    }
}

async function main() {
    console.log('⚜️ LanceDB Deep Schema Inspector\n');

    const vectorPath = path.join(process.cwd(), '.archaiforge/vectors');
    const db = await lancedb.connect(vectorPath);

    // Inspect all problematic tables
    await inspectTableSchema(db, 'outcomes');
    await inspectTableSchema(db, 'context');
    await inspectTableSchema(db, 'boundaries');
}

main().catch(err => {
    console.error('\n❌ Fatal Error:', err.message);
    console.error(err.stack);
    process.exit(1);
});
