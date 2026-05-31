# MDA Adoption Extension
## Integrating MDA into Existing Projects

> **Version**: 2.0  
> **Requires**: MDA Core Kernel loaded  
> **Purpose**: Guides agents in adopting MDA into existing codebases (brownfield projects). Load this extension when applying MDA to established systems.

---

## Part I: Adoption Philosophy

### 1.1 MDA is an Overlay, Not a Rewrite

When adopting MDA into an existing project:
- **Do not** force immediate architectural changes
- **Do** create `.mda/` as a cognitive layer over the existing structure
- **Do** document current state honestly before proposing evolution

### 1.2 Current State as Snapshot

Before any evolution:
1. **Snapshot** the current architecture
2. **Extract** implicit boundaries and subsystems
3. **Document** existing patterns (good and bad)
4. **Propose** CPT based on existing evidence

---

## Part II: Discovery Protocol

### 2.1 Structural Analysis

Scan the codebase to identify:

```
Key Indicators:
- Directory structure (monorepo? microservices? layered?)
- Import/dependency patterns (who talks to who?)
- Data flow (where does state live?)
- Entry points (APIs, UIs, CLIs?)
```

**Output**: Subsystem map

### 2.2 Boundary Inference

From the structural analysis, infer:
- What each subsystem **owns** (files, data, logic)
- What each subsystem **exposes** (APIs, interfaces)
- What each subsystem **consumes** (dependencies)
- What **boundaries exist** (implicit or explicit)

**Output**: Draft `boundaries.json`

### 2.3 CPT Extraction

Look for clues in:
- README.md or product docs
- Code comments expressing philosophy
- Naming patterns (what metaphors are used?)
- UX language (what does the interface say?)
- Team terminology (how do developers talk about the system?)

**Output**: Draft `cpt.md`

---

## Part III: Agent Role (Adoption Context)

### Adoption Analyst Agent

**Primary Functions:**
- Scans existing codebase structure
- Maps dependencies and data flows
- Identifies implicit subsystems
- Proposes initial boundaries and CPT

**Output Format:**
```markdown
## Adoption Analysis: [Project Name]

### Detected Structure
- Subsystems: [List]
- Entry Points: [APIs, UIs, etc.]
- Data Stores: [DBs, caches, etc.]

### Proposed Boundaries
[Initial boundaries.json structure]

### Proposed CPT
[Draft theme based on evidence]

### Recommendations
1. [First step]
2. [Second step]
...

### Risks
- [What could go wrong during adoption]
```

---

## Part IV: Adoption Workflow

### Step 1: Install MDA Overlay
```bash
npx @clearsight/mda adopt
```

This creates `.mda/` without touching existing code.

### Step 2: Review Auto-Generated Assets
- `.mda/config.json` — MDA configuration
- `.mda/kernel/boundaries.json` — Auto-detected boundaries (review!)
- `.mda/kernel/cpt.md` — Template CPT (customize!)
- `.mda/architecture/current-state.md` — Snapshot

### Step 3: Customize
**Human Action Required:**
1. Edit `cpt.md` to reflect true product theme
2. Review and refine `boundaries.json`
3. Document any existing architectural decisions in `architecture/decisions/`

### Step 4: First Evolution Pass
Once MDA is adopted:
- Use Architecture Extension for structural work
- Use Coding Extension for implementation
- Every change now "paints into" the documented kernel

---

## Part V: Common Adoption Patterns

### Pattern 1: Monolith Adoption
- **Challenge**: Everything is coupled
- **Strategy**: Define subsystems as logical boundaries first (auth, data, UI), even if physically intertwined
- **First Pass**: Create boundary contracts, begin enforcing via code reviews

### Pattern 2: Microservices Adoption
- **Challenge**: Services may duplicate logic or violate DRY
- **Strategy**: Treat each service as a subsystem, document cross-service contracts
- **First Pass**: Identify shared concepts that should be in "kernel"

### Pattern 3: Legacy Code Adoption
- **Challenge**: Technical debt, unclear architecture
- **Strategy**: Document what exists first (honest snapshot), then propose consolidation passes
- **First Pass**: Freeze features, run Architectural Debt Assessment (ADA)

---

## Part VI: Anti-Patterns (Adoption)

### Anti-Pattern 1: Forcing Immediate Refactor
**Signs**: Trying to rewrite everything to fit MDA
**Resolution**: MDA is cognitive, not prescriptive. Document current state, evolve gradually.

### Anti-Pattern 2: Ignoring Existing Patterns
**Signs**: Proposing boundaries that conflict with how the system actually works
**Resolution**: Boundaries should reflect reality first, then guide evolution.

### Anti-Pattern 3: Skipping CPT Definition
**Signs**: Leaving the template CPT unchanged
**Resolution**: CPT is the compass. Without it, MDA is just process.

---

## Part VII: Integration with Other Extensions

### With Architecture Extension
- Use AIA (Architectural Impact Assessment) for every proposed evolution
- Respect discovered boundaries during changes

### With Coding Extension
- Batch changes must align with subsystem boundaries
- CLEAR plans reference the CPT defined during adoption

### With Maintenance Extension
- Use DHA (Documentation Health Assessment) to audit existing docs
- Archive outdated documentation systematically

---

*This extension guides MDA adoption into existing projects. Load Core Kernel first, then this extension when working with brownfield codebases.*
