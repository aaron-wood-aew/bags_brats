<!--
═══════════════════════════════════════════════════════════════════════════════
⚜️ ARCHAIFORGE PROPRIETARY - COMPLIANCE & METRICS EXTENSION
═══════════════════════════════════════════════════════════════════════════════
This file is part of the Archaiforge Compliance & Metrics methodology.
CONFIDENTIAL AND PROPRIETARY. Unauthorized copying, modification, or
distribution is strictly prohibited.

© 2025 Archaiforge. All rights reserved.
═══════════════════════════════════════════════════════════════════════════════
-->

# Compliance & Metrics
## Framework Enforcement and Effectiveness Measurement

> **Version**: 1.0  
> **Requires**: MDA Core Kernel + All Methodologies  
> **Purpose**: Enforce Archaiforge framework discipline and quantify methodology effectiveness through automated compliance checking and metrics collection.

---

## Core Principle

**Self-Enforcing Framework**

A methodology framework that cannot validate its own application is incomplete. Compliance & Metrics provides:

1. **Compliance Checking** - Automated validation that framework protocols are followed
2. **Effectiveness Metrics** - Quantitative measurement of methodology outcomes
3. **Quality Scoring** - Objective assessment of work quality within framework

**Formula**: `Framework Integrity = Compliance × Effectiveness × Quality`

---

## The 3-Layer Enforcement Model

### Layer 1: Structural Compliance

**What**: Does the work state meet minimum structural requirements?

**Checks**:
- Ledger exists and is valid JSON
- Active plan has all required CLEAR fields
- CPT is defined (unless explicitly deferred)
- File references in state.yaml are valid

**When**: Before starting any work, after completing batches

**Failure Impact**: **CRITICAL** - Work cannot proceed without valid structure

---

### Layer 2: Protocol Adherence

**What**: Are methodology protocols being followed correctly?

**Checks**:
- CLEAR AI phases executed in order (C→L→E→A→R)
- Realm3X invoked when ambiguity detected
- Ledger updated after each batch
- Personas embodied per phase
- Tiered protocol observed (Tier 0/1/2)

**When**: During work execution, in reflections

**Failure Impact**: **WARNING** - Framework value degraded but work can continue

---

### Layer 3: Quality Assessment

**What**: Are methodology outputs meeting quality standards?

**Checks**:
- Reflections contain actual lessons (not boilerplate)
- CLEAR plans have specific success criteria
- Semantic dimensions are concrete (not vague)
- Atmospheric coherence validated

**When**: During reflection phase

**Failure Impact**: **INFO** - Opportunity for improvement

---

## Compliance Checks Specification

### Check 1: Ledger Integrity

**Validation**:
```javascript
function validateLedgerIntegrity(ledger) {
  const checks = {
    exists: ledger !== null,
    validJSON: isValidJSON(ledger),
    hasPlans: ledger.plans && Array.isArray(ledger.plans),
    plansHaveIDs: ledger.plans.every(p => p.id),
    plansHaveStatus: ledger.plans.every(p => ['active', 'in_progress', 'completed', 'paused'].includes(p.status)),
    activePlansValid: ledger.plans.filter(p => p.status === 'in_progress').every(validateActivePlan)
  };
  
  return {
    passed: Object.values(checks).every(v => v === true),
    checks: checks
  };
}
```

**Success Criteria**:
- ✅ ledger.json exists
- ✅ Valid JSON syntax
- ✅ Plans array present
- ✅ All plans have unique IDs
- ✅ All plans have valid status

**Failure Messages**:
- ❌ "Ledger file not found at {path}"
- ❌ "Ledger contains invalid JSON: {error}"
- ❌ "Plan {id} missing required fields"

---

### Check 2: CLEAR Plan Completeness

