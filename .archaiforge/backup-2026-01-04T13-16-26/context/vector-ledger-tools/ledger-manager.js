#!/usr/bin/env node
/**
 * Archaiforge Ledger Manager v2.0
 * Complete CRUD operations for JSON + Vector ledgers
 * 
 * FIXED: Now uses Xenova/all-MiniLM-L6-v2 for real semantic embeddings
 * instead of zero-vectors. This enables proper semantic search in LanceDB.
 */

const fs = require('fs');
const path = require('path');
const lancedb = require('@lancedb/lancedb');
const { pipeline } = require('@xenova/transformers');

// ========== EMBEDDING SERVICE (MiniLM L6 v2) ==========
const VECTOR_DIM = 384;
let embeddingPipeline = null;

/**
 * Generate embeddings using Xenova/all-MiniLM-L6-v2 (ONNX)
 * This is the same model used by VectorBridge for consistency.
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - 384-dimensional embedding vector
 */
async function embed(text) {
    if (!embeddingPipeline) {
        console.log('   🧠 Loading MiniLM L6 embedding model...');
        embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('   ✅ Model loaded.');
    }

    const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
    const vector = Array.from(output.data);

    if (vector.length !== VECTOR_DIM) {
        throw new Error(`Embedding dimension error: got ${vector.length}, expected ${VECTOR_DIM}`);
    }

    return vector;
}

class ArchaiforgeLedger {
    constructor(projectRoot = process.cwd()) {
        this.projectRoot = projectRoot;
        this.jsonLedgerPath = path.join(projectRoot, '.archaiforge/ledger.json');
        this.vectorPath = path.join(projectRoot, '.archaiforge/vectors');
        this.cptFilePath = path.join(projectRoot, '.archaiforge/cpt.md');
    }

    // ========== JSON LEDGER OPERATIONS ==========

    readJSON() {
        try {
            return JSON.parse(fs.readFileSync(this.jsonLedgerPath, 'utf-8'));
        } catch (e) {
            console.error('❌ Error reading JSON ledger:', e.message);
            return null;
        }
    }

    writeJSON(data) {
        try {
            fs.writeFileSync(this.jsonLedgerPath, JSON.stringify(data, null, 4), 'utf-8');
            return true;
        } catch (e) {
            console.error('❌ Error writing JSON ledger:', e.message);
            return false;
        }
    }

    getCPT() {
        const ledger = this.readJSON();
        return ledger?.cpt || null;
    }

    updateCPT(cptData) {
        const ledger = this.readJSON();
        if (!ledger) return false;

        ledger.cpt = {
            ...ledger.cpt,
            ...cptData,
            updated_at: new Date().toISOString()
        };

        return this.writeJSON(ledger);
    }

    addPlan(plan) {
        const ledger = this.readJSON();
        if (!ledger) return false;

        ledger.plans = ledger.plans || [];
        ledger.plans.push({
            id: plan.id || `PLAN_${Date.now()}`,
            created_at: new Date().toISOString(),
            ...plan
        });

        return this.writeJSON(ledger);
    }

    addReflection(reflection) {
        const ledger = this.readJSON();
        if (!ledger) return false;

        ledger.reflections = ledger.reflections || [];
        ledger.reflections.push({
            timestamp: new Date().toISOString(),
            ...reflection
        });

        return this.writeJSON(ledger);
    }

    addUncertainty(uncertainty) {
        const ledger = this.readJSON();
        if (!ledger) return false;

        ledger.uncertainty = ledger.uncertainty || [];
        ledger.uncertainty.push({
            flagged_at: new Date().toISOString(),
            ...uncertainty
        });

        return this.writeJSON(ledger);
    }

    // ========== VECTOR LEDGER OPERATIONS ==========

    async connectVector() {
        try {
            return await lancedb.connect(this.vectorPath);
        } catch (e) {
            console.error('❌ Error connecting to vector DB:', e.message);
            return null;
        }
    }

