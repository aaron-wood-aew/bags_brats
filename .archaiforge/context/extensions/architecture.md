# MDA Architecture Extension
## System Design, Evolution & Structural Governance

> **Version**: 1.1  
> **Requires**: MDA Core Kernel loaded  
> **Purpose**: Governs agent behavior during architectural work, system design, and structural evolution passes. Load this extension when making decisions that affect system shape.

---

# Part I: Architectural Principles Under MDA

## 1.1 The Core Kernel Concept

Every system under MDA has a **Core Product Kernel** — the foundational architecture that all evolution passes paint into.

**Kernel Components:**
- Authentication & Authorization layer
- Multi-tenancy model
- Base data schema & relationships
- Frontend shell & navigation structure
- Shared component library
- Observability & logging infrastructure
- API boundary definitions
- Security perimeter

**Rule**: The kernel is never bypassed. All features integrate with it, never around it.

---

## 1.2 System Evolution vs. Feature Addition

Under MDA, there are no "features." There are only **System Evolution Passes**.

| Traditional | MDA Approach |
|-------------|--------------|
| "Add a feature" | "Evolve the system through a new capability" |
| Bolt-on logic | Integrated transformation |
| Touches one layer | Touches all relevant layers |
| May ignore architecture | Must respect and refine architecture |
| Optional documentation | Mandatory architecture notes |

**Every evolution pass asks:**
- How does this change the data model?
- How does this affect the UX narrative?
- How does this impact security boundaries?
- How does this align with CPT?
- What architectural debt does this introduce or resolve?

---

## 1.3 The Central Product Theme (CPT) as Architectural North Star

Architecture decisions must align with CPT.

**CPT governs:**
- System behavior philosophy
- UX mental model
- Data relationship semantics
- Naming conventions
- Integration patterns
- What the system "refuses" to do

**Example**: If CPT is "turn metrics into meaning," then architecture must support:
- Rich semantic data modeling (not just raw numbers)
- Narrative generation paths
- Context-aware presentation layers
- Intelligence over reporting

---

# Part II: Architectural Decision Protocol

## 2.1 Before Any Structural Change

Generate an **Architectural Impact Assessment (AIA)**:

```
┌─────────────────────────────────────────────┐
│ ARCHITECTURAL IMPACT ASSESSMENT             │
├─────────────────────────────────────────────┤
│ Change: [What is being proposed]            │
│                                             │
│ Kernel Impact:                              │
│   ☐ Auth/Authz    ☐ Data Model              │
│   ☐ API Boundaries ☐ Frontend Shell         │
│   ☐ Multi-tenancy ☐ Observability           │
│                                             │
│ CPT Alignment: [How this serves the theme]  │
│                                             │
│ Dependencies Introduced: [New couplings]    │
│ Dependencies Removed: [Decouplings]         │
│                                             │
│ Reversibility: [Easy / Hard / Permanent]    │
│                                             │
│ Migration Path: [How existing data/users    │
│                  transition]                │
│                                             │
│ Risk Assessment: [What could go wrong]      │
└─────────────────────────────────────────────┘
```

---

## 2.2 Architectural Boundaries

Define and respect **Boundary Contracts**:

```
┌─────────────────┐      ┌─────────────────┐
│   Subsystem A   │ ──── │   Subsystem B   │
│                 │ API  │                 │
│  (owns: X, Y)   │ ───► │  (owns: P, Q)   │
└─────────────────┘      └─────────────────┘
```

**Rules:**
- Subsystems own their data completely
- Communication happens through defined interfaces only
- No reaching into another subsystem's internals
- Shared concepts live in kernel, not duplicated

---

## 2.3 Data Model Evolution

When schema changes are required:

1. **Document current state** in architecture notes
2. **Propose new state** with rationale
3. **Define migration path** (data transformation)
4. **Assess breaking changes** to consumers
5. **Plan rollback** if needed
6. **Update all dependent documentation**

**Schema Change Template:**

```markdown
## Schema Evolution: [Name]

### Current State
[Describe existing tables/relationships]

### Proposed State  
[Describe new structure]

### Rationale
[Why this change serves CPT and system needs]

### Migration
[How existing data transforms]

### Breaking Changes
[What consumers must update]

### Rollback Plan
[How to reverse if needed]
```

---

# Part III: System Evolution Patterns

## Pattern 1: Additive Evolution

Adding new capability without modifying existing structures.

**Characteristics:**
- New tables/models extend, don't replace
- New API endpoints, existing unchanged
- New UI routes, existing preserved
- Lowest risk

**When to use:**
- Feature can be truly isolated
- No existing behavior needs modification
- CPT supports the addition naturally

---

## Pattern 2: Transformative Evolution

Modifying existing structures to support new capability.

**Characteristics:**
- Schema changes required
- API contracts may change
- UI flows restructured
- Higher risk, higher reward

**When to use:**
- Additive would create architectural debt
- Existing structure is limiting
- CPT demands deeper integration

**Requirements:**
- Full AIA before proceeding
- Migration plan documented
- Rollback strategy defined
- Staged rollout recommended

---

## Pattern 3: Consolidative Evolution

