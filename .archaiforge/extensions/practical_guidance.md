<!--
═══════════════════════════════════════════════════════════════════════════════
⚜️ ARCHAIFORGE PROPRIETARY - PRACTICAL GUIDANCE EXTENSION
═══════════════════════════════════════════════════════════════════════════════
This file is part of the Archaiforge Practical Guidance methodology.
CONFIDENTIAL AND PROPRIETARY. Unauthorized copying, modification, or
distribution is strictly prohibited.

© 2025 Archaiforge. All rights reserved.
═══════════════════════════════════════════════════════════════════════════════
-->

# Practical Guidance
## Troubleshooting, Onboarding, and Mastery for Archaiforge

> **Version**: 1.0  
> **Requires**: All Core Extensions  
> **Purpose**: Provide practical guidance for troubleshooting framework issues, progressive onboarding from beginner to expert, and common mistake prevention.

---

## Core Principle

**Accessible Excellence**

A powerful framework that's hard to use provides no value. Practical Guidance provides:

1. **Troubleshooting** - Fix common failures and conflicts
2. **Progressive Mastery** - Gradual complexity introduction
3. **Common Mistakes** - Learn from others' errors
4. **Quick Reference** - Cheat sheets and decision trees

**Philosophy**: Lower the barrier to entry while maintaining framework power for advanced users.

---

## Part 1: Troubleshooting

### When Framework Fails

**Symptom Categories**:
1. Plan Quality Issues (bad CLEAR plans)
2. Methodology Conflicts (contradictory guidance)
3. Ledger Problems (state corruption, staleness)
4. Compliance Failures (verify command errors)
5. Integration Issues (CLI, extensions not loading)

---

### Problem 1: Bad CLEAR Plans

**Symptoms**:
- CLEAR plan too vague ("add feature")
- Missing critical context
- No concrete success criteria
- Limits phase empty or generic

**Root Causes**:
- Skipped Realm3X (unresolved ambiguity)
- Rushed through phases
- Copied boilerplate without customization
- Missing CPT alignment check

**Diagnostic**:
```bash
archaiforge verify --plan-id YOUR_PLAN_ID
```
Check: "Plan has minimal content in some CLEAR phases"

**Fix Workflow**:
```
1. Re-run Realm3X on original directive
   - Generate scenarios
   - Resolve ambiguities explicitly
   
2. Return to CLEAR Clarity phase
   - Restate with resolved parameters
   - Include CPT alignment statement
   
3. Strengthen Limits phase with Constraint Discovery:
   - What cannot change? (hard constraints)
   - What costs too much? (economic)
   - What takes too long? (time)
   - What skills missing? (capability)
   
4. Examples phase must reference ACTUAL code/patterns:
   - Not "similar to auth system"
   - Instead "auth/jwt.service.ts lines 45-67"
   
5. Reflect phase needs SPECIFIC criteria:
   - Not "authentication works"
   - Instead "users can login, tokens expire after 15 min, audit log captures events"
```

**Prevention**:
- Always run Realm3X before CLEAR on ambiguous directives
- Use compliance check: `archaiforge verify --plan-id`
- Review examples: Does each reference real file?

---

### Problem 2: Methodology Conflicts

**Symptoms**:
- Semantic UI suggests complex design
- CPT mandates simplicity
- Unclear which takes precedence

**Solution**: Apply Methodology Precedence (from kernel.md)

**Precedence Order**:
1. **CPT wins** - All methodologies align to Central Product Theme
2. **Realm3X blocks** - Unresolved uncertainty stops execution
3. **Ledger truth** - State overrides conversation memory
4. **CLEAR structure** - If in doubt, use 5-phase steering

**Example Resolution**:
```
Conflict: Semantic UI maps 5 semantic regions
CPT: "Simplicity over sophistication"

Resolution:
→ Reduce to 3 regions (align with CPT)
→ Document why simplification chosen (ledger reflection)
→ Atmosphere Synthesis adjusts to simpler structure
```