    async getCPTFromVector() {
        const db = await this.connectVector();
        if (!db) return null;

        try {
            const table = await db.openTable('cpt_versions');
            const results = await table
                .query()
                .limit(100)
                .toArray();

            // Filter for gold standard in JavaScript
            const realVersions = results.filter(r => r.id !== '_init');
            const goldStandard = realVersions.find(r => r.is_gold_standard === true);
            return goldStandard || realVersions[0] || null;
        } catch (e) {
            console.error('❌ Error reading CPT from vector:', e.message);
            return null;
        }
    }

    async addCPTToVector(cptData) {
        const db = await this.connectVector();
        if (!db) return false;

        try {
            const table = await db.openTable('cpt_versions');

            // Use fixed version for now - manual increment later
            const versionNumber = cptData.version_number || 2;

            // Generate semantic embedding from CPT content
            const textToEmbed = [
                cptData.vision || '',
                cptData.audience || '',
                cptData.value_proposition || '',
                cptData.capabilities || ''
            ].filter(Boolean).join(' ');

            const vector = await embed(textToEmbed || 'Central Product Theme');

            // Create record matching exact schema
            const record = {
                id: cptData.id || `cpt_v${versionNumber}`,
                vector: vector, // ✅ Real semantic embedding!
                version_number: versionNumber,
                timestamp: new Date().toISOString(),
                vision: cptData.vision || '',
                audience: cptData.audience || '',
                value_proposition: cptData.value_proposition || '',
                capabilities: cptData.capabilities || '',
                success_metrics: cptData.success_metrics || '',
                constraints: cptData.constraints || '',
                changelog: cptData.changelog || `v${versionNumber} - ${cptData.change_description || 'Updated'}`,
                is_gold_standard: cptData.is_gold_standard || false
            };

            await table.add([record]);
            console.log(`✅ Added CPT v${record.version_number} to vector ledger (with semantic embedding)`);
            return true;
        } catch (e) {
            console.error('❌ Error writing CPT to vector:', e.message);
            console.error(e.stack);
            return false;
        }
    }

    async addMetric(metricData) {
        const db = await this.connectVector();
        if (!db) return false;

        try {
            const table = await db.openTable('archaiforge_metrics');

            const record = {
                id: metricData.id || `metric_${Date.now()}`,
                timestamp: new Date().toISOString(),
                operation_type: metricData.operation_type || 'unknown',
                duration_ms: metricData.duration_ms || 0,
                tokens_estimated: metricData.tokens_estimated || 0,
                embedding_time_ms: metricData.embedding_time_ms || 0,
                success: metricData.success !== false,
                error_message: metricData.error_message || '',
                metadata: JSON.stringify(metricData.metadata || {})
            };

            await table.add([record]);
            console.log(`✅ Metric recorded: ${record.operation_type}`);
            return true;
        } catch (e) {
            console.error('❌ Error recording metric:', e.message);
            return false;
        }
    }

    async getMetrics(limit = 100) {
        const db = await this.connectVector();
        if (!db) return [];

        try {
            const table = await db.openTable('archaiforge_metrics');
            return await table.query().limit(limit).toArray();
        } catch (e) {
            console.error('❌ Error reading metrics:', e.message);
            return [];
        }
    }

    // ========== OUTCOME OPERATIONS (FIXED SCHEMA) ==========

    async addOutcome(outcomeData) {
        const db = await this.connectVector();
        if (!db) return false;

        try {
            const table = await db.openTable('outcomes');

            // Generate semantic embedding from outcome content
            const textToEmbed = `${outcomeData.epic || 'Unknown Epic'}: ${outcomeData.outcome || ''}`;
            const vector = await embed(textToEmbed);

            // Schema matches lib/db_schema.js
            const record = {
                id: outcomeData.id || `outcome_${Date.now()}`,
                vector: vector, // ✅ Real semantic embedding!
                timestamp: new Date().toISOString(),
                epic: outcomeData.epic || 'Unknown Epic',
                outcome: outcomeData.outcome || '',
                status: outcomeData.status || 'complete',
                metadata: JSON.stringify(outcomeData.metadata || {}),
                started_at: outcomeData.started_at || new Date().toISOString(),
                completed_at: outcomeData.completed_at || new Date().toISOString(),
                duration_minutes: outcomeData.duration_minutes || 0,
                files_modified: JSON.stringify(outcomeData.files_modified || []),
                lines_added: outcomeData.lines_added || 0,
                lines_removed: outcomeData.lines_removed || 0
            };
            await table.add([record]);
            console.log('✅ Outcome added to vector ledger (with semantic embedding)');
            return true;
        } catch (e) {
            console.error('❌ Error adding outcome:', e.message);
            return false;
        }
    }

