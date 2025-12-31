# The Archaiforge Unified Methodology

> **Version**: 1.0  
> **Purpose**: Complete programming methodology for AI-assisted development  
> **Position**: Core framework binding CLEAR AI, CASCADE, Realm3X, and Bifurcated Cognition

---

## The Four Pillars

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  CLEAR AI          Task Execution Framework                     │
│    ↓               (C → L → E → A → R)                         │
│                                                                 │
│  CASCADE           Entity Derivation Framework                  │
│    ↓               (8 Layers: Semantic → Synthesis)            │
│                                                                 │
│  Realm3X           Uncertainty Navigation Framework             │
│    ↓               (Scenario Analysis)                          │
│                                                                 │
│  Bifurcation       Execution Discipline                         │
│                    (Operator/Scribe/Muse/Critic)                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Each pillar has a specific role. Together, they eliminate:**
- Ambiguity (Realm3X)
- Semantic drift (CASCADE)
- Execution chaos (CLEAR AI)
- Ghost work (Bifurcation)

---

## 1. How They Integrate

### The Outer Loop: CLEAR AI

**CLEAR AI is always active.** Every task flows through its 5 phases:

```
C (Clarity)    → "What are we building?"
L (Limits)     → "What constraints apply?"
E (Examples)   → "What patterns exist?"
A (Adaptation) → "How do we build it?"
R (Reflection) → "Did it work?"
```

**CLEAR AI orchestrates the other frameworks:**
- **C phase**: Invoke Realm3X if request is ambiguous
- **E phase**: Invoke CASCADE if building/analyzing an entity
- **A phase**: Apply Bifurcation (persona switching)
- **R phase**: Scribe validates, logs, checks heartbeat

---

### Integration Layer 1: CLEAR AI + Realm3X

**When**: User request has multiple valid interpretations

**Flow**:
```
User: "Add authentication"

CLEAR - C (Clarity):
  ❓ Ambiguity detected:
     - Session-based auth?
     - Token-based auth?
     - OAuth?
     - Magic link?

  → INVOKE Realm3X

Realm3X:
  Scenario 1: Session-based (stateful, simple, server-managed)
  Scenario 2: JWT (stateless, scalable, client-managed)
  Scenario 3: OAuth (federated, complex, third-party)

  Present trade-offs:
    - Session: Faster for MVP, harder to scale
    - JWT: Stateless, requires refresh token complexity
    - OAuth: Best UX, most complex implementation

  User chooses: "Session-based for now"

CLEAR - C (Clarity) LOCKED:
  ✓ "Build session-based authentication"
  
  → Proceed to L (Limits)
```

**Key**: Realm3X operates *inside* CLEAR's C phase. It doesn't replace CLEAR—it resolves ambiguity *before* CLEAR proceeds.

---

### Integration Layer 2: CLEAR AI + CASCADE

**When**: Building or analyzing an entity (Book, User, Comment, etc.)

**Flow**:
```
User: "Build the Book entity"

CLEAR - C (Clarity):
  ✓ "Create Book entity for library system"

CLEAR - L (Limits):
  ✓ Multi-tenant system
  ✓ PostgreSQL + RLS
  ✓ RESTful API

CLEAR - E (Examples):
  → INVOKE CASCADE

CASCADE Derivation:
  Layer 1 (Semantic):
    - Book belongs to Tenant
    - Book has title, genre, word count
    - Book is listable, creatable, deletable
    
  Layer 2 (Security):
    - ENTAILED: RLS policy required
    - ENTAILED: tenant_id in session
    
  Layer 3 (Storage):
    - ENTAILED: books table with tenant_id FK
    - ENTAILED: indexes on tenant_id
    
  Layer 4 (Contract):
    - ENTAILED: Book, BookCreate, BookListItem types
    - ENTAILED: GET/POST/DELETE endpoints
    
  Layer 5 (Implementation):
    - ENTAILED: Route handlers with RLS context
    
  Layer 6 (Presentation):
    - ENTAILED: BookGrid, BookCard, EmptyState
    
  Layer 7 (Verification):
    - ENTAILED: RLS tests, CRUD tests, E2E journey

  → Output: Complete specification for all layers

CLEAR - A (Adaptation):
  Plan Tasks:
    - Task 1: Implement Layer 3 (Storage)
    - Task 2: Implement Layer 4 (Contract)
    - Task 3: Implement Layer 5 (Implementation) [parallel with 4]
    - Task 4: Implement Layer 6 (Presentation) [parallel with 3,4]
    - Task 5: Implement Layer 7 (Verification)

CLEAR - R (Reflection):
  Validate Entailments:
    ✓ Does storage match Layer 1 properties?
    ✓ Is RLS enabled per Layer 2?
    ✓ Do contracts match Layer 4 spec?
    ✓ Do tests cover all invariants?
```

