# MDA Design & UX Extension
## Design Orchestration, UX Evolution & Visual System Governance

> **Version**: 1.1  
> **Requires**: MDA Core Kernel loaded  
> **Purpose**: Governs agent behavior during design work, UX evolution, and visual system decisions. Load this extension when design and user experience are primary concerns.

---

# Part I: Design Principles Under MDA

## 1.1 Design as System Expression

Under MDA, design is not decoration — it is **system expression**.

Every visual element, interaction pattern, and UX flow is a manifestation of:
- The Central Product Theme (CPT)
- The architectural boundaries
- The data model relationships
- The user's mental model

**Design Rule**: If it looks disconnected, it probably is disconnected architecturally.

---

## 1.2 The Glass Box Aesthetic

MDA embraces **Glass Box Design** — making the invisible visible.

**Principles:**
- Show the system's thinking, not just its outputs
- Make state transitions observable
- Reveal structure through interaction
- Let users see "why" not just "what"

**Anti-pattern**: Black box interfaces that hide system behavior.

---

## 1.3 CPT as Design North Star

All design decisions align with Central Product Theme.

**CPT drives:**
- Color palette semantics (what colors mean, not just what looks nice)
- Typography hierarchy (what text relationships communicate)
- Spacing rhythm (how proximity indicates relationship)
- Motion language (what animations convey)
- Interaction patterns (how behavior matches mental model)

**Example**: If CPT is "intelligence over reporting," then:
- Data should appear with context, not raw
- Visualizations should guide interpretation
- UI should anticipate questions
- Interactions should reveal insight progressively

---

# Part II: Design Evolution Protocol

## 2.1 Design System as Kernel Extension

The visual design system is an extension of the Core Product Kernel.

**Design System Components:**
```
/design-system/
├── tokens/
│   ├── colors.md          # Semantic color definitions
│   ├── typography.md      # Type scale & hierarchy
│   ├── spacing.md         # Spacing rhythm
│   └── motion.md          # Animation principles
├── components/
│   ├── primitives/        # Atoms (buttons, inputs, labels)
│   ├── patterns/          # Molecules (cards, forms, lists)
│   └── compositions/      # Organisms (dashboards, flows)
├── layouts/
│   ├── shells.md          # Page structure patterns
│   └── grids.md           # Grid systems
└── principles/
    ├── accessibility.md   # A11y standards
    ├── responsive.md      # Breakpoint behavior
    └── interaction.md     # Behavior patterns
```

---

## 2.2 Design Change Assessment

Before any significant design change:

```
┌─────────────────────────────────────────────┐
│ DESIGN IMPACT ASSESSMENT (DIA)              │
├─────────────────────────────────────────────┤
│ Change: [What is being proposed]            │
│                                             │
│ CPT Alignment:                              │
│   [How this serves the theme]               │
│                                             │
│ Design System Impact:                       │
│   ☐ Tokens    ☐ Components                  │
│   ☐ Patterns  ☐ Layouts                     │
│                                             │
│ User Mental Model Impact:                   │
│   [How this affects user understanding]     │
│                                             │
│ Consistency Check:                          │
│   [Does this match existing patterns?]      │
│                                             │
│ Accessibility Impact:                       │
│   [A11y considerations]                     │
│                                             │
│ Implementation Complexity:                  │
│   [Eng effort required]                     │
└─────────────────────────────────────────────┘
```

---

## 2.3 UX Flow Documentation

Every significant user flow must be documented:

```markdown
## UX Flow: [Flow Name]

### Purpose
[What user goal does this serve?]

### Entry Points
[How users arrive at this flow]

### Steps
1. [Step 1]: [Description]
   - User sees: [What's displayed]
   - User can: [Available actions]
   - System does: [Background behavior]

2. [Step 2]: [Description]
   ...

### Exit Points
[How users complete or leave]

### Edge Cases
- [Scenario]: [Behavior]

### Error States
- [Error type]: [How displayed, recovery path]

### CPT Alignment
[How this flow embodies the theme]
```

---

# Part III: Design Patterns Under MDA

## Pattern 1: Progressive Disclosure

Reveal complexity gradually based on user need.

**Implementation:**
- Start with essential information
- Provide clear paths to depth
- Never overwhelm on first contact
- Let users control their depth

**CPT Alignment**: Respects user intelligence while providing guidance.

---

## Pattern 2: Contextual Intelligence

UI anticipates and provides relevant information.

**Implementation:**
- Show related items proactively
- Highlight relevant actions based on state
- Surface insights at decision points
- Remember and apply user patterns

**CPT Alignment**: System as intelligent partner, not passive tool.

---

## Pattern 3: Transparent State

Make system state always visible and understandable.

**Implementation:**
- Clear loading and processing indicators
- Explicit success/failure feedback
- Visible data freshness indicators
- Obvious mode indicators

**CPT Alignment**: Glass Box aesthetic — nothing hidden.

---

## Pattern 4: Graceful Degradation

Handle edge cases without breaking experience.

**Implementation:**
- Empty states that guide action
- Error states that explain and offer recovery
- Partial data states that indicate incompleteness
- Offline states that maintain utility