**Decision Tree**:
```
Is there a conflict?
  ├─ Does CPT address it? → Follow CPT
  ├─ Is uncertainty unresolved? → Block until Realm3X resolves
  ├─ Does ledger have truth? → Use ledger state
  └─ Still unclear? → Return to CLEAR AI process
```

---

### Problem 3: Ledger Corruption/Staleness

**Symptoms**:
- `archaiforge verify` shows ledger errors
- Active plan stale (>7 days, no updates)
- Missing reflections on completed batches
- Invalid JSON in ledger.json

**Diagnostics**:
```bash
# Check ledger integrity
archaiforge verify

# View ledger structure
cat .archaiforge/ledger.json | jq '.plans[] | {id, status, created}'

# Find stale plans
archaiforge metrics
```

**Fixes**:

**Invalid JSON**:
```bash
# Validate JSON syntax
cat .archaiforge/ledger.json | jq '.'

# Common issues:
- Trailing commas
- Unquoted strings
- Missing brackets

# Fix: Use JSON validator, restore from backup if needed
```

**Stale Plans**:
```bash
# Option 1: Complete the plan
# Add final reflection, mark as completed

# Option 2: Pause the plan
# Change status to "paused", document reason

# Option 3: Archive
# Move to separate archive file if abandoned
```

**Missing Reflections**:
```
# For each completed batch without reflection:
1. Review git history for that batch
2. Extract lessons learned
3. Add reflection entry retroactively
4. Note: "Added retroactively from git analysis"
```

**Prevention**:
- Run `archaiforge verify` after each batch
- Set calendar reminder if plan >5 days old
- Use pre-commit hook to validate ledger JSON

---

### Problem 4: Compliance Failures

**Symptom**: `archaiforge verify` shows errors

**Common Failures**:

**"Ledger missing plans array"**:
```json
// Bad:
{
  "work": []
}

// Fix:
{
  "plans": []
}
```

**"Plan missing required fields"**:
```json
// Bad:
{
  "plans": [{
    "name": "Add auth"
  }]
}

// Fix:
{
  "plans": [{
    "id": "AUTH_2025_12",
    "status": "in_progress",
    "created": "2025-12-20",
    "clear": { ... }
  }]
}
```

**"CPT not defined"**:
```bash
# Create CPT
cat > .archaiforge/cpt.md << 'EOF'
# Central Product Theme

## Product Identity
**Theme Statement**: [One sentence - what are we building?]

## Core Philosophy
1. [First principle]
2. [Second principle]
EOF
```

---

### Problem 5: Extension Loading Issues

**Symptoms**:
- AI agent can't find extension files
- Methodologies not being applied
- Boot sequence incomplete

**Diagnostics**:
```bash
# Check extension files exist
ls -la extensions/

# Verify boot.md references
grep -r "extensions/" context/boot.md

# Check AI agent's loaded context
# (Ask AI: "What extensions have you loaded?")
```

**Fixes**:

**Extensions Not Found**:
```bash
# If using npm link:
npm link
# Then copy context to project:
cp -r context .archaiforge/

# If extensions in wrong location:
# They should be in Archaiforge repo /extensions
# Not in project .archaiforge/extensions
```

**Boot Sequence Incomplete**:
```
1. Verify boot.md loaded
2. Check kernel.md loaded
3. Confirm ledger.json loaded
4. Test: Ask AI "What is your identity?" 
   → Should respond: "Archaiforge Intelligence"
```

---

## Part 1.5: CPT Creation Process

### The Challenge

**Problem**: CPT is critical but framework doesn't explain HOW to create one

**Solution**: Persona-shifting discourse to explore product from multiple perspectives

---

### The Persona Discourse Method

**Principle**: Great CPTs emerge from deep product understanding, which requires examining the product through different expert lenses.

**Process**: Hold a "discourse" about the product, shifting between personas to explore different dimensions.

---

### Step 1: Initial Discourse - What Are We Building?

**Persona**: Product Visionary

**Questions to Explore**:
- What problem does this solve?
- Who is this for?
- Why does this need to exist?
- What makes this different?
- What's the core value proposition?

