# MDA Maintenance & Governance Extension
## Documentation Cleanup, Architecture Re-evaluation & Intelligent Archival

> **Version**: 1.0  
> **Requires**: MDA Core Kernel loaded  
> **Purpose**: Governs periodic maintenance, documentation hygiene, architectural debt assessment, and intelligent file archival. Load this extension when performing system cleanup, reorganization, or governance passes.

---

# Part I: The Maintenance Philosophy

## 1.1 Living Systems Need Gardening

Software systems are living organisms that accumulate:
- **Documentation drift** — Docs that no longer match reality
- **Architectural debt** — Shortcuts that compound over time
- **File clutter** — Obsolete artifacts, duplicate patterns, orphaned code
- **Context rot** — Lost knowledge about why things are the way they are

**MDA Maintenance treats cleanup as a structured governance pass, not ad-hoc tidying.**

---

## 1.2 When to Trigger Maintenance

Maintenance passes should occur:

### Scheduled Triggers
- **Monthly**: Documentation sync audit
- **Quarterly**: Architecture re-evaluation
- **Annually**: Full archival and pruning pass

### Event-Based Triggers
- After major feature completion (System Evolution Pass)
- Before starting a new major initiative
- When onboarding new team members (docs must be accurate)
- When technical debt is blocking progress
- When file system feels "messy" or hard to navigate

### Symptom-Based Triggers
- Can't find files easily
- README files are stale
- Architecture diagrams don't match code
- Multiple sources of truth for same concept
- Team members asking "where does X live?"

---

## 1.3 Core Principles

### Principle 1: Preservation Over Deletion
Never permanently delete. Archive instead. Context from 6 months ago might be valuable.

### Principle 2: Clarity Over Completeness
Better to have 5 accurate docs than 50 stale ones.

### Principle 3: Traceable Decisions
Every cleanup decision must be documented with rationale.

### Principle 4: CPT Alignment
Even cleanup serves the Central Product Theme — a well-organized system reflects product values.

---

# Part II: Documentation Cleanup Protocol

## 2.1 The Documentation Audit

Before any cleanup, generate a **Documentation Health Assessment (DHA)**:

```
┌─────────────────────────────────────────────┐
│ DOCUMENTATION HEALTH ASSESSMENT (DHA)       │
├─────────────────────────────────────────────┤
│ Audit Date: [ISO date]                      │
│ Auditor: [Human/Agent role]                 │
│                                             │
│ Documentation Inventory:                    │
│   Total .md files: [count]                  │
│   README files: [count]                     │
│   Architecture docs: [count]                │
│   API docs: [count]                         │
│   Orphaned docs: [count]                    │
│                                             │
│ Health Indicators:                          │
│   ☐ Last updated > 3 months                 │
│   ☐ References non-existent code            │
│   ☐ Contradicts other docs                  │
│   ☐ Missing from navigation/index           │
│   ☐ Duplicate content elsewhere             │
│                                             │
│ Priority Issues:                            │
│   1. [Issue description]                    │
│   2. [Issue description]                    │
│                                             │
│ Recommended Actions:                        │
│   - Update: [list]                          │
│   - Merge: [list]                           │
│   - Archive: [list]                         │
│   - Delete: [list] (with justification)     │
└─────────────────────────────────────────────┘
```

---

## 2.2 Documentation Cleanup Stages

### Stage 1: Inventory & Categorize

```bash
# Agent should map:
- Active docs (referenced in code, recently updated)
- Stale docs (> 3 months old, no recent changes)
- Orphaned docs (not linked from anywhere)
- Duplicate docs (same content, different locations)
- Historical docs (valuable context, but superseded)
```

### Stage 2: Assess & Tag

For each document, assign status:

| Status | Meaning | Action |
|--------|---------|--------|
| **CURRENT** | Accurate, actively used | Keep, minor updates only |
| **NEEDS_UPDATE** | Core is good, details stale | Update inline |
| **SUPERSEDED** | Replaced by newer doc | Archive with redirect |
| **DUPLICATE** | Content exists elsewhere | Merge or archive |
| **OBSOLETE** | No longer relevant | Archive |
| **HISTORICAL** | Context-rich, but inactive | Archive with metadata |

### Stage 3: Execute Cleanup Plan

Following CLEAR AI protocol:

