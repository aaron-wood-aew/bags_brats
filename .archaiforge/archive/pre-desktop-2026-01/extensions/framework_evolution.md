<!--
═══════════════════════════════════════════════════════════════════════════════
⚜️ ARCHAIFORGE PROPRIETARY - FRAMEWORK EVOLUTION EXTENSION
═══════════════════════════════════════════════════════════════════════════════
This file is part of the Archaiforge Framework Evolution methodology.
CONFIDENTIAL AND PROPRIETARY. Unauthorized copying, modification, or
distribution is strictly prohibited.

© 2025 Archaiforge. All rights reserved.
═══════════════════════════════════════════════════════════════════════════════
-->

# Framework Evolution
## How Archaiforge Learns and Improves Over Time

> **Version**: 1.0  
> **Requires**: MDA Core Kernel + Compliance & Metrics  
> **Purpose**: Define how the framework learns from usage, extracts patterns from reflections, manages methodology evolution, and governs the semantic pattern library.

---

## Core Principle

**Self-Improving System**

A framework that doesn't learn from its application becomes stagnant. Framework Evolution provides:

1. **Learning from Reflections** - Extract patterns from ledger reflections
2. **Pattern Governance** - Manage semantic pattern library evolution
3. **Methodology Refinement** - How methodologies improve based on evidence
4. **Extension Versioning** - Manage breaking changes and migrations

**Philosophy**: The framework improves itself by analyzing how it's actually used, not how we think it should be used.

---

## The 4-Layer Evolution Model

### Layer 1: Reflection Pattern Extraction

**What**: Mine ledger reflections for recurring patterns, anti-patterns, and insights

**Process**:
```
Ledger Reflections → Pattern Detection → Classification → Integration
```

**Output**: Extracted patterns added to pattern library or methodology refinements

---

### Layer 2: Pattern Governance

**What**: Manage the semantic pattern library lifecycle

**Process**:
```
Propose → Review → Accept → Publish → Deprecate
```

**Output**: Versioned, curated pattern library

---

### Layer 3: Methodology Refinement

**What**: Improve core methodologies based on usage evidence

**Process**:
```
Evidence Collection → Analysis → Proposal → Approval → Migration
```

**Output**: Updated methodology extensions with migration guides

---

### Layer 4: Framework Versioning

**What**: Semantic versioning for extensions with breaking change management

**Process**:
```
Change Type → Version Increment → Changelog → Migration Guide
```

**Output**: Clear version history and upgrade paths

---

## Layer 1: Reflection Pattern Extraction

### Pattern Detection Algorithm

**Input**: Ledger reflections from completed plans

**Steps**:
1. **Collect Reflections**: Gather all reflections from ledger.json
2. **Tokenize Lessons**: Extract key phrases and concepts
3. **Cluster Similar Patterns**: Group related insights
4. **Identify Recurring Themes**: Find patterns appearing 3+ times
5. **Classify by Type**: Anti-pattern, best practice, methodology improvement, tool suggestion

**Output Format**:
```json
{
  "pattern_id": "BATCH_SIZE_OPTIMIZATION",
  "type": "best_practice",
  "frequency": 5,
  "evidence": [
    {
      "plan_id": "AUTH_2025_12",
      "batch": 1,
      "lesson": "Batching DB migrations with service changes reduced deployment risk"
    }
  ],
  "extracted_pattern": {
    "name": "Co-locate Related Changes",
    "description": "Group logically related changes in same batch to reduce integration risk",
    "applicability": "When changes span multiple layers (DB + service + tests)",
    "benefits": ["Reduced deployment risk", "Atomic rollback", "Faster iteration"]
  }
}
```

---

### Pattern Classification

**Best Practice** (positive pattern):
- Appears 3+ times
- Consistently yields positive outcomes
- Generalizable across contexts

**Anti-Pattern** (negative pattern):
- Appears 2+ times with negative outcomes
- Should be avoided
- Warning signs recognizable

**Methodology Improvement**:
- Suggests enhancement to existing methodology
- Addresses real gap or inefficiency
- Would improve framework effectiveness

**Tool Suggestion**:
- Indicates need for automation or helper
- Repetitive manual process identified
- Would save time if automated

---

### Extraction Workflow

**Manual Process** (current):
1. Run `archaiforge metrics` to get reflection quality baseline
2. Review ledger reflections manually
3. Identify recurring themes
4. Document patterns in `/patterns` directory
5. Propose for inclusion in pattern library

**Future Automation** (v2.0+):
- AI-assisted pattern extraction from reflections
- Automated clustering and classification
- Suggested pattern proposals

---

## Layer 2: Pattern Governance

### Semantic Pattern Library Management

**Current State**: 41 patterns in `semantic_patterns.yaml`

**Governance Process**:

#### 1. Pattern Proposal