**Key**: CASCADE operates *inside* CLEAR's E phase. It doesn't replace CLEAR—it provides the derivation methodology for entities.

---

### Integration Layer 3: CLEAR AI + Bifurcation

**When**: Always (execution discipline layer)

**Flow**:
```
CLEAR - C (Clarity):
  Persona: MUSE
    - "What is the essence of this feature?"
    - "How does it serve the product soul?"

CLEAR - L (Limits):
  Persona: CRITIC
    - "What could go wrong?"
    - "What are we missing?"

CLEAR - E (Examples):
  Persona: MUSE + CRITIC
    - Muse: "What patterns carry the soul?"
    - Critic: "Which patterns have gaps?"

CLEAR - A (Adaptation):
  Persona: OPERATOR
    - "Execute the implementation"

CLEAR - R (Reflection):
  Persona: SCRIBE + CRITIC
    - Scribe: "Check heartbeat, validate work, log outcome"
    - Critic: "Audit quality, identify technical debt"
```

**The Heartbeat Protocol (Scribe's Discipline)**:
```
BEFORE every notify_user:
  1. Check .archaiforge/heartbeat/CURRENT_STATUS.md
  2. IF status != HEALTHY:
       → Log work immediately
       → Verify status == HEALTHY
       → THEN proceed
  3. ELSE:
       → Proceed normally
```

**Key**: Bifurcation doesn't replace CLEAR—it assigns personas to each phase, ensuring the right cognitive mode is active.

---

### Integration Layer 4: CASCADE + Bifurcation

**When**: Deriving or validating entity specifications

**Flow**:
```
CASCADE Layer 1 (Semantic):
  Persona: MUSE
    - "What is the essence of this entity?"
    - "What invariants define it?"

CASCADE Layers 2-6 (Derivation):
  Persona: OPERATOR (derives) + CRITIC (validates)
    - Operator: "What does Layer 1 entail for Layer 2?"
    - Critic: "Is this entailment complete?"

CASCADE Layer 7 (Verification):
  Persona: SCRIBE + CRITIC
    - Scribe: "Log the specification before building"
    - Critic: "Do tests cover all entailments?"
```

**Key**: Bifurcation ensures each CASCADE layer is approached with the right mindset.

---

## 2. The Unified Workflow

### Greenfield (New Feature)

```
1. User Request
   ↓
2. CLEAR - C (Clarity)
   IF ambiguous:
     → Realm3X (scenario analysis)
     → User chooses
   ELSE:
     → Proceed

3. CLEAR - L (Limits)
   CRITIC persona:
     - Identify constraints
     - Flag risks

4. CLEAR - E (Examples)
   IF building entity:
     → CASCADE derivation (all 8 layers)
     → MUSE ensures semantic completeness
     → CRITIC validates entailments
   ELSE:
     - Reference existing patterns

5. CLEAR - A (Adaptation)
   OPERATOR persona:
     - Execute tasks (in parallel where possible)
     - CASCADE layers 4-6 can be parallel

6. CLEAR - R (Reflection)
   SCRIBE persona:
     - Check heartbeat
     - Validate outputs against specs
     - Log work (with Time TRIAD)
   CRITIC persona:
     - Audit quality (CCM if applicable)
     - Identify gaps for next iteration
```

---

### Brownfield (Existing Codebase)

```
1. Analyze Request
   ↓
2. CLEAR - C (Clarity)
   MUSE persona:
     - "What is the current state's semantic intent?"

3. CLEAR - E (Examples)
   → Reverse CASCADE:
     - Extract Layer 3 (Storage) from schema
     - Extract Layer 5 (Implementation) from code
     - Extract Layer 6 (Presentation) from UI
     - INFER Layer 1 (Semantic) from artifacts
     - IDENTIFY gaps (missing layers)

4. Document Metamorphosis
   CRITIC persona:
     - Current state vs. entailed state
     - Gap closure plan
     - Temporal roadmap (what changes when)

5. CLEAR - A (Adaptation)
   OPERATOR persona:
     - Execute gap closure
     - Preserve existing soul

6. CLEAR - R (Reflection)
   SCRIBE persona:
     - Log metamorphosis stage
     - Update architecture.md
```

---

## 3. The Decision Tree

**Which framework do I use when?**

```
User Request
  ↓
Is it clear? ────────NO──────► Realm3X (resolve ambiguity)
  ↓ YES                            ↓
  │                            User clarifies
  │                                ↓
  └────────────────────────────────┘
  ↓
Is it an entity? ────YES──────► CASCADE (derive 8 layers)
  ↓ NO                             ↓
  │                            CLEAR - E (use derivation)
  │                                ↓
  └────────────────────────────────┘
  ↓
Execute task ──────────────────► CLEAR AI (5 phases)
  ↓
During execution ─────────────► Bifurcation (persona switching)
  ↓
Before communicating ─────────► Scribe check (heartbeat)
```

---

## 4. The Discipline Stack

**From macro to micro:**

```
LEVEL 1: CLEAR AI
  → Governs all tasks
  → 5-phase loop (C→L→E→A→R)

LEVEL 2: CASCADE
  → Invoked during E phase (for entities)
  → 8-layer derivation (Semantic → Synthesis)

LEVEL 3: Realm3X
  → Invoked during C phase (for ambiguity)
  → Scenario exploration

LEVEL 4: Bifurcation
  → Active throughout all phases
  → Persona switching + heartbeat enforcement
```

**They nest, they don't conflict:**
- CLEAR is the outer loop
- CASCADE and Realm3X are tools CLEAR uses
- Bifurcation is the execution discipline for all three

---

## 5. Why This Works

### Traditional AI-Assisted Development (Failure Mode)

```
User: "Build authentication"
AI: 
  1. Guesses at implementation (maybe JWT? maybe sessions?)
  2. Writes code
  3. User says "no, I wanted OAuth"
  4. AI rewrites everything
  5. Repeat 3-4 times
  6. Final implementation is a Frankenstein of partial attempts
```

**Problems:**
- Ambiguity not resolved upfront (no Realm3X)
- No semantic derivation (no CASCADE)
- No entailment validation (no CLEAR E→R)
- Work not logged (no Bifurcation/Scribe)

---

### Archaiforge Unified Methodology (Success Mode)

```
User: "Build authentication"

CLEAR - C:
  AI (MUSE): "Authentication is ambiguous. Let me present options."
  → Realm3X scenarios
  User chooses: "Session-based"

CLEAR - E:
  AI (MUSE + CRITIC): "Session-based auth is an entity. Deriving CASCADE..."
  → Layer 1: Session belongs to User, expires_at, token
  → Layer 2: Must be secure (httpOnly cookies)
  → Layer 3: sessions table
  → Layer 4: SessionAPI contract
  → Layer 5: Login/logout routes
  → Layer 6: Login form, session state indicator
  → Layer 7: Session hijacking tests, expiry tests

CLEAR - A:
  AI (OPERATOR): "Building layers 3,4,5,6 in parallel..."
  (Work proceeds)

CLEAR - R:
  AI (SCRIBE): "Checking heartbeat... HEALTHY"
  AI (SCRIBE): "Logging: Built session authentication per CASCADE spec"
  AI (CRITIC): "Audit: All 7 layers implemented. CCM: 9.2/10"
```

**Result:**
- No rework (ambiguity resolved upfront)
- Semantic coherence (CASCADE derivation)
- Complete implementation (all entailments satisfied)
- Logged work (visible progress)

---

## 6. Codifying the Methodology

### For New Agents

**Boot Sequence Addition:**

```markdown
## UNIFIED METHODOLOGY

You operate using four integrated frameworks:

1. **CLEAR AI** (Outer Loop)
   - All tasks flow through C→L→E→A→R
   - Read: `.archaiforge/extensions/clear_ai.md`

2. **CASCADE** (Entity Derivation)
   - Invoked during E phase for entities
   - 8 layers: Semantic → Security → Storage → Contract → Implementation → Presentation → Verification → Synthesis
   - Read: `.archaiforge/extensions/cascade.md`

3. **Realm3X** (Ambiguity Resolution)
   - Invoked during C phase for unclear requests
   - Read: `.archaiforge/extensions/realm3x.md`

4. **Bifurcated Cognition** (Execution Discipline)
   - Active throughout all phases
   - Read: `.archaiforge/extensions/dual_cognition.md`
   - CRITICAL: Heartbeat enforcement before notify_user

**Integration Rules:**
- Never skip CLEAR phases
- Always invoke CASCADE for entities
- Always resolve ambiguity with Realm3X
- Always check heartbeat before notify_user
```

---

### For Existing Projects

**Migration Path:**

```yaml
Phase 1: Reverse CASCADE
  - Analyze existing codebase
  - Extract semantic axioms (Layer 1)
  - Identify entailment gaps
  - Document in metamorphosis.md

Phase 2: Formalize CLEAR
  - Adopt CLEAR for all new tasks
  - Retrofit past decisions into ledger
  - Update task.md with CLEAR phases

Phase 3: Integrate Realm3X
  - Identify ambiguous areas
  - Run scenario analysis
  - Document choices in boundaries.yaml

Phase 4: Enforce Bifurcation
  - Activate heartbeat daemon
  - Enforce logging discipline
  - Adopt persona switching
```

---

## 7. The Promise

**With the Unified Methodology:**

```
✓ No more ghost work (Bifurcation/Scribe)
✓ No more semantic drift (CASCADE entailments)
✓ No more rework from ambiguity (Realm3X)
✓ No more execution chaos (CLEAR AI phases)
✓ No more "it works but..."
```

**This is not AI assistance. This is AI partnership.**

The AI becomes:
- MUSE (semantic guardian)
- CRITIC (quality auditor)
- OPERATOR (tireless builder)
- SCRIBE (disciplined logger)

The human becomes:
- Meta-Director (sets vision)
- Chooser (resolves ambiguity)
- Validator (approves plans)

---

## 8. Next Steps

To fully codify this:

1. **Write formal extensions:**
   - `cascade.md` (this document exists in truncated summary)
   - Update `clear_ai.md` to reference CASCADE
   - Update `realm3x.md` to reference CLEAR integration
   - Update `dual_cognition.md` to reference all three

2. **Update boot.md:**
   - Add "Unified Methodology" section
   - Reference integration rules
   - Make mandatory for all sessions

3. **Create examples:**
   - Greenfield walkthrough (new entity from scratch)
   - Brownfield walkthrough (reverse CASCADE on existing code)
   - Ambiguity resolution walkthrough (Realm3X in C phase)

4. **Verify with stress test:**
   - Build complex entity (e.g., "Collaboration System")
   - Use full methodology
   - Audit against CCM
   - Measure Time TRIAD improvement

---

**This is the methodology that makes Archaiforge a Cognitive OS, not just a tool.**