**Output**: Raw product ideas, scattered insights

**Example Discourse**:
```
"We're building a task management system...
No, more than that - a cognitive framework for AI coding...
The real problem is AI amnesia and lack of structure...
It's not software, it's a methodology..."
```

---

### Step 2: Technical Perspective - How Does It Work?

**Persona**: Technical Architect

**Questions to Explore**:
- What's the technical architecture?
- What are the core components?
- What's proprietary vs commodity?
- What are the constraints?
- What's the technology strategy?

**Output**: Technical clarity, architectural principles

**Example Discourse**:
```
"It's not a binary, it's markdown files...
The CLI is just a helper, real value is methodologies...
Ledger protocol prevents AI amnesia...
Drop-in usability is critical..."
```

---

### Step 3: User Experience - How Does It Feel?

**Persona**: UX Researcher / Product Designer

**Questions to Explore**:
- How do users discover this?
- What's the first-time experience?
- What's the "aha!" moment?
- What's the learning curve?
- What aesthetic fits the purpose?

**Output**: User journey insights, design philosophy

**Example Discourse**:
```
"Users should feel 'more in control'...
Aesthetic: Architectural clarity, blueprint-like...
Not fluid suggestions, deterministic framework...
Like giving AI a cognitive operating system..."
```

---

### Step 4: Business Perspective - Why Does This Matter?

**Persona**: Business Strategist

**Questions to Explore**:
- What's the business model?
- Who pays and why?
- What's the defensible moat?
- What's the competitive advantage?
- What's the go-to-market?

**Output**: Value proposition, positioning, differentiation

**Example Discourse**:
```
"Not selling software, selling methodology...
Proven results: 87% time reduction, 75% fewer rebuilds...
Proprietary methodologies are the moat...
Target: AI-assisted dev teams hitting amnesia issues..."
```

---

### Step 5: Domain Expert - What's the Deep Insight?

**Persona**: Domain Expert (in your field)

**Questions to Explore**:
- What deep domain knowledge applies?
- What patterns from this field matter?
- What principles are universal?
- What expertise is embedded?

**Output**: Domain-specific principles, specialized knowledge

**Example Discourse (for Archaiforge)**:
```
Domain: Cognitive systems, AI collaboration

"AI agents need structure like humans need habits...
Ledger protocol fights conversation amnesia...
Persona embodiment isn't roleplay, it's perspective shifting...
Complexity must be tiered: L3 (internal) invisible to L1 (stakeholder)..."
```

---

### Step 6: Synthesis - Distill the Theme

**Process**: Review all persona discourse, identify recurring themes

**Look For**:
- What shows up in EVERY persona's perspective?
- What's non-negotiable across all views?
- What's the essence when you strip away details?
- What's the one-sentence truth?

**Synthesis Questions**:
1. **Theme Statement**: If you had one sentence, what is this?
2. **Core Philosophy**: What 3-5 principles are immutable?
3. **Narrative Arc**: What story are we telling?
4. **Design Directive**: What guides all decisions?

---

### Example: Archaiforge CPT Synthesis

**From Discourse**:
- Visionary: "Cognitive framework for AI coding"
- Architect: "Methodologies are the value, not CLI"
- UX: "Users feel 'more in control'"
- Business: "Proven 87% time reduction"
- Domain: "Structure over chaos for AI agents"

**Synthesized CPT**:

```markdown
# Central Product Theme

## Product Identity
**Theme Statement**: The proprietary structured methodology framework 
for AI coding assistants, enabling deterministic and agentic collaboration.

## Core Philosophy
1. **Structure over Chaos**: Methodologies must be explicit, not implicit
2. **Proprietary Value**: Core patterns are the "secret sauce"
3. **Agent-First Design**: Glass box, not black box

## Narrative Arc
Refine Archaiforge to ensure "drop-in" usability for agents, 
simplify boot experience, finalize methodologies as proprietary assets.

## Design Directive
**Visual**: Architectural clarity, blueprint-like
**Interaction**: Deterministic & rigid, solid framework
```