**Who**: Any user or from reflection extraction  
**Format**:
```yaml
pattern_proposal:
  proposed_by: user_or_system
  date: 2025-12-20
  pattern:
    id: pattern.category.name
    version: 1.0
    semantic_intent: "What user wants to accomplish"
    behavioral_contract: "How system responds"
    state_machine: { ... }
    implementation_contract: { ... }
  rationale: "Why this pattern is needed"
  evidence: ["Usage examples", "Reflection references"]
```

**Submission**: Create issue in pattern repository

---

#### 2. Pattern Review

**Criteria**:
- [ ] Unique semantic intent (not duplicate of existing)
- [ ] Clear behavioral contract
- [ ] Complete state machine definition
- [ ] Implementation guidance provided
- [ ] Evidence of need (3+ use cases or reflection citations)
- [ ] Generalizable (not single-project specific)

**Reviewers**: Framework maintainers + community voting

**Outcome**: Accept, Revise, or Reject

---

#### 3. Pattern Acceptance

**Actions**:
1. Assign permanent pattern ID
2. Add to `semantic_patterns.yaml`
3. Update CATALOG.yaml
4. Document in pattern changelog
5. Announce in release notes

**Versioning**: Pattern gets v1.0 on acceptance

---

#### 4. Pattern Evolution

**Minor Updates** (v1.1, v1.2):
- Clarifications to descriptions
- Additional implementation examples
- New semantic overlays
- Backwards compatible

**Major Updates** (v2.0, v3.0):
- Breaking changes to state machine
- Semantic intent modification
- Behavioral contract changes
- Requires migration guide

---

#### 5. Pattern Deprecation

**Triggers**:
- Better pattern emerges
- Use case no longer relevant
- Superseded by methodology change

**Process**:
1. Mark as `deprecated` in CATALOG
2. Add deprecation notice with alternative
3. Keep in library for 2 major versions
4. Remove in v3.0+ (with migration guide)

---

### Custom Pattern Guidelines

**When to Create Custom Pattern**:
- Domain-specific need not covered by library
- Project-specific semantic dimension
- Temporary pattern for exploration

**Where to Store**:
- Project-level: `.archaiforge/custom_patterns.yaml`
- Shared: Propose to main library if broadly useful

**Format**: Same as library patterns (must have semantic_intent, behavioral_contract, state_machine)

---

## Layer 3: Methodology Refinement

### Evidence-Based Methodology Evolution

**Sources of Evidence**:
1. **Reflection Quality Scores** (from compliance_and_metrics.md)
2. **Adherence Rates** (are methodologies being followed?)
3. **User Feedback** (explicit improvement suggestions)
4. **Pattern Extraction** (recurring methodology gaps)

---

### Methodology Change Process

#### 1. Evidence Collection

**Trigger**: 
- Adherence rate < 70% (methodology too complex or unclear)
- Quality scores declining over time
- 5+ reflections citing same methodology issue
- User-reported gaps

**Collection**:
```javascript
{
  "methodology": "CLEAR AI",
  "evidence_type": "adherence_rate",
  "current_value": 0.65,
  "threshold": 0.70,
  "trend": "declining",
  "reflections_citing_issue": [
    {
      "plan_id": "XYZ",
      "issue": "Limits phase too abstract, hard to define constraints"
    }
  ]
}
```

---

#### 2. Root Cause Analysis

**Questions**:
- Is methodology too complex?
- Is documentation unclear?
- Is tooling missing (should be automated)?
- Is methodology misaligned with actual workflows?

**Outcome**: Specific improvement proposal

---

#### 3. Improvement Proposal

**Format**:
```markdown
# Methodology Improvement Proposal: CLEAR-002

## Affected Methodology
CLEAR AI - Limits Phase

## Problem Statement
Adherence rate 65%. Reflections cite difficulty defining constraints concretely.

## Evidence
- 7 reflections mention "limits phase vague"
- Average limits content length: 15 chars (below 50 char threshold)
- Users skip to Examples phase without completing Limits

## Proposed Change
Add "Constraint Discovery Questions" to Limits phase:
1. What cannot change? (hard constraints)
2. What costs too much? (economic constraints)
3. What takes too long? (time constraints)
4. What skills are missing? (capability constraints)

## Impact
- Non-breaking (additive guidance)
- Version: 1.1 → 1.2
- Migration: None required

## Validation
Pilot with 3 projects, measure:
- Limits content length improvement
- Adherence rate change
- Reflection sentiment
```

---

#### 4. Approval & Implementation

**Approval**: Framework maintainer + user vote

**Implementation**:
1. Update extension file (e.g., `clear_ai.md`)
2. Increment version
3. Add to changelog
4. Update examples
5. Communicate in release

---

#### 5. Migration Guidance (if breaking)

