#!/usr/bin/env node
/**
 * Inspect Metrics Schema
 */
const lancedb = require('@lancedb/lancedb');
const path = require('path');

async function main() {
    const vectorPath = path.join(process.cwd(), '.archaiforge/vectors');
    const db = await lancedb.connect(vectorPath);
    console.log('✅ Connected to:', vectorPath);

    // List all tables
    const tableNames = await db.tableNames();
    console.log(`\n📊 Found ${tableNames.length} tables:`, tableNames);

    // Focus on archaiforge_metrics table
    const table = await db.openTable('archaiforge_metrics');
    const schema = await table.schema;
    console.log('\n📊 Metrics Table Schema:\n');
    console.log(schema);

    // Try to get one record without search
    console.log('\n📋 Attempting to read records...\n');
    try {
        // Use countRows which works
        const count = await table.countRows();
        console.log(`Total rows: ${count}`);

        // Don't use vectorSearch - it may crash with incomplete data
        console.log('\n⚠️  Cannot safely query records - use schema above to create matching records');
    } catch (e) {
        console.log('Error:', e.message);
    }
}

main().catch(console.error);