---

### Step 7: Validate - Does It Guide Decisions?

**CPT Litmus Test**:

When facing a decision, ask:
1. Does this serve the Theme Statement?
2. Does this violate any Core Philosophy?
3. Is this required for the Narrative Arc?

**Example Validation**:
```
Decision: Add AI-powered auto-complete to CLI

→ Theme Statement: "Methodologies are the value"
→ Core Philosophy: "Agent-First Design"
→ Analysis: Auto-complete is UX sugar, doesn't serve core value
→ Verdict: DEFER - Nice-to-have, not CPT-aligned
```

---

### Common CPT Mistakes

**Mistake 1: Too Generic**
```
Bad: "Build great software that users love"
Good: "Proprietary structured methodology framework for AI coding"
```

**Mistake 2: Too Specific**
```
Bad: "React + TypeScript + Tailwind task manager with dark mode"
Good: "Cognitive framework for AI agents" (tech agnostic)
```

**Mistake 3: No Philosophy**
```
Bad: Just lists features
Good: Principles that guide all decisions
```

**Mistake 4: Doesn't Guide Decisions**
```
Bad: So vague it doesn't help with real choices
Good: Clear enough to resolve "Should we build feature X?"
```

---

### CPT Evolution

**CPT is living document**:
- Initial: Draft from discourse
- Refined: After first features built
- Stabilized: Once product-market fit found
- Maintained: Updated as product evolves

**When to Update CPT**:
- [ ] Pivot in product direction
- [ ] New core philosophy emerges
- [ ] Narrative arc completes, new arc begins
- [ ] Design directive no longer fits

**When NOT to Update**:
- ❌ Every feature request
- ❌ Every user suggestion
- ❌ Market trends
- ✅ CPT should be stable, not reactive

---

### Quick Start: 30-Minute CPT

If you need CPT now:

1. **Theme Statement** (5 min): One sentence - what are you building?
2. **Core Philosophy** (10 min): 3 principles, non-negotiable
3. **Narrative Arc** (10 min): What's the current goal?
4. **Design Directive** (5 min): How should it feel?

**Done**: You have minimum viable CPT. Refine later with full persona discourse.

---

## Part 2: Progressive Mastery

### Beginner Mode (Tier 0-1 Tasks Only)

**Philosophy**: Start simple, add complexity gradually

**Week 1: Core Concepts**
- [ ] Understand: You're transforming AI's thinking (not a tool)
- [ ] Learn: Unified Loop (READ → CLASSIFY → CONTEXT → UNCERTAINTY → EXECUTE → WRITE)
- [ ] Practice: Tier 0 tasks (quick fixes, no plan needed)
- [ ] Tool: Run `archaiforge verify` to check compliance

**Week 2: CLEAR AI Basics**
- [ ] Understand: 5-phase steering (C→L→E→A→R)
- [ ] Learn: When to use CLEAR (Tier 1+ tasks)
- [ ] Practice: Create your first CLEAR plan for small feature
- [ ] Tool: Use `archaiforge clear plan --directive "..."`

**Week 3: Ledger Discipline**
- [ ] Understand: Ledger is truth (not conversation)
- [ ] Learn: Before/after work checklists (from kernel.md)
- [ ] Practice: Update ledger after every batch
- [ ] Tool: `archaiforge metrics` to track quality

**Week 4: Integration**
- [ ] Understand: How methodologies interact
- [ ] Learn: Realm3X→CLEAR AI flow
- [ ] Practice: Resolve ambiguity before planning
- [ ] Tool: Full workflow on real project

---

### Intermediate Mode (Tier 1-2, Multiple Methodologies)

**Skills to Develop**:

**1. Methodology Selection**
- Know when Realm3X needed (ambiguous directives)
- Know when Semantic UI needed (UI design tasks)
- Know when Atmosphere Synthesis applies (experiential design)

