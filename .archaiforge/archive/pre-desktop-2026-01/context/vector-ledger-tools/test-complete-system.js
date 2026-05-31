#!/usr/bin/env node
/**
 * Complete Ledger System Test
 * Tests all read/write operations
 */

const ArchaiforgeLedger = require('./ledger-manager.js');

async function runTests() {
    console.log('⚜️ Archaiforge Ledger System - Complete Test Suite\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const fs = require('fs');
    const path = require('path');

    // Ensure dummy ledger.json exists for testing
    const ledgerPath = path.join(process.cwd(), '.archaiforge');
    if (!fs.existsSync(ledgerPath)) {
        fs.mkdirSync(ledgerPath, { recursive: true });
    }
    const ledgerFile = path.join(ledgerPath, 'ledger.json');
    if (!fs.existsSync(ledgerFile)) {
        fs.writeFileSync(ledgerFile, JSON.stringify({
            status: 'active',
            project_name: 'TEST_PROJECT',
            cpt: { version: 1, title: 'TEST CPT', status: 'DRAFT' }
        }));
    }

    const ledger = new ArchaiforgeLedger();
    let passedTests = 0;
    let totalTests = 0;

    // Test 1: Read CPT from JSON
    console.log('1️⃣  Test: Read CPT from JSON Ledger');
    totalTests++;
    try {
        const cpt = ledger.getCPT();
        if (cpt && cpt.title) {
            console.log(`   ✅ PASS - CPT Title: ${cpt.title}`);
            passedTests++;
        } else {
            console.log('   ❌ FAIL - No CPT found');
        }
    } catch (e) {
        console.log(`   ❌ FAIL - ${e.message}`);
    }

    // Test 2: Add Plan
    console.log('\n2️⃣  Test: Add Plan to JSON Ledger');
    totalTests++;
    try {
        const success = ledger.addPlan({
            description: 'TEST: Epic-driven development',
            status: 'in_progress'
        });
        if (success) {
            console.log('   ✅ PASS - Plan added successfully');
            passedTests++;
        } else {
            console.log('   ❌ FAIL - Plan add failed');
        }
    } catch (e) {
        console.log(`   ❌ FAIL - ${e.message}`);
    }

    // Test 3: Add Reflection
    console.log('\n3️⃣  Test: Add Reflection to JSON Ledger');
    totalTests++;
    try {
        const success = ledger.addReflection({
            summary: 'TEST: System verification completed',
            plan_id: 'TEST_PLAN'
        });
        if (success) {
            console.log('   ✅ PASS - Reflection added successfully');
            passedTests++;
        } else {
            console.log('   ❌ FAIL - Reflection add failed');
        }
    } catch (e) {
        console.log(`   ❌ FAIL - ${e.message}`);
    }

    // Test 4: Add Uncertainty
    console.log('\n4️⃣  Test: Add Uncertainty Flag');
    totalTests++;
    try {
        const success = ledger.addUncertainty({
            description: 'TEST: Schema validation approach',
            severity: 'low'
        });
        if (success) {
            console.log('   ✅ PASS - Uncertainty flagged successfully');
            passedTests++;
        } else {
            console.log('   ❌ FAIL - Uncertainty flag failed');
        }
    } catch (e) {
        console.log(`   ❌ FAIL - ${e.message}`);
    }

    // Test 5: Sync CPT to Vector
    console.log('\n5️⃣  Test: Sync CPT to Vector Ledger');
    totalTests++;
    try {
        const success = await ledger.syncCPTToVector();
        if (success) {
            console.log('   ✅ PASS - CPT synced to vector database');
            passedTests++;
        } else {
            console.log('   ❌ FAIL - CPT sync failed');
        }
    } catch (e) {
        console.log(`   ❌ FAIL - ${e.message}`);
    }

    // Test 6: Record Metric
    console.log('\n6️⃣  Test: Record Metric to Vector');
    totalTests++;
    try {
        const success = await ledger.addMetric({
            operation_type: 'test_suite',
            duration_ms: 250,
            tokens_estimated: 1000,
            success: true,
            metadata: { test: true }
        });
        if (success) {
            console.log('   ✅ PASS - Metric recorded successfully');
            passedTests++;
        } else {
            console.log('   ❌ FAIL - Metric recording failed');
        }
    } catch (e) {
        console.log(`   ❌ FAIL - ${e.message}`);
    }

    // Test 7: Read CPT from Vector
    console.log('\n7️⃣  Test: Read CPT from Vector Ledger');
    totalTests++;
    try {
        const cpt = await ledger.getCPTFromVector();
        if (cpt) {
            console.log(`   ✅ PASS - CPT retrieved (version: ${cpt.version_number})`);
            passedTests++;
        } else {
            console.log('   ❌ FAIL - No CPT in vector database');
        }
    } catch (e) {
        console.log(`   ❌ FAIL - ${e.message}`);
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📊 Test Results: ${passedTests}/${totalTests} passed`);

    if (passedTests === totalTests) {
        console.log('\n✅ ALL TESTS PASSED - System is fully operational!\n');
        console.log('🎯 Capabilities Verified:');
        console.log('   ✅ JSON Ledger Read/Write');
        console.log('   ✅ Vector Ledger Read/Write');
        console.log('   ✅ CPT Management');
        console.log('   ✅ Plans/Reflections/Uncertainties');
        console.log('   ✅ Metrics Tracking');
    } else {
        console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed - review errors above\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runTests().catch(err => {
    console.error('\n❌ Fatal error:', err.message);
    console.error(err.stack);
    process.exit(1);
});