**For Breaking Changes** (v1.x → v2.0):

Provide:
- **What Changed**: Specific modifications
- **Why**: Rationale with evidence
- **How to Migrate**: Step-by-step upgrade path
- **Compatibility**: Timeline for v1.x support

**Example**:
```markdown
# Migration Guide: CLEAR AI v1.0 → v2.0

## What Changed
Limits phase split into two: Constraints + Risks

## Why
Evidence showed constraint mapping and risk assessment are distinct activities.
Combining them led to incomplete analysis (32% of plans missing risk assessment).

## How to Migrate
Old format:
- L (Limits): "Auth subsystem only, no UI changes"

New format:
- L (Constraints): "Auth subsystem scope boundary"
- L (Risks): "UI coupling risk if auth API changes"

## Compatibility
v1.0 supported until June 2026 (6 months)
```

---

## Layer 4: Framework Versioning

### Extension Versioning Strategy

**Semantic Versioning**: `MAJOR.MINOR.PATCH`

**Rules**:
- **PATCH** (1.0.1): Bug fixes, typos, clarifications
- **MINOR** (1.1.0): New features, additive changes, backwards compatible
- **MAJOR** (2.0.0): Breaking changes, removed features, restructuring

---

### Changelog Discipline

**Every Extension Must Have**:
```markdown
## Versioning

**Version 1.2.0 (2025-12-20)**:
- Added Constraint Discovery Questions to Limits phase
- Clarified Examples phase pattern selection process
- Fixed typos in Reflection phase guidelines

**Version 1.1.0 (2025-11-15)**:
- Added Adaptive Persona Synthesis integration
- New success criteria examples
- Pattern library integration

**Version 1.0.0 (2025-10-01)**:
- Initial formalization
```

---

### Coordinated Releases

**Framework Version** (package.json): Tracks CLI version  
**Extension Versions**: Track independently

**Example**:
```
Archaiforge v1.04.0 includes:
- clear_ai.md v1.2
- realm3x.md v1.0
- semantic_ui.md v2.0 (breaking changes)
- atmosphere_synthesis.md v1.0
- compliance_and_metrics.md v1.0
- framework_evolution.md v1.0 (NEW)
```

**Release Notes Template**:
```markdown
# Archaiforge v1.04.0 Release Notes

## New Extensions
- framework_evolution.md v1.0 - Learning and pattern governance

## Updated Extensions
- clear_ai.md v1.1 → v1.2 (Constraint Discovery Questions)
- semantic_ui.md v1.5 → v2.0 (BREAKING: New pattern library format)

## Migration Required
- Semantic UI v2.0: [See migration guide](link)

## Metrics
- Total patterns: 41 → 47 (+6 new patterns)
- Active users: Tracked in next release
```

---

## Integration with Other Methodologies

### With Compliance & Metrics

**Data Flow**:
```
Compliance Metrics → Evidence Collection → Pattern Extraction → Methodology Improvement
```

**Example**:
- Metrics show CLEAR adherence at 68%
- Trigger evidence collection
- Reflections analyzed for root cause
- Improvement proposal generated

---

### With CLEAR AI

**Usage**: Apply CLEAR AI to methodology improvement proposals

**Phases**:
- **C (Clarity)**: What methodology problem are we solving?
- **L (Limits)**: What can't change? (backwards compatibility)
- **E (Examples)**: How have others solved similar issues?
- **A (Adaptation)**: Specific improvement design
- **R (Reflection)**: How will we measure success?

---

## Success Criteria

Framework evolution is successful when:

- [ ] Patterns extracted from ledger inform actual improvements
- [ ] Pattern library grows based on real usage (not speculation)
- [ ] Methodology versions track meaningful changes
- [ ] Users can migrate between versions smoothly
- [ ] Evidence-based improvements yield measurable gains
- [ ] Framework adapts to how it's actually used

---

## Quick Reference

**Extract Patterns from Reflections**:
1. Review ledger reflections
2. Identify recurring themes (3+ occurrences)
3. Classify (best practice / anti-pattern / improvement / tool)
4. Document in `/patterns` directory
5. Propose for library inclusion

**Propose New Pattern**:
1. Use proposal YAML format
2. Provide evidence (3+ use cases)
3. Submit to pattern repository
4. Review process begins

**Request Methodology Improvement**:
1. Cite evidence (reflections, metrics, adherence rates)
2. Use improvement proposal markdown format
3. Submit to framework repository
4. Vote and approval process

---

## Versioning

**Version 1.0 (2025-12-20)**:
- Initial framework evolution methodology
- Reflection pattern extraction process
- Pattern governance lifecycle
- Methodology refinement guidelines
- Extension versioning strategy

---

*Framework Evolution ensures Archaiforge continuously improves based on real-world usage, not assumptions.*