    // ========== CONTEXT OPERATIONS (FIXED SCHEMA) ==========

    async addContext(contextData) {
        const db = await this.connectVector();
        if (!db) return false;

        try {
            const table = await db.openTable('context');

            // Generate semantic embedding from context content
            const textToEmbed = contextData.content || contextData.category || 'context';
            const vector = await embed(textToEmbed);

            // Schema matches lib/db_schema.js
            const record = {
                id: contextData.id || `context_${Date.now()}`,
                vector: vector, // ✅ Real semantic embedding!
                timestamp: new Date().toISOString(),
                category: contextData.category || 'general',
                content: contextData.content || '',
                tags: JSON.stringify(contextData.tags || [])
            };
            await table.add([record]);
            console.log('✅ Context added to vector ledger (with semantic embedding)');
            return true;
        } catch (e) {
            console.error('❌ Error adding context:', e.message);
            return false;
        }
    }

    // ========== BOUNDARY OPERATIONS (FIXED SCHEMA) ==========

    async addBoundary(boundaryData) {
        const db = await this.connectVector();
        if (!db) return false;

        try {
            const table = await db.openTable('boundaries');

            // Generate semantic embedding from boundary content
            const textToEmbed = `${boundaryData.type || 'boundary'}: ${boundaryData.value || ''}`;
            const vector = await embed(textToEmbed);

            // Schema matches lib/db_schema.js
            const record = {
                id: boundaryData.id || `boundary_${Date.now()}`,
                vector: vector, // ✅ Real semantic embedding!
                type: boundaryData.type || '',
                value: boundaryData.value || '',
                active: boundaryData.active !== false
            };
            await table.add([record]);
            console.log('✅ Boundary added to vector ledger (with semantic embedding)');
            return true;
        } catch (e) {
            console.error('❌ Error adding boundary:', e.message);
            return false;
        }
    }

    // ========== SYNC OPERATIONS (FIXED: Reads from cpt.md directly) ==========

    async syncCPTToVector() {
        console.log('🔄 Syncing CPT from cpt.md to Vector...\n');

        // Read CPT file directly (no longer depends on ledger.json)
        let cptContent = '';
        try {
            cptContent = fs.readFileSync(this.cptFilePath, 'utf-8');
        } catch (e) {
            console.log('❌ CPT file not found:', this.cptFilePath);
            return false;
        }

        console.log('📖 Reading CPT from:', this.cptFilePath);

        // Extract sections from markdown
        const vectorData = {
            vision: this.extractSection(cptContent, 'Vision'),
            audience: this.extractSection(cptContent, 'Target Audience') || this.extractSection(cptContent, 'Target Users'),
            value_proposition: this.extractSection(cptContent, 'Value Proposition'),
            capabilities: this.extractSection(cptContent, 'Core Capabilities'),
            success_metrics: this.extractSection(cptContent, 'Success Metrics'),
            constraints: this.extractSection(cptContent, 'Constraints'),
            changelog: this.extractChangelog(cptContent),
            is_gold_standard: cptContent.includes('GOLD STANDARD'),
            change_description: 'Synced from cpt.md'
        };

        console.log('   Vision:', vectorData.vision?.substring(0, 60) + '...');
        console.log('   Audience:', vectorData.audience?.substring(0, 60) + '...');

        return await this.addCPTToVector(vectorData);
    }

    // ========== HELPERS (FIXED: Parse markdown sections) ==========

    extractSection(content, sectionName) {
        // Match ## Section Name followed by content until next ## or end
        const regex = new RegExp(`##\\s*${sectionName}[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n##|\\n---|\$)`, 'i');
        const match = content.match(regex);
        if (!match) return '';

        // Clean up the content
        return match[1]
            .split('\n')
            .map(l => l.trim())
            .filter(l => l && !l.startsWith('|') && !l.startsWith('-'))
            .join(' ')
            .substring(0, 500)
            .trim();
    }

