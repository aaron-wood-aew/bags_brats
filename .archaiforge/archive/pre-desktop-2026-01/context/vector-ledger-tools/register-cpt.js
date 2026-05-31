#!/usr/bin/env node
/**
 * Register CPT in Archaiforge Vector Ledger
 * Reads the .archaiforge/cpt.md file and stores it as GOLD STANDARD
 */

const fs = require('fs');
const path = require('path');

// Read the CPT file
const cptPath = path.join(process.cwd(), '.archaiforge/cpt.md');
const cptContent = fs.readFileSync(cptPath, 'utf-8');

// Parse CPT to extract key sections
const vision = extractSection(cptContent, 'Product Vision');
const valueProposition = extractSection(cptContent, 'Core Value Proposition');
const targetUsers = extractSection(cptContent, 'Target Users');
const themePillars = extractSection(cptContent, 'Theme Pillars');
const strategicGoal = extractSection(cptContent, 'Strategic Goal');

function extractSection(content, heading) {
    const regex = new RegExp(`##\\s+${heading}([\\s\\S]*?)(?=\\n##|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
}

// Create CPT record
const cptRecord = {
    version: '1.0',
    created_at: new Date().toISOString(),
    file_path: cptPath,
    status: 'GOLD_STANDARD',
    content: {
        vision,
        value_proposition: valueProposition,
        target_users: targetUsers,
        theme_pillars: themePillars,
        strategic_goal: strategicGoal,
        full_text: cptContent
    },
    metadata: {
        word_count: cptContent.split(/\s+/).length,
        lines: cptContent.split('\n').length,
        project: 'chapter_mind'
    }
};

console.log(JSON.stringify(cptRecord, null, 2));
console.log('\n✅ CPT parsed successfully');
console.log(`📊 ${cptRecord.metadata.word_count} words, ${cptRecord.metadata.lines} lines`);