```
C — Clarity: "Clean up documentation to reflect current system state"
L — Limits: "Touch only /docs and /architecture folders, preserve /archive"
E — Examples: "Previous cleanup pass archived 12 stale API docs"
A — Adapt: "Use same archival structure: /archive/YYYY-MM/category/"
R — Reflect: "Success = all active docs validated, no orphans, clear index"
```

---

## 2.3 Markdown Cleanup Standards

### Formatting Consistency

```markdown
# Standard Headers
- H1 (#): Document title (one per file)
- H2 (##): Major sections
- H3 (###): Subsections
- H4+ discouraged (restructure if needed)

# Code Blocks
- Always specify language: ```javascript, ```python
- Use meaningful examples
- Keep < 50 lines per block

# Links
- Relative links for internal docs: [Guide](../guide.md)
- Absolute for external: [React](https://react.dev)
- Check for broken links before finalizing

# Lists
- Use `-` for unordered
- Use `1.` for ordered
- Maintain consistent indentation (2 spaces)

# Tables
- Use for structured data only
- Keep columns < 6 for readability
- Include header row always
```

### Content Quality Checks

```
☐ Date stamp present (when last updated)
☐ Purpose statement at top
☐ No contradictory information
☐ Examples work (tested)
☐ Links resolve correctly
☐ Terminology matches codebase
☐ CPT alignment where relevant
```

---

# Part III: Architecture Re-evaluation Protocol

## 3.1 Architectural Health Check

Generate an **Architectural Debt Assessment (ADA)**:

```
┌─────────────────────────────────────────────┐
│ ARCHITECTURAL DEBT ASSESSMENT (ADA)         │
├─────────────────────────────────────────────┤
│ Assessment Date: [ISO date]                 │
│ System Age: [months since inception]        │
│                                             │
│ Kernel Health:                              │
│   Auth/Authz: [Healthy / Degraded / Broken] │
│   Data Model: [Healthy / Degraded / Broken] │
│   API Boundaries: [Clear / Fuzzy / Violated]│
│   Multi-tenancy: [Solid / Leaky / Broken]   │
│                                             │
│ Boundary Violations Detected:               │
│   1. [Subsystem A → B direct DB access]     │
│   2. [Shared mutable state in X]            │
│                                             │
│ Technical Debt Inventory:                   │
│   High Priority:                            │
│     - [Issue with system-wide impact]       │
│   Medium Priority:                          │
│     - [Issue with local impact]             │
│   Low Priority:                             │
│     - [Nice-to-have cleanup]                │
│                                             │
│ Refactoring Candidates:                     │
│   1. [Module/subsystem name]                │
│      Reason: [Why it needs refactoring]     │
│      Impact: [What breaks if we don't]      │
│                                             │
│ CPT Drift Assessment:                       │
│   Areas misaligned: [list]                  │
│   Recommended realignment: [suggestions]    │
└─────────────────────────────────────────────┘
```

---

## 3.2 Architecture Re-evaluation Triggers

Conduct full architecture review when:

- **6 months have passed** since last review
- **Major feature completed** (System Evolution Pass)
- **Performance issues** arise unexpectedly
- **Security incident** or audit finding
- **New team members report confusion** about structure
- **Planning next major initiative** (validate foundation is ready)

---

## 3.3 Re-evaluation Process

### Step 1: Document Current State

```markdown
## Architecture Snapshot: [Date]

### Core Product Kernel Status
- Auth: [Current implementation + any compromises]
- Data: [Schema version, migrations pending]
- API: [Endpoints, versioning approach]
- Frontend: [Framework version, component structure]

### Subsystem Boundaries
[Diagram or list of current boundaries]

### Known Compromises
1. [What we did that wasn't ideal]
   - Why: [Reason at the time]
   - Impact: [Current pain points]

### Dependencies
- External: [APIs, services we depend on]
- Internal: [How subsystems couple]
```

### Step 2: Identify Gaps

Compare current state against:
- Original architecture vision (from kernel.md)
- CPT alignment
- Industry best practices
- Team pain points

### Step 3: Prioritize Debt

Use this framework:

| Priority | Criteria | Action Timeline |
|----------|----------|-----------------|
| **P0** | Blocks new work, security risk | Immediate |
| **P1** | Causes frequent bugs, slows development | Next sprint |
| **P2** | Creates workarounds, technical tax | Next quarter |
| **P3** | Aesthetic/organizational | Next annual cleanup |

### Step 4: Generate Remediation Plan

For each P0/P1 item, create a CLEAR AI Plan.