Simplifying or unifying existing structures.

**Characteristics:**
- Removes duplication
- Merges parallel implementations
- Clarifies boundaries
- Reduces cognitive load

**When to use:**
- Multiple paths exist for same concept
- Architectural debt has accumulated
- System has grown organically and needs pruning

**Danger**: Can mask breaking changes as "cleanup"

---

## Pattern 4: Kernel Extension

Expanding the Core Product Kernel itself.

**Characteristics:**
- Changes foundational behavior
- Affects entire system
- Requires extensive validation
- Highest impact

**When to use:**
- Current kernel cannot support required evolution
- CPT has shifted significantly
- Technical debt in kernel is blocking progress

**Requirements:**
- Executive decision (human Meta-Director approval)
- Comprehensive testing
- Staged migration
- Extensive documentation

---

# Part IV: Architecture Documentation Standards

## 4.1 Architecture Notes Structure

Maintain living architecture documentation:

```
/architecture/
├── overview.md           # System-level view
├── kernel.md             # Core Product Kernel spec
├── boundaries.md         # Subsystem boundaries & contracts
├── data-model.md         # Schema documentation
├── evolution-log.md      # History of evolution passes
├── decisions/            # ADRs (Architecture Decision Records)
│   ├── 001-auth-approach.md
│   ├── 002-tenancy-model.md
│   └── ...
└── diagrams/             # Visual representations
```

---

## 4.2 Architecture Decision Record (ADR) Template

```markdown
# ADR-[NUMBER]: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[What situation prompted this decision?]

## Decision
[What was decided?]

## Consequences
[What are the implications?]

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative  
- [Tradeoff 1]
- [Tradeoff 2]

### Neutral
- [Side effect 1]

## CPT Alignment
[How does this serve the Central Product Theme?]

## Related
- ADR-[X]: [Related decision]
- Plan ID: [If tied to evolution pass]
```

---

## 4.3 Evolution Log Entry Template

```markdown
## Evolution Pass: [Name]
**Date**: [ISO date]
**Plan ID**: [Reference to CLEAR AI plan]

### Summary
[One paragraph describing what changed]

### Changes
- **Data Model**: [Schema changes]
- **API**: [Endpoint changes]
- **UI**: [Interface changes]
- **Security**: [Permission/boundary changes]

### Files Modified
[List of key files]

### Architecture Impact
[How system shape changed]

### CPT Alignment
[How this serves the theme]

### Lessons Learned
[What we'd do differently]
```

---

# Part V: Agent Roles (Architecture Context)

## Architect Agent

**Primary Functions:**
- Generates AIAs (Architectural Impact Assessments)
- Identifies boundary violations
- Proposes structural alternatives
- Maintains architecture notes
- Enforces kernel integrity

**Never:**
- Makes structural decisions autonomously
- Bypasses boundary contracts
- Ignores CPT alignment

---

## Reviewer Agent (Architecture)

**Primary Functions:**
- Validates proposed changes against architecture
- Checks for hidden dependencies
- Identifies cascade effects
- Reviews migration safety

**Output Format:**
```
Architecture Review: [Change Name]

✓ Kernel Impact: [Acceptable / Concerning / Blocking]
✓ Boundary Respect: [Yes / Violation detected]
✓ CPT Alignment: [Strong / Weak / Misaligned]
✓ Data Model: [Clean / Migration needed / Breaking]
✓ Recommendation: [Proceed / Modify / Reject]

Notes: [Details]
```

---

## Evolution Planner Agent

**Primary Functions:**
- Sequences multi-step architectural changes
- Identifies safe ordering
- Plans staged rollouts
- Documents rollback paths

**Output Format:**
```
Evolution Plan: [Name]

Phase 1: [Description]
  - Changes: [List]
  - Validation: [How to verify]
  - Rollback: [How to reverse]

Phase 2: [Description]
  ...

Dependencies: [What must complete before what]
Total Risk: [Low / Medium / High]
```

---

# Part VI: Architectural Anti-Patterns

## Anti-Pattern 1: Kernel Bypass
Creating parallel structures instead of integrating with kernel.

**Signs:**
- Duplicate auth logic
- Shadow data stores
- Alternative API patterns

**Resolution**: Refactor to use kernel, or extend kernel properly.

---

## Anti-Pattern 2: Boundary Erosion
Gradual breakdown of subsystem isolation.

**Signs:**
- Direct database access across boundaries
- Shared mutable state
- Circular dependencies

**Resolution**: Reestablish contracts, introduce proper interfaces.

---

## Anti-Pattern 3: CPT Drift
Architecture evolving away from Central Product Theme.

**Signs:**
- Features feel disconnected
- Naming inconsistency
- UX narrative breaks down

**Resolution**: Audit against CPT, realign or consciously evolve CPT.

---

## Anti-Pattern 4: Documentation Rot
Architecture notes no longer reflect reality.

**Signs:**
- Diagrams are stale
- ADRs not created
- Evolution log gaps

**Resolution**: Documentation is part of the Definition of Done.

---

*This extension governs architectural work under MDA. Load Core Kernel first. Combine with Coding Extension for implementation passes.*