**Validation**:
```javascript
function validateCLEARPlan(plan) {
  const required = ['clarity', 'limits', 'examples', 'adapt', 'reflect'];
  const checks = {
    hasCLEAR: plan.clear !== undefined,
    allPhasesPresent: required.every(phase => plan.clear[phase]),
    phasesNotEmpty: required.every(phase => plan.clear[phase].length > 10),
    specificCriteria: plan.clear.reflect.includes('✓') || plan.clear.reflect.length > 50
  };
  
  return {
    passed: Object.values(checks).every(v => v === true),
    checks: checks,
    score: Object.values(checks).filter(v => v).length / Object.keys(checks).length
  };
}
```

**Success Criteria**:
- ✅ All 5 CLEAR phases present (C, L, E, A, R)
- ✅ Each phase has substantive content (>10 chars)
- ✅ Reflect phase has specific criteria (not generic)

**Quality Scoring**:
- **1.0** (100%): All checks pass
- **0.8** (80%): Minor issues (e.g., generic reflect criteria)
- **0.6** (60%): Missing substantive content in 1-2 phases
- **< 0.6**: FAIL - Incomplete CLEAR plan

---

### Check 3: Ledger Freshness

**Validation**:
```javascript
function validateLedgerFreshness(ledger) {
  const activePlans = ledger.plans.filter(p => p.status === 'in_progress');
  const warnings = [];
  
  activePlans.forEach(plan => {
    const daysSinceCreated = daysBetween(plan.created, today());
    const hasRecentBatch = plan.batches.some(b => 
      daysBetween(b.completed_date, today()) < 7
    );
    
    if (daysSinceCreated > 7 && !hasRecentBatch) {
      warnings.push({
        plan: plan.id,
        message: `Active plan stale (${daysSinceCreated} days, no recent batches)`,
        severity: 'warning'
      });
    }
  });
  
  return {
    passed: warnings.length === 0,
    warnings: warnings
  };
}
```

**Warning Triggers**:
- ⚠️ Active plan > 7 days old with no batch updates
- ⚠️ Pending tasks > 10 items
- ⚠️ Completed plan missing reflections

---

### Check 4: CPT Definition

**Validation**:
```javascript
function validateCPT(cpt) {
  if (!cpt || cpt.trim().length === 0) {
    return {
      passed: false,
      message: "CPT not defined - framework decisions lack alignment anchor"
    };
  }
  
  const checks = {
    hasThemeStatement: cpt.includes('Theme Statement'),
    hasCorePhilosophy: cpt.includes('Core Philosophy') || cpt.includes('Philosophy'),
    hasNarrativeArc: cpt.includes('Narrative') || cpt.includes('Goal'),
    substantive: cpt.length > 200
  };
  
  return {
    passed: checks.hasThemeStatement && checks.substantive,
    checks: checks,
    severity: checks.hasThemeStatement ? 'info' : 'warning'
  };
}
```

**Levels**:
- ✅ **Complete**: Has theme statement + philosophy + narrative
- ⚠️ **Minimal**: Has theme statement only
- ❌ **Missing**: No CPT defined

---

### Check 5: Batch Tracking

**Validation**:
```javascript
function validateBatchTracking(plan) {
  const checks = {
    hasBatches: plan.batches && plan.batches.length > 0,
    batchesNumbered: plan.batches.every((b, i) => b.number === i + 1),
    batchesHaveTasks: plan.batches.every(b => b.tasks && b.tasks.length > 0),
    completedHaveReflections: plan.batches
      .filter(b => b.status === 'completed')
      .every(b => plan.reflections.some(r => r.batch === b.number))
  };
  
  return {
    passed: Object.values(checks).every(v => v === true),
    checks: checks
  };
}
```

**Success Criteria**:
- ✅ Plan has defined batches
- ✅ Batches numbered sequentially
- ✅ Each batch has tasks
- ✅ Completed batches have reflections

---

## Effectiveness Metrics

### Metric 1: CLEAR AI Adherence Rate

**Measurement**:
```
Adherence Rate = (Plans with complete CLEAR structure) / (Total plans) × 100%
```