    extractChangelog(content) {
        const regex = /##\s*Changelog[\s\S]*?\n([\s\S]*?)(?=\n##|$)/i;
        const match = content.match(regex);
        if (!match) return 'No changelog';

        // Get first changelog entry
        const lines = match[1].split('\n').filter(l => l.trim());
        return lines[0]?.substring(0, 200) || 'Updated';
    }

    extractAudience(cptContent) {
        return this.extractSection(cptContent, 'Target Audience') ||
            this.extractSection(cptContent, 'Target Users') ||
            'Developers and technical teams';
    }

    extractCapabilities(cptContent) {
        return this.extractSection(cptContent, 'Core Capabilities') ||
            'AI-native development tools';
    }

    extractConstraints(cptContent) {
        return this.extractSection(cptContent, 'Constraints') ||
            'Local-first, privacy-safe';
    }
}

// ========== CLI INTERFACE ==========

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const ledger = new ArchaiforgeLedger();

    console.log('⚜️ Archaiforge Ledger Manager v2.0 (MiniLM Embeddings)\n');

    switch (command) {
        case 'read-cpt':
            const cpt = ledger.getCPT();
            console.log(JSON.stringify(cpt, null, 2));
            break;

        case 'sync-cpt':
            await ledger.syncCPTToVector();
            break;

        case 'add-plan':
            const plan = { description: args[1] || 'New plan', status: 'pending' };
            ledger.addPlan(plan);
            console.log('✅ Plan added');
            break;

        case 'add-reflection':
            const reflection = { summary: args[1] || 'Reflection', plan_id: args[2] };
            ledger.addReflection(reflection);
            console.log('✅ Reflection added');
            break;

        case 'metrics':
            const metrics = await ledger.getMetrics(10);
            console.log(`📊 Recent metrics (${metrics.length}):`);
            metrics.forEach(m => {
                console.log(`   ${m.timestamp}: ${m.operation_type} (${m.duration_ms}ms)`);
            });
            break;

        case 'record-metric':
            await ledger.addMetric({
                operation_type: args[1] || 'test',
                duration_ms: parseInt(args[2]) || 100,
                success: true
            });
            break;

        case 'add-outcome':
            // Usage: add-outcome "Epic Name" "Outcome description" [status] [files] [lines_added] [lines_removed] [duration]
            await ledger.addOutcome({
                epic: args[1] || 'Unknown Epic',
                outcome: args[2] || 'Completed',
                status: args[3] || 'complete',
                files_modified: args[4] ? args[4].split(',') : [],
                lines_added: parseInt(args[5]) || 0,
                lines_removed: parseInt(args[6]) || 0,
                duration_minutes: parseInt(args[7]) || 0
            });
            break;

        case 'add-context':
            // Usage: add-context "category" "content" [tags]
            await ledger.addContext({
                category: args[1] || 'general',
                content: args[2] || '',
                tags: args[3] ? args[3].split(',') : []
            });
            break;

        case 'add-boundary':
            // Usage: add-boundary "type" "value" [active]
            await ledger.addBoundary({
                type: args[1] || '',
                value: args[2] || '',
                active: args[3] !== 'false'
            });
            break;

        default:
            console.log('Usage:');
            console.log('  node ledger-manager.js read-cpt');
            console.log('  node ledger-manager.js sync-cpt');
            console.log('  node ledger-manager.js add-plan "Description"');
            console.log('  node ledger-manager.js add-reflection "Summary" "PLAN_ID"');
            console.log('  node ledger-manager.js metrics');
            console.log('  node ledger-manager.js record-metric "operation_type" duration_ms');
            console.log('');
            console.log('  # Vector writes with semantic embeddings:');
            console.log('  node ledger-manager.js add-outcome "Epic Name" "Outcome description" [status]');
            console.log('  node ledger-manager.js add-context "category" "content" [tags]');
            console.log('  node ledger-manager.js add-boundary "type" "value" [active]');
    }
}

if (require.main === module) {
    main().catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
}

module.exports = ArchaiforgeLedger;