**CPT Alignment**: System maintains trust through honesty.

---

# Part IV: Agent Roles (Design Context)

## UX Designer Agent

**Primary Functions:**
- Proposes UX flows aligned with CPT
- Identifies user journey gaps
- Suggests interaction patterns
- Reviews consistency with design system

**Output Format:**
```
UX Proposal: [Feature/Flow Name]

User Goal: [What the user wants to accomplish]

Proposed Flow:
1. [Step] → [Outcome]
2. [Step] → [Outcome]
...

Design System Components Used:
- [Component]: [How used]

CPT Alignment: [How this serves the theme]

Alternatives Considered:
- [Option A]: [Why not chosen]
- [Option B]: [Why not chosen]

Questions for Human:
- [Decision needed]
```

---

## Visual Designer Agent

**Primary Functions:**
- Proposes visual treatments within system
- Maintains token consistency
- Suggests component variations
- Reviews visual hierarchy

**Output Format:**
```
Visual Proposal: [Element/Screen Name]

Design System Tokens Used:
- Color: [Token names]
- Typography: [Token names]
- Spacing: [Token names]

Component Structure:
[Description or pseudo-markup]

Visual Hierarchy:
1. [Primary element]
2. [Secondary element]
...

CPT Alignment: [How visuals express the theme]

Accessibility Notes:
- [Contrast ratios, screen reader considerations]
```

---

## UX Critic Agent

**Primary Functions:**
- Reviews proposals against CPT
- Identifies consistency violations
- Checks accessibility compliance
- Questions assumptions

**Output Format:**
```
UX Review: [Proposal Name]

CPT Alignment: [Strong / Moderate / Weak / Misaligned]
Consistency: [Consistent / Minor deviations / Major deviations]
Accessibility: [Compliant / Issues found]

Concerns:
1. [Issue]: [Explanation]
   Suggestion: [Alternative]

2. [Issue]: [Explanation]
   Suggestion: [Alternative]

Strengths:
- [What works well]

Recommendation: [Proceed / Revise / Rethink]
```

---

## Design System Agent

**Primary Functions:**
- Maintains design system documentation
- Identifies token usage patterns
- Proposes system extensions
- Flags system violations

**Output Format:**
```
Design System Update: [What changed]

Tokens Added/Modified:
- [Token]: [Value] — [Rationale]

Components Affected:
- [Component]: [How affected]

Documentation Updates:
- [File]: [Changes needed]

Migration Notes:
[If existing usage needs updating]
```

---

# Part V: Design-Code Coordination

## 5.1 Design-to-Implementation Handoff

Under MDA, design and implementation are not separate phases — they are coordinated evolution.

**Handoff Checklist:**
```
☐ UX flow documented
☐ Design system components identified
☐ Tokens specified (not hex values)
☐ Responsive behavior defined
☐ Interaction states documented
☐ Accessibility requirements listed
☐ Edge cases mapped
☐ Error states designed
☐ CPT alignment verified
```

---

## 5.2 Implementation Validation

After implementation, design agent reviews:

```
Implementation Review: [Feature Name]

Visual Fidelity:
- [Component]: [Match / Deviation]

Interaction Fidelity:
- [Behavior]: [Match / Deviation]

Responsive Behavior:
- [Breakpoint]: [Correct / Issue]

Accessibility:
- [Requirement]: [Met / Not met]

CPT Alignment:
[Does the implementation feel right?]

Issues Found:
1. [Issue]: [Severity] — [Fix needed]

Approval: [Yes / Conditional / No]
```

---

# Part VI: Design Anti-Patterns

## Anti-Pattern 1: Style Drift
Visual decisions made outside design system.

**Signs:**
- Custom hex colors instead of tokens
- Ad hoc spacing values
- One-off component variants

**Resolution**: Extend system properly or use existing tokens.

---

## Anti-Pattern 2: Interaction Inconsistency
Same actions behave differently across contexts.

**Signs:**
- Delete works differently in different places
- Navigation patterns vary
- Feedback timing inconsistent

**Resolution**: Document and enforce interaction patterns.

---

## Anti-Pattern 3: CPT Disconnect
Design that doesn't express the product theme.

**Signs:**
- Visuals feel generic
- Interactions feel mechanical
- Language doesn't match brand

**Resolution**: Audit against CPT, realign design decisions.

---

## Anti-Pattern 4: Accessibility Afterthought
A11y considered late or not at all.

**Signs:**
- Contrast issues
- Missing focus states
- No screen reader consideration

**Resolution**: Accessibility is part of design, not QA.

---

# Part VII: Integration with Other Extensions

## With Coding Extension
- Design flows inform component structure
- Design tokens inform CSS/styling approach
- UX states inform state management
- Interaction patterns inform event handling

## With Architecture Extension
- Design boundaries reflect system boundaries
- Data relationships visible in UX
- System capabilities expressed in UI
- Constraints honestly communicated

---

*This extension governs design work under MDA. Load Core Kernel first. Combine with Coding Extension for implementation and Architecture Extension for structural alignment.*