**Targets**:
- **Excellent**: ≥ 90% (most plans follow CLEAR)
- **Good**: 70-89% (majority follow CLEAR)
- **Poor**: < 70% (framework not being used)

**Collection**: Analyze ledger.json plans array

---

### Metric 2: Reflection Quality Score

**Measurement**:
```javascript
function scoreReflection(reflection) {
  let score = 0;
  
  // Has outcome (0-2 points)
  if (reflection.outcome) score += 1;
  if (reflection.outcome === 'Success' || reflection.outcome === 'Failure') score += 1;
  
  // Has substantive lessons (0-3 points)
  if (reflection.lessons && reflection.lessons.length > 20) score += 1;
  if (reflection.lessons.includes('discovered') || reflection.lessons.includes('learned')) score += 1;
  if (reflection.lessons.split('.').length > 2) score += 1; // Multiple sentences
  
  // Specific vs generic (0-2 points)
  const genericPhrases = ['worked well', 'went smoothly', 'no issues'];
  if (!genericPhrases.some(phrase => reflection.lessons.toLowerCase().includes(phrase))) {
    score += 2;
  }
  
  return score / 7; // Normalize to 0-1
}

Quality Score = Average(all reflection scores)
```

**Targets**:
- **Excellent**: ≥ 0.8 (reflections are specific and valuable)
- **Good**: 0.6-0.79 (decent quality)
- **Poor**: < 0.6 (generic or missing reflections)

---

### Metric 3: Ledger Update Frequency

**Measurement**:
```
Update Frequency = Average days between batch completions
```

**Targets**:
- **Excellent**: ≤ 3 days (active development)
- **Good**: 4-7 days (steady progress)
- **Poor**: > 7 days (stale or abandoned)

**Warning**: Long gaps suggest framework abandoned or not being followed

---

### Metric 4: Plan Completion Rate

**Measurement**:
```
Completion Rate = (Completed plans) / (Total plans) × 100%
```

**Targets**:
- **Excellent**: ≥ 80% (most plans reach completion)
- **Good**: 60-79% (majority complete)
- **Poor**: < 60% (many abandoned plans)

**Note**: In-progress plans excluded from calculation if created < 7 days ago

---

### Metric 5: Uncertainty Resolution Rate

**Measurement**:
```
Resolution Rate = (Uncertainties with documented resolution) / (Total uncertainties flagged) × 100%
```

**Collection**: Track uncertainty entries in ledger with resolution status

**Targets**:
- **Excellent**: ≥ 90% (Realm3X being used effectively)
- **Good**: 70-89% (decent resolution)
- **Poor**: < 70% (uncertainties not being addressed)

---

## CLI Integration

### Command: `archaiforge verify`

**Purpose**: Run all compliance checks on current project

**Usage**:
```bash
archaiforge verify              # Run all checks
archaiforge verify --plan-id ID # Verify specific plan
archaiforge verify --strict     # Fail on warnings
```

**Output**:
```
⚜️ Archaiforge Compliance Check

Structural Compliance
  ✓ Ledger exists and valid JSON
  ✓ Active plan has complete CLEAR structure
  ✓ CPT is defined
  ✓ File references valid

Protocol Adherence
  ✓ CLEAR phases in correct order
  ⚠ Ledger not updated in 8 days (warning)
  ✓ Batches have reflections

Quality Assessment
  ✓ Reflections are substantive (score: 0.85)
  ✓ CLEAR criteria specific
  
Overall: PASS (1 warning)
```

---

### Command: `archaiforge metrics`

**Purpose**: Show effectiveness metrics for project

**Usage**:
```bash
archaiforge metrics              # Show all metrics
archaiforge metrics --plan-id ID # Metrics for specific plan
archaiforge metrics --json       # JSON output
```