---

# Part IV: Intelligent Archival System

## 4.1 Archival Philosophy

**Archive ≠ Delete**

Archives serve three purposes:
1. **Historical context** — Why decisions were made
2. **Rollback capability** — In case we need to resurrect something
3. **Learning resource** — Future team members can see evolution

---

## 4.2 Archive Structure

```
/archive/
├── YYYY-MM/                    # Date-based top level
│   ├── code/                   # Deprecated code modules
│   │   ├── _MANIFEST.md        # What's here and why
│   │   └── old_auth_system/
│   ├── docs/                   # Superseded documentation
│   │   ├── _MANIFEST.md
│   │   └── api_v1_docs.md
│   ├── designs/                # Old design artifacts
│   │   ├── _MANIFEST.md
│   │   └── dashboard_v1_mockups/
│   └── architecture/           # Previous architecture docs
│       ├── _MANIFEST.md
│       └── adr-015-monolith-approach.md
└── _INDEX.md                   # Master index of all archives
```

---

## 4.3 Archival Manifest Template

Every archive folder must have a `_MANIFEST.md`:

```markdown
# Archive Manifest

**Archive Date**: [ISO date]
**Archived By**: [Human/Agent]
**Reason**: [Why this was archived]

## Contents

### Files Included
- [filename]: [brief description]
- [filename]: [brief description]

### Context
[Why these files existed, what they accomplished]

### Superseded By
[What replaced this, with links]

### Retrieval Instructions
[If someone needs to resurrect this, what should they know?]

## Related
- Plan ID: [If tied to evolution pass]
- ADR: [If architectural decision documented]
- Issue: [If tracked elsewhere]
```

---

## 4.4 Archival Decision Tree

```
┌─────────────────────────────────────┐
│ Should this file be archived?       │
└─────────────────────────────────────┘
          │
          ▼
    Is it referenced
    in active code?
          │
    ┌─────┴─────┐
    │           │
   YES         NO
    │           │
    │           ▼
    │     Has it been
    │     updated in
    │     last 6 months?
    │           │
    │     ┌─────┴─────┐
    │     │           │
    │    YES         NO
    │     │           │
    ▼     ▼           ▼
  KEEP   KEEP    Archive with
                  manifest
```

---

# Part V: Conflict Resolution Protocol

## 5.1 When Agents Should Query the Human

During maintenance operations, agents MUST pause and query when:

### Ambiguous Decisions
- **Multiple docs claim to be source of truth**
  - Query: "Doc A (updated 2 months ago) and Doc B (updated 1 week ago) both describe auth flow differently. Which is accurate?"

- **Uncertain if code is obsolete**
  - Query: "File X hasn't been touched in 9 months and isn't imported anywhere. Archive or keep?"

- **Conflicting architecture patterns**
  - Query: "Subsystem A uses pattern X, Subsystem B uses pattern Y for same problem. Should we consolidate?"

### Risky Actions
- **Deleting anything that might have external references**
  - Query: "API endpoint /v1/legacy hasn't been called in logs, but it's public. Safe to deprecate?"

- **Restructuring that affects multiple subsystems**
  - Query: "Moving auth module would affect 12 files across 4 subsystems. Proceed?"

- **Archiving recent work**
  - Query: "Feature branch merged 3 weeks ago but code appears unused. Archive branch artifacts?"

### CPT Alignment Questions
- **Cleanup might affect product narrative**
  - Query: "Removing 'experimental' docs — do these reflect a product direction we're still exploring?"

---

## 5.2 Query Format

When an agent needs human input, use this format:

```
┌─────────────────────────────────────────────┐
│ MAINTENANCE QUERY                           │
├─────────────────────────────────────────────┤
│ Context: [What we're trying to do]          │
│                                             │
│ Conflict: [What's ambiguous]                │
│                                             │
│ Options:                                    │
│   A. [Option with pros/cons]                │
│   B. [Option with pros/cons]                │
│   C. [Option with pros/cons]                │
│                                             │
│ Agent Recommendation: [What I think + why]  │
│                                             │
│ Risk if wrong: [Consequences]               │
│                                             │
│ Required: Human decision on A/B/C or other  │
└─────────────────────────────────────────────┘
```

---

## 5.3 Decision Logging

Every query and resolution must be logged:

```markdown
## Maintenance Decision Log

### Decision: [Brief title]
**Date**: [ISO date]
**Query ID**: MQ-YYYY-MM-###

**Context**: [What prompted this]

**Options Presented**:
1. [Option A]
2. [Option B]

**Human Decision**: [What was chosen]

**Rationale**: [Why this was chosen]

**Executed Actions**:
- [What was done]
- [What was done]

**Outcome**: [Result of decision]
```

---

# Part VI: Agent Roles (Maintenance Context)

## Documentation Curator Agent

**Primary Functions:**
- Audits .md files for accuracy
- Identifies orphaned/stale docs
- Proposes consolidation
- Maintains documentation index

**Output Format:**
```
Documentation Audit: [Date]

Files Reviewed: [count]
Issues Found: [count]

Recommended Actions:
- Update: [list with reasons]
- Merge: [list with reasons]
- Archive: [list with reasons]

Conflicts Requiring Human Input:
1. [Description + query]
```

---

## Architecture Auditor Agent

**Primary Functions:**
- Generates Architectural Debt Assessments
- Identifies boundary violations
- Spots CPT drift
- Prioritizes technical debt

**Output Format:**
```
Architectural Debt Assessment: [Date]

Health Score: [0-100]

Critical Issues (P0):
- [Issue]: [Impact]

Major Issues (P1):
- [Issue]: [Impact]

Recommendations:
1. [Action]: [Expected improvement]

Human Review Needed:
- [Ambiguous situations]
```

---

## Archival Specialist Agent

**Primary Functions:**
- Identifies archival candidates
- Creates manifests
- Maintains archive index
- Ensures no data loss

**Output Format:**
```
Archival Proposal: [Date]

Candidates for Archive:
- [File/folder]: [Reason] [Last touched: date]

Manifest Created: [Yes/No]

Conflicts:
- [Item]: [Why uncertain]

Backup Status: [Verified/Pending]

Proceed? [Awaiting approval]
```

---

# Part VII: Maintenance Workflow

## Full Maintenance Pass (Quarterly)

```
Week 1: Documentation Cleanup
├── Day 1-2: Generate DHA (Documentation Health Assessment)
├── Day 3-4: Execute cleanup plan
└── Day 5: Update indexes, validate links

Week 2: Architecture Re-evaluation
├── Day 1-2: Generate ADA (Architectural Debt Assessment)
├── Day 3-4: Document findings, create remediation plans
└── Day 5: Prioritize with human, schedule work

Week 3: Archival Pass
├── Day 1-2: Identify candidates
├── Day 3-4: Create manifests, execute archival
└── Day 5: Update archive index

Week 4: Validation & Documentation
├── Day 1-2: Verify all systems healthy post-cleanup
├── Day 3-4: Update maintenance log
└── Day 5: Reflection session with human
```

---

## Lightweight Monthly Pass

```
1. Run documentation audit (1 hour)
2. Fix critical doc issues (2 hours)
3. Archive obvious obsolete files (1 hour)
4. Update decision log (30 min)
```

---

# Part VIII: Success Metrics

## Maintenance Pass Success Criteria

```
Documentation:
☐ No broken links
☐ All active docs < 3 months stale
☐ Clear index/navigation
☐ No duplicate content
☐ READMEs accurate

Architecture:
☐ No critical (P0) debt items
☐ Boundaries clearly documented
☐ No undocumented compromises
☐ CPT alignment verified
☐ Kernel health confirmed

Archival:
☐ All archives have manifests
☐ Archive index updated
☐ No orphaned files in active tree
☐ Clear retrieval path if needed

Process:
☐ All conflicts resolved
☐ Decisions logged
☐ Human approval obtained where required
☐ Reflection session completed
```

---

# Part IX: Anti-Patterns

## Anti-Pattern 1: Delete Without Context
Removing files permanently without archival or manifest.

**Resolution**: Always archive with context, never delete.

---

## Anti-Pattern 2: Cleanup Without Plan
Ad-hoc tidying that creates more confusion.

**Resolution**: Always generate CLEAR plan for maintenance passes.

---

## Anti-Pattern 3: Ignoring Human Input
Making ambiguous decisions autonomously.

**Resolution**: Query protocol is mandatory, not optional.

---

## Anti-Pattern 4: Documentation Debt Creep
Never scheduling maintenance, letting rot accumulate.

**Resolution**: Calendar-based triggers, not "when we have time."

---

*This extension governs maintenance and governance work under MDA. Load Core Kernel first. Use alongside other extensions for holistic system health.*