**Decision Tree**:
```
New Directive:
  ├─ Is it ambiguous? → Realm3X first
  ├─ Is it UI/UX? → Semantic UI + Atmosphere Synthesis
  ├─ Is it complex/multi-file? → Full CLEAR plan (Tier 2)
  └─ Is it quick fix? → Tier 0, no plan
```

**2. Persona Embodiment**
- Practice thinking FROM persona perspective
- Clarity: Requirements Architect (extract truth)
- Limits: Constraint Analyst (find blockers)
- Examples: Design Engineer (patterns)
- Adaptation: Integration Architect (full-stack)
- Reflection: Quality Validator (gaps)

**3. Batching Strategy**
- Group related changes (DB + service + tests)
- Avoid scattered one-file-at-a-time edits
- Batch size: 3-7 files typically
- Separate concerns: Don't mix unrelated work

---

### Advanced Mode (Full Framework Mastery)

**Expert Capabilities**:

**1. Cross-Methodology Orchestration**
- Seamlessly flow: Realm3X → CLEAR → Semantic UI → Atmosphere
- Know precedence rules by heart
- Anticipate conflicts before they arise

**2. Complexity Management**
- L3 (internal): Engineering patterns, security, platform constraints
- L2 (technical): Architecture rationale, trade-offs
- L1 (stakeholder): Operational definitions, acceptance criteria
- Invisible sophistication (stakeholders see L1 only)

**3. Framework Contribution**
- Extract patterns from own reflections
- Propose methodology improvements with evidence
- Contribute to pattern library
- Help others troubleshoot

**4. Custom Extensions**
- Create domain-specific adaptations
- Extend methodologies for specialized contexts
- Maintain custom pattern libraries

---

## Part 3: Common Mistakes

### Mistake 1: Skipping Realm3X on Ambiguous Directives

**What Happens**:
- CLEAR plan full of assumptions
- Implementation goes wrong direction
- Multiple rebuild cycles
- User has to correct repeatedly

**Example**:
```
Directive: "Add search feature"

Bad (no Realm3X):
→ Assumes: Full-text search, instant results
→ Builds: Complex Elasticsearch integration
→ User wanted: Simple keyword filter

Good (with Realm3X):
→ Detects ambiguity: What type of search?
→ Generates scenarios: Full-text vs keyword vs faceted
→ Resolves: User clarifies "simple keyword filter"
→ CLEAR plan aligned with actual need
```

**Prevention**: If directive contains vague terms ("improve", "add", "enhance"), run Realm3X first.

---

### Mistake 2: Ignoring CPT

**What Happens**:
- Solutions technically correct but misaligned with product vision
- Features don't fit product theme
- Architecture drifts from philosophy

**Example**:
```
CPT: "Simplicity over sophistication"

Mistake: Semantic UI maps 7 semantic regions with complex transitions
Reality: Violates CPT simplicity mandate

Fix: Reduce to 3 regions, simpler transitions
```

**Prevention**: Always check CPT alignment in Clarity phase. Ask: "Does this serve the Theme Statement?"

---

### Mistake 3: Ledger Amnesia

**What Happens**:
- Repeat work already done
- Lose context between sessions
- Can't answer "what were we working on?"

**Example**:
```
Session 1: Implement feature X, update ledger
Session 2 (new chat): "What should we work on?"
→ Without ledger: Guessing, might repeat work
→ With ledger: READ ledger.json, know exact state
```

**Prevention**: 
- **Before work**: READ ledger
- **After work**: WRITE ledger
- Use kernel.md checklists

---

### Mistake 4: Generic Reflections

**What Happens**:
- Reflections have no value ("went well")
- Can't extract patterns for learning
- Reflection quality score <0.6

**Example**:
```
Bad Reflection:
"Batch completed successfully. Everything worked well."

Good Reflection:
"Batching DB migration with service layer reduced deployment risk - 
atomic rollback possible. Discovered: Migration should run before 
service deployment to avoid schema mismatch. Future: Always sequence 
DB-first in deployment order."
```

**Prevention**: Use template:
```
Outcome: Success/Failure
What worked: [Specific practice]
What discovered: [New insight]
Lesson: [Actionable takeaway]
```