**Output**:
```
⚜️ Archaiforge Effectiveness Metrics

Framework Usage
  CLEAR AI Adherence: 95% (19/20 plans)   [Excellent]
  Reflection Quality: 0.82               [Excellent]
  Ledger Freshness: 3.2 days avg         [Excellent]
  Completion Rate: 75% (15/20 plans)     [Good]
  
Methodology Insights
  • Strong CLEAR AI adoption
  • High-quality reflections with specific lessons
  • Active development (frequent updates)
  • Room for improvement: Plan completion rate

Recommendations
  → Review 5 incomplete plans - can they be closed?
  → Continue current practices (metrics are strong)
```

---

### Command: `archaiforge audit --plan-id {ID}`

**Purpose**: Deep audit of specific plan compliance

**Output**:
```
⚜️ Plan Audit: AUTH_2025_12

CLEAR Structure: ✓ PASS
  ✓ Clarity: "Add tenant-scoped API key management"
  ✓ Limits: Scoped to auth subsystem
  ✓ Examples: References JWT implementation
  ✓ Adapt: Extends AuthService
  ✓ Reflect: Specific success criteria defined

Batch Execution: ✓ PASS
  Batch 1: Completed (model + service + tests)
    ✓ Has reflection
    ✓ Reflection quality: 0.75 (good)
    
Ledger Discipline: ✓ PASS
  ✓ Tasks tracked
  ✓ Status updated
  ✓ Completion recorded

Overall Compliance: EXCELLENT (100%)
```

---

## Integration with Methodologies

### CLEAR AI Integration

**Compliance Point**: After generating CLEAR plan
**Check**: Plan has all 5 phases with substantive content
**Action**: Validate before proceeding to execution

**Enhancement**: CLEAR AI extension can invoke compliance check:
```javascript
const plan = generateCLEARPlan(directive);
const compliance = validateCLEARPlan(plan);
if (compliance.score < 0.8) {
  console.warn(`Plan quality score: ${compliance.score} - consider revising`);
}
```

---

### Ledger Protocol Integration

**Compliance Point**: Before/after work batches
**Check**: Ledger freshness, structure, batch tracking
**Action**: Enforce ledger discipline automatically

**Enhancement**: Kernel can enforce:
```
Before Work: READ ledger → Verify compliance → Proceed
After Work: UPDATE ledger → Verify compliance → Continue
```

---

### Realm3X Integration

**Compliance Point**: When uncertainty detected
**Check**: Uncertainties logged, resolution tracked
**Action**: Measure resolution rate

**Metric**: Track uncertainty entries in ledger with timestamps and resolution status

---

## Success Criteria

Framework compliance and metrics are successful when:

- [ ] All projects can run `archaiforge verify` and get objective assessment
- [ ] Metrics reveal actual framework usage patterns (not assumptions)
- [ ] Low-compliance projects are identifiable and improvable
- [ ] High-compliance projects demonstrate measurable benefits
- [ ] Compliance checking is fast (< 1 second for typical project)
- [ ] Metrics inform framework evolution (data-driven improvements)

---

## Anti-Patterns

❌ **Compliance Theater**: Checking boxes without understanding  
✅ **Meaningful Enforcement**: Checks validate actual framework value

❌ **Metric Gaming**: Optimizing scores without improving work  
✅ **Honest Measurement**: Metrics reveal real usage patterns

❌ **Punitive Enforcement**: Blocking work for minor violations  
✅ **Helpful Guidance**: Warnings suggest improvements, errors block only critical issues

---

## Versioning

**Version 1.0 (2025-12-20)**:
- Initial compliance checking framework
- 5 core compliance checks (ledger, CLEAR, freshness, CPT, batches)
- 5 effectiveness metrics (adherence, quality, frequency, completion, resolution)
- 3 CLI commands (verify, metrics, audit)
- Integration specifications for CLEAR AI, Ledger, Realm3X

---

*Compliance & Metrics ensures Archaiforge maintains self-enforcing discipline while providing quantitative evidence of methodology effectiveness.*