---

### Mistake 5: Methodology Mixing Without Understanding

**What Happens**:
- Use Semantic UI without understanding semantic dimensions
- Apply Atmosphere Synthesis without Semantic UI foundation
- Invoke methodologies randomly ("because they exist")

**Example**:
```
Wrong: "Use Atmosphere Synthesis to make login page blue"
→ Atmosphere requires semantic meaning layer (from Semantic UI)
→ Color is aesthetic choice, not atmospheric

Right: 
1. Semantic UI: Define dimensions (confidence, urgency)
2. Semantic UI: Map regions (login form, error zone)
3. Atmosphere: Synthesize experience from meaning + behavior + expertise
4. Result: Color choices driven by meaning (error = cautious atmosphere = amber)
```

**Prevention**: Study extension integration sections. Understand prerequisites.

---

## Part 4: Quick Reference

### Cheat Sheet: When to Use What

| Situation | Methodology | Command |
|-----------|-------------|---------|
| Ambiguous directive | Realm3X | `archaiforge realm3x analyze` |
| Clear, small task | CLEAR AI (Tier 1) | Inline plan, proceed |
| Complex, multi-file | CLEAR AI (Tier 2) | Full plan, await approval |
| UI design needed | Semantic UI | Load extension, 5-step process |
| Experiential design | Atmosphere Synthesis | After Semantic UI complete |
| Quick fix (<2 lines) | None (Tier 0) | Just do it, update ledger |
| Check compliance | Compliance & Metrics | `archaiforge verify` |
| View metrics | Compliance & Metrics | `archaiforge metrics` |

---

### Decision Tree: Task Classification

```
New Task:
  ├─ "Just fix this typo" → Tier 0 (no plan)
  │
  ├─ "Add validation to form" → Tier 1 (inline CLEAR)
  │   └─ Is it ambiguous? 
  │       ├─ Yes → Realm3X first
  │       └─ No → CLEAR → Execute
  │
  └─ "Build authentication system" → Tier 2 (full CLEAR)
      ├─ Realm3X (resolve scope ambiguity)
      ├─ CLEAR AI (full 5-phase plan)
      ├─ Await approval
      └─ Execute in batches
```

---

### Methodology Prerequisites

```
Atmosphere Synthesis
  ↓ requires
Semantic UI (phases 1-2 complete)
  ↓ may use
Adaptive Persona Synthesis (active persona influences atmosphere)

Realm3X
  ↓ feeds into
CLEAR AI (Clarity phase uses resolved parameters)

All Methodologies
  ↓ align with
CPT (Central Product Theme wins conflicts)
```

---

### Emergency Recovery

**"I broke the framework"**:

1. **Check ledger JSON**:
   ```bash
   cat .archaiforge/ledger.json | jq '.'
   ```
   Fix syntax errors if any

2. **Run verify**:
   ```bash
   archaiforge verify
   ```
   Address each error shown

3. **Reload boot sequence**:
   Ask AI to read: `.archaiforge/context/boot.md`

4. **Verify identity**:
   Ask AI: "What is your identity?"
   Should respond: "⚜️ Archaiforge Intelligence"

5. **Check ledger state**:
   Ask AI: "What is the active plan?"
   Should cite plan from ledger.json

---

## Success Criteria

Practical Guidance is successful when:

- [ ] Beginners can start using framework within 1 week
- [ ] Common mistakes documented and preventable
- [ ] Troubleshooting resolves 80%+ of issues without human help
- [ ] Progressive mastery path clear (beginner → intermediate → advanced)
- [ ] Emergency recovery works when framework "breaks"

---

## Versioning

**Version 1.0 (2025-12-20)**:
- Initial practical guidance
- 5 common troubleshooting scenarios
- Progressive mastery (beginner/intermediate/advanced)
- 5 common mistakes documented
- Quick reference cheat sheets
- Emergency recovery procedures

---

*Practical Guidance makes Archaiforge accessible to beginners while supporting expert mastery.*
