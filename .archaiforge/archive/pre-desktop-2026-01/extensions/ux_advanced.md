# MDA UX & Design Advanced Extension
## AIM Integration + Semantic Studio Method

> **Version**: 3.0  
> **Requires**: MDA Core Kernel loaded  
> **Purpose**: Governs comprehensive UX design using AIM (Actors, Interactions, Motivations) methodology and Semantic Studio Method for adaptive, meaning-driven interfaces. Load this extension when designing user experiences, workflows, or adaptive systems.
> **Supersedes**: Version 2.0 (JTBD-based)

---

# Part I: Philosophical Foundation

## 1.1 The Three-Layer Design Philosophy

**MDA Design operates on a fundamental hierarchy:**

```
┌─────────────────────────────────────────────┐
│         MEANING (What & Why)                │
│    AIM → Actor Intent & Context             │
├─────────────────────────────────────────────┤
│         STRUCTURE (How)                     │
│    Semantic Rails → Information Architecture│
├─────────────────────────────────────────────┤
│         SURFACE (Visual Expression)         │
│    Canon → Visual Design System             │
└─────────────────────────────────────────────┘
```

### Core Principle

> **Meaning comes first. Structure comes second. Style comes last.**

This prevents:
- Feature-driven design (solution before problem)
- Style-first approaches (decoration before function)
- Pattern copying (form without understanding)
- Random UI decisions (no semantic grounding)

---

## 1.2 AIM as Design Foundation

Every interface exists within an **actor system** where people perform **interactions** driven by **motivations**.

**AIM Framework:**

```
ACTOR (Who)
├── Role & Context
├── Capabilities & Constraints
└── Mental Models

INTERACTION (What)
├── Triggers & Entry Points
├── Actions & Decisions
└── Outcomes & State Changes

MOTIVATION (Why)
├── Goals & Objectives
├── Emotional Drivers
└── Success Criteria
```

**Example:**
- ❌ Bad: "I need a dashboard"
- ✅ Good: 
  - **Actor**: Operations manager starting shift
  - **Interaction**: Scanning system health metrics to triage issues
  - **Motivation**: Minimize downtime, protect team from escalations, maintain confidence

---

## 1.3 Semantic Studio Method (SSM) Integration

SSM provides the **structural layer** between meaning and surface:

1. **Canon** — Immutable world constraints (palette, metaphors, materials)
2. **Semantic Rails** — Meaning-based UI components (not visual patterns)
3. **Persona + Mode** — Behavioral system that determines tone and layout

**This creates:**
- Consistent interfaces across contexts
- Adaptive behavior without arbitrary changes
- Clear separation of concerns
- Machine-readable design systems

---

# Part II: The CLEAR AI UX Framework

## 2.1 CLEAR for UX Design

MDA applies CLEAR methodology to UX work:

| Phase | UX Role | Mission | Output |
|-------|---------|---------|--------|
| **C — Clarity** | AIM Systems Architect | Map actors, interactions, motivations | AIM model + scope |
| **L — Limits** | Interaction Constraint Analyst | Identify constraints & dependencies | Constraint matrix |
| **E — Examples** | Semantic Rails Designer | Design semantic rails + flows | Rail library + flows |
| **A — Adaptation** | Journey Integration Architect | Synthesize into cohesive system | Integration specs |
| **R — Reflection** | Experience Validation Expert | Validate effectiveness | Success assessment |

---

## 2.2 Phase Breakdown

### C — CLARITY: AIM Mapping & Scope

#### Mandatory Actor Analysis

```markdown
## Actor Profile

**Identity:**
- Role: [Job title or user type]
- Context: [When/where they interact with system]
- Frequency: [Daily/Weekly/Monthly/Occasional]
- Experience level: [Novice/Intermediate/Expert]

**Capabilities:**
- Technical skills: [What they know]
- Domain expertise: [Field knowledge]
- Tool proficiency: [Related systems]

**Constraints:**
- Time pressure: [How rushed are they]
- Cognitive load: [Mental capacity available]
- Physical context: [Device, location, distractions]
- Authority: [What can they decide/change]

**Mental Models:**
- Expectations: [What they think system does]
- Analogies: [What familiar systems they reference]
- Blind spots: [What they misunderstand]
```

#### Interaction Mapping

```markdown
## Interaction: [Name]

**Trigger:**
- Event: [What initiates this]
- Frequency: [How often]
- Urgency: [Time sensitivity]

**Entry Points:**
- Primary: [Main path to start]
- Secondary: [Alternative paths]
- Edge cases: [Unusual entries]

**Action Sequence:**
1. [First action] → [System response]
2. [Next action] → [System response]
3. [Decision point] → [Branches]

**Outcomes:**
- Success: [Desired end state]
- Partial: [Incomplete but useful]
- Failure: [Error states]

**State Changes:**
- Actor state: [What changes for user]
- System state: [What persists]
- World state: [External impacts]
```

#### Motivation Analysis

```markdown
## Motivation Profile

**Primary Goal:**
[What actor ultimately wants to achieve]

**Functional Drivers:**
- Efficiency: [Save time/effort]
- Accuracy: [Reduce errors]
- Control: [Make decisions]
- Understanding: [Learn/verify]

**Emotional Drivers:**
- Confidence: [Feel secure in choices]
- Autonomy: [Maintain independence]
- Mastery: [Demonstrate competence]
- Connection: [Coordinate with others]

**Success Criteria:**
- Measurable: [Quantitative outcomes]
- Felt: [Emotional satisfaction]
- Social: [Impact on others]
- Strategic: [Long-term value]

**Failure Consequences:**
- Immediate: [What breaks now]
- Ripple: [Downstream effects]
- Emotional: [How actor feels]
- Political: [Stakeholder impact]
```

#### AIM Context Mapping

| Context Factor | Analysis | Interaction Impact | Design Implications |
|----------------|----------|-------------------|---------------------|
| **Environment** | Where does interaction happen? | Access patterns | Responsive needs |
| **Actor State** | Mental/emotional condition? | Cognitive load | Information density |
| **Dependencies** | What must exist first? | Sequencing | State management |
| **Constraints** | What limits actor? | Error handling | Guardrails needed |
| **Stakeholders** | Who else is affected? | Communication | Notification needs |

---

### L — LIMITS: Interaction Constraints

#### Constraint Analysis Template

```markdown
## Actor Constraints
- Cognitive bandwidth: [How much can actor process]
- Skill prerequisites: [Required expertise]
- Time budget: [How long will they spend]
- Device/context: [Mobile/desktop/both, interruptions]
- Decision authority: [What they can/cannot do]

## Interaction Constraints
- Sequence dependencies: [What must happen before]
- Data availability: [What exists when]
- Real-time requirements: [Speed expectations]
- Reversibility: [Can actions be undone]
- Validation needs: [What must be checked]

## System Constraints
- Technical capabilities: [What tech can/can't do]
- Performance limits: [Speed, scale, load]
- API dependencies: [External services required]
- State management: [How data persists]

## Business Constraints
- Legal/compliance: [Regulations to follow]
- Brand guidelines: [Non-negotiable elements]
- Resource limits: [Dev time, budget]
- Stakeholder needs: [Political requirements]

## Dependency Map
[Visual diagram showing interaction dependencies]
```

---

### E — EXAMPLES: Semantic Rails Design

#### What Are Semantic Rails?

**Rails are meaning-based UI units that support specific actor interactions.**

```json
{
  "rail": "session_header",
  "actor_need": "maintain_context_awareness",
  "interaction": "orient_to_current_state",
  "pattern": "sticky_banner",
  "inputs": ["actor_identity", "current_mode", "session_time"],
  "allowed_personas": ["all"]
}
```

#### Common Rail Types

| Rail | Actor Need | Interaction Supported |
|------|------------|----------------------|
| `session_header` | Know where I am | Orient to context |
| `mode_pills` | Switch between tasks | Change work mode |
| `chat_stream` | Have conversation | Exchange messages |
| `report_body` | Understand findings | Review analysis |
| `swatch_metrics` | Monitor status | Scan system health |
| `timeline` | Track events | See history |
| `scene_tiles` | Navigate contexts | Move between areas |
| `composer` | Create content | Input/compose |
| `footer_actions` | Commit decisions | Execute/cancel |

#### Rail Design Template

```markdown
## Rail: [Name]

**Actor Need:** [What does the actor need to accomplish]

**Interaction Supported:**
- Primary: [Main action this enables]
- Secondary: [Additional actions]

**Information Provided:**
- [Data point 1]: [Why actor needs this]
- [Data point 2]: [Why actor needs this]

**Actions Enabled:**
- [Action 1]: [Outcome + motivation]
- [Action 2]: [Outcome + motivation]

**States:**
- Empty: [When no data, what actor sees]
- Loading: [During fetch, maintains confidence]
- Populated: [With data, enables action]
- Error: [On failure, provides recovery path]

**Actor Personas:** [Which actor types use this rail]

**Motivation Alignment:**
[How this rail serves actor motivations]

**Implementation Pattern:** [Visual pattern name]
```

---

### A — ADAPTATION: Journey Integration

#### Cross-Rail Orchestration

**Modes define which rails are active for specific actor tasks:**

```json
{
  "modes": {
    "chat": {
      "actor_task": "conversational_problem_solving",
      "rails": ["session_header", "mode_pills", "chat_stream", "composer"],
      "motivation": "get_answers_quickly"
    },
    "report": {
      "actor_task": "review_analyzed_information",
      "rails": ["session_header", "report_body", "swatch_metrics", "timeline"],
      "motivation": "understand_and_decide"
    },
    "studio": {
      "actor_task": "create_and_refine_artifacts",
      "rails": ["session_header", "scene_tiles", "composer", "footer_actions"],
      "motivation": "produce_quality_output"
    }
  }
}
```

#### Actor Journey Specification

```markdown
## Actor Journey: [Name]

**Actor Profile:** [Who is performing this journey]

**Motivation:** [Why they're doing this]

**Entry Point:** [How actor arrives]

**Journey Flow:**
1. **Interaction 1:** [Actor action]
   - Motivation: [Why they do this]
   - Rails active: [List]
   - State changes: [What updates]
   - Decision point: [What actor decides next]
   - Next: [Where they can go]

2. **Interaction 2:** [Next action]
   - Motivation: [Why they do this]
   - Rails active: [List]
   - State changes: [What updates]
   - Decision point: [What actor decides next]
   - Next: [Where they can go]

**Exit Points:**
- Success: [Actor achieves goal, ends at...]
- Partial: [Actor gets some value, ends at...]
- Abandon: [Actor quits, ends at...]
- Error: [System fails, actor redirected to...]

**Cross-Journey Integration:**
- [How this connects to other actor journeys]
- [Shared state/context between journeys]

**Motivation Satisfaction:**
[How this journey fulfills actor motivations]
```

---

### R — REFLECTION: Validation

#### Success Criteria Checklist

```markdown
## Actor Success Validation

### Interaction Success
☐ Actor can complete primary interaction
☐ All action sequences are logical
☐ Dependencies are clear and handled
☐ Error recovery paths exist

### Motivation Satisfaction
☐ Primary goal is achievable
☐ Emotional drivers are addressed
☐ Actor feels confident during process
☐ Success is clearly signaled

### Constraint Compliance
☐ Cognitive load is manageable
☐ Time budget is respected
☐ Technical constraints honored
☐ Business rules enforced

### Context Appropriateness
☐ Works in actor's environment
☐ Adapts to actor's state
☐ Handles interruptions gracefully
☐ Accessible to all actors

### Stakeholder Impact
☐ Coordination is enabled
☐ Communication is supported
☐ Downstream effects are positive
☐ Political considerations met

### System Health
☐ Performance is acceptable
☐ Error handling complete
☐ State management robust
☐ Scalability verified
```

---

# Part III: Semantic Studio Method (SSM) Implementation

## 3.1 The Canon Layer

**Canon defines immutable properties of your product world.**

### Canon Components

```json
{
  "world": "product_name",
  "palette": {
    "primary": ["#color1", "#color2"],
    "secondary": ["#color3", "#color4"],
    "accent": ["#color5", "#color6"]
  },
  "materials": [
    "glass",
    "soft shadows",
    "rounded corners",
    "breathing animations"
  ],
  "metaphors": [
    "workspace",
    "canvas",
    "conversation"
  ],
  "constraints": [
    "no overwhelming data walls",
    "always show progress",
    "error messages are friendly"
  ],
  "layout_archetype": "workspace_with_sidebars"
}
```

### Canon Template

```markdown
## Product Canon: [Name]

**World Identity:**
[One sentence describing the product's essence]

**Palette Families:**
- **Primary**: [Colors] → [Meaning: what they represent]
- **Secondary**: [Colors] → [Meaning]
- **Accent**: [Colors] → [Meaning]
- **Semantic**: [Colors] → [Meaning: success, error, warning, info]

**Material Language:**
[What textures, surfaces, depth, motion define this world]

**Core Metaphors:**
[What real-world concepts does the interface borrow from]

**Non-Negotiable Constraints:**
[What must NEVER happen in this interface]

**Layout Archetype:**
[Fundamental spatial structure]

**CPT Alignment:**
[How canon serves Central Product Theme]
```

---

## 3.2 The Rails Layer

### Rail Library Structure

```
/rails/
├── navigation/
│   ├── session_header.json
│   ├── mode_pills.json
│   └── breadcrumbs.json
├── content/
│   ├── chat_stream.json
│   ├── report_body.json
│   └── data_table.json
├── input/
│   ├── composer.json
│   ├── search_bar.json
│   └── filters.json
├── feedback/
│   ├── swatch_metrics.json
│   ├── progress_indicator.json
│   └── notifications.json
└── actions/
    ├── footer_actions.json
    ├── context_menu.json
    └── quick_actions.json
```

### Rail Specification Schema

```json
{
  "rail_id": "string",
  "actor_need": "string",
  "interaction_supported": "string",
  "category": "navigation|content|input|feedback|actions",
  "information": ["data_point_1", "data_point_2"],
  "actions": [
    {
      "action": "action_name",
      "outcome": "what_happens",
      "motivation": "why_actor_does_this",
      "conditions": "when_available"
    }
  ],
  "states": {
    "empty": "description",
    "loading": "description",
    "populated": "description",
    "error": "description"
  },
  "personas": ["persona_1", "persona_2"],
  "visual_pattern": "pattern_name",
  "dependencies": ["other_rail_ids"]
}
```

---

## 3.3 The Persona + Mode Layer

### Persona Definition

**Persona = behavioral style based on actor characteristics.**

```json
{
  "persona": "analyst",
  "actor_profile": "data-focused professional under time pressure",
  "tone": "precise, objective, efficient",
  "density": {
    "chat_stream": "high",
    "report_body": "very_high",
    "swatch_metrics": "medium"
  },
  "language_style": {
    "sentence_length": "short",
    "technical_depth": "high",
    "metaphor_use": "low",
    "emotional_language": "minimal"
  },
  "interaction_pace": "fast",
  "information_priority": [
    "data_accuracy",
    "actionable_insights",
    "trend_patterns",
    "anomaly_detection"
  ],
  "motivation_alignment": {
    "efficiency": "high",
    "confidence": "high",
    "mastery": "medium"
  }
}
```

### Mode Configuration

```json
{
  "mode": "chat",
  "actor_task": "conversational_problem_solving",
  "motivation_served": "get_quick_answers_with_confidence",
  "rails_active": [
    "session_header",
    "mode_pills",
    "chat_stream",
    "composer"
  ],
  "rail_order": ["session_header", "mode_pills", "chat_stream", "composer"],
  "layout_structure": "vertical_stack",
  "focus_rail": "chat_stream",
  "transitions": {
    "to_report": "fade_swap",
    "to_studio": "slide_left"
  },
  "actor_expectations": "immediate_response_with_context"
}
```

### Persona Template

```markdown
## Persona: [Name]

**Actor Profile:**
[Who this persona represents in terms of role and context]

**Behavioral Identity:**
[Interaction style and approach]

**Tone:**
[Adjectives describing communication style]

**Information Density Preferences:**
| Rail | Density | Rationale (Actor Need) |
|------|---------|------------------------|
| [Rail 1] | High | [Why this serves actor] |
| [Rail 2] | Medium | [Why this serves actor] |

**Language Style:**
- Sentence length: [Short/Medium/Long]
- Technical depth: [High/Medium/Low]
- Metaphor use: [Heavy/Moderate/Light]
- Emotional language: [High/Medium/Low]

**Interaction Pace:** [Fast/Medium/Slow]

**Information Priority:**
1. [What actor needs first]
2. [Second priority]
3. [Third priority]

**Motivation Alignment:**
| Motivation | Importance | How Persona Serves This |
|------------|------------|-------------------------|
| Efficiency | High | [Specific behaviors] |
| Confidence | Medium | [Specific behaviors] |

**Modes Supported:**
- [Mode 1]: [Rails + layout + actor task]
- [Mode 2]: [Rails + layout + actor task]
```

---

# Part IV: The SSM Decision Sequence

## 4.1 Mandatory Processing Order

```
1. CANON PASS
   ↓ Lock world constraints
2. AIM PASS
   ↓ Map actors, interactions, motivations
3. RAIL SELECTION PASS
   ↓ Choose semantic units by actor needs
4. PERSONA PASS
   ↓ Apply behavioral style for actor type
5. MODE PASS
   ↓ Determine active rails + sequence for task
6. SURFACE RENDERING PASS
   ↓ Apply visual design
```

**AI must NEVER:**
- Skip to surface rendering
- Choose rails before understanding actors
- Change canon based on mode
- Render UI before defining actor interactions

---

## 4.2 Decision Tree Example

```
User Request: "Design a dashboard for monitoring system health"

Step 1 — CANON PASS
→ Load product canon
→ Confirm palette, materials, constraints
→ Lock in: "trust_through_transparency" CPT

Step 2 — AIM PASS
→ Actor: Operations manager, experienced, high time pressure
→ Interaction: Scanning system health at shift start to triage issues
→ Motivation: Minimize downtime, protect team, maintain confidence
→ Context: High-stress, 2-3 minutes available, needs to brief team
→ Success: Identify critical issues fast, feel confident in assessment

Step 3 — RAIL SELECTION
→ session_header (maintain context awareness)
→ swatch_metrics (scan health at a glance)
→ timeline (see recent events for pattern detection)
→ data_table (detailed issue review if needed)
→ quick_actions (immediate response to critical issues)

Step 4 — PERSONA PASS
→ Persona: "ops_responder" (fast, action-oriented, confident)
→ Density: High for metrics (actor can process quickly), medium for details
→ Language: Urgent, clear, action-focused
→ Motivation alignment: Efficiency=HIGH, Confidence=HIGH, Control=HIGH

Step 5 — MODE PASS
→ Mode: "dashboard"
→ Actor task: "rapid_health_assessment"
→ Rails active: All selected above
→ Focus: swatch_metrics (primary actor interaction)
→ Layout: Two-column, metrics left (scan first), details right (drill when needed)

Step 6 — SURFACE RENDERING
→ Apply canon palette
→ Use material language (glass cards, soft shadows)
→ Implement visual patterns for each rail
→ Ensure swatch_metrics draws eye first (actor priority)
```

---

# Part V: Agent Roles (Advanced UX Context)

## AIM Systems Architect Agent

**Primary Functions:**
- Maps actor profiles and contexts
- Decomposes interactions into sequences
- Analyzes motivation hierarchies
- Links AIM to business outcomes

**Output Format:**
```markdown
## AIM Analysis: [Feature/System]

**Actor Profile:**
- Role: [Who they are]
- Context: [When/where they interact]
- Constraints: [What limits them]
- Mental models: [What they expect]

**Interaction Map:**
- Trigger: [What initiates]
- Sequence: [Step-by-step actions]
- Outcomes: [Success/failure states]
- State changes: [What persists]

**Motivation Analysis:**
- Goals: [What they want]
- Emotional drivers: [How they feel]
- Success criteria: [How they measure]
- Failure consequences: [What they fear]

**Success Metrics:**
- Interaction completion: [Measurable]
- Motivation satisfaction: [Felt experience]
- Stakeholder impact: [Ripple effects]
- Business value: [ROI pathway]
```

---

## Semantic Rails Designer Agent

**Primary Functions:**
- Defines rail library based on actor needs
- Maps rails to interaction patterns
- Specifies rail states and behaviors
- Documents rail dependencies

**Output Format:**
```json
{
  "rail_library": [
    {
      "rail": "name",
      "actor_need": "what_actor_needs",
      "interaction_supported": "what_actor_does",
      "pattern": "visual_implementation",
      "states": {},
      "personas": [],
      "motivations_served": []
    }
  ]
}
```

---

## Persona Orchestration Agent

**Primary Functions:**
- Defines persona behavioral profiles based on actor types
- Maps personas to actor segments
- Configures density and tone for actor needs
- Specifies mode configurations for actor tasks

**Output Format:**
```markdown
## Persona Profile: [Name]

**Actor Representation:** [Who this persona serves]

**Behavioral Identity:** [How they interact]

**Density Matrix:**
| Rail | Density | Actor Need Served |
|------|---------|-------------------|

**Modes:**
| Mode | Actor Task | Rails | Focus | Motivation |
|------|------------|-------|-------|------------|

**Language Style:** [Specifications aligned to actor]

**Motivation Alignment:** [How persona serves actor motivations]
```

---

## Journey Integration Architect Agent

**Primary Functions:**
- Orchestrates multi-rail actor journeys
- Maps cross-journey dependencies
- Designs mode transitions for actor task switching
- Specifies state management for actor context

**Output Format:**
```markdown
## Actor Journey Map: [Name]

**Actor:** [Who performs this journey]

**Motivation:** [Why they do this]

**Flow:**
[Step-by-step with actor actions, motivations, rails active at each step]

**State Transitions:**
[How data flows to maintain actor context]

**Integration Points:**
[How this journey connects to other actor journeys]

**Implementation Specs:**
[Technical requirements for developers]
```

---

# Part VI: Integration with Other MDA Extensions

## 6.1 With Coding Extension

```markdown
## AIM → Code Translation

**From UX:**
- Rail specifications → Component architecture
- Persona configurations → Behavior logic
- Mode definitions → State management
- Actor journeys → Route configuration
- Interaction sequences → Event handlers

**To Implementation:**
- Rails become React components
- Personas configure component props
- Modes trigger layout switches
- Journeys define navigation logic
- Actor state informs data fetching
```

---

## 6.2 With Architecture Extension

```markdown
## AIM → Architecture Alignment

**From UX:**
- Actor needs map to API endpoints
- Interaction decomposition reveals service boundaries
- State management needs inform data architecture
- Performance constraints guide technical decisions
- Motivation analysis reveals non-functional requirements

**To Architecture:**
- Each rail has data source
- Actor interactions require specific services
- State transitions need event bus
- Real-time needs require WebSocket
- Actor constraints inform caching strategy
```

---

# Part VII: Practical Examples

## 7.1 Example: Analytics Dashboard

### AIM Analysis

```markdown
**Actor Profile:**
- Role: Operations manager
- Context: Morning shift start, 2-3 minutes available
- Constraints: High time pressure, needs to brief team
- Mental model: Expects "traffic light" status indicators

**Interaction:**
- Trigger: Shift start, need to assess overnight events
- Sequence:
  1. Scan overall health metrics
  2. Identify any red/yellow indicators
  3. Drill into specific issue details if needed
  4. Make triage decisions
  5. Brief team on priorities
- Outcome: Confident understanding of system state

**Motivation:**
- Goal: Minimize downtime, protect team from escalations
- Emotional: Need confidence in assessment, avoid overwhelm
- Success: Critical issues identified, team briefed effectively
- Failure: Missed critical issue, team misdirected
```

### Rail Selection

```json
{
  "mode": "analytics_review",
  "actor_task": "rapid_health_assessment",
  "rails": [
    {
      "rail": "session_header",
      "actor_need": "know_current_time_range"
    },
    {
      "rail": "swatch_metrics",
      "actor_need": "scan_health_instantly",
      "interaction": "visual_pattern_recognition"
    },
    {
      "rail": "timeline",
      "actor_need": "understand_event_sequence",
      "interaction": "temporal_context"
    },
    {
      "rail": "data_table",
      "actor_need": "drill_into_details",
      "interaction": "issue_investigation"
    }
  ]
}
```

### Persona Configuration

```json
{
  "persona": "ops_responder",
  "actor_profile": "time-pressured decision maker",
  "motivation_alignment": {
    "efficiency": "critical",
    "confidence": "critical",
    "control": "high"
  },
  "density": {
    "swatch_metrics": "high",
    "timeline": "medium",
    "data_table": "high_when_active"
  },
  "focus": "swatch_metrics"
}
```

---

## 7.2 Example: Onboarding Flow

### AIM Analysis

```markdown
**Actor Profile:**
- Role: New user, unfamiliar with system
- Context: First session, evaluating product fit
- Constraints: Limited time, low commitment, skeptical
- Mental model: Expects guided tutorial, unclear on value

**Interaction:**
- Trigger: First login, need to understand capabilities
- Sequence:
  1. Orient to product purpose
  2. Explore key features via examples
  3. Try one meaningful task with sample data
  4. Assess if product solves their problem
  5. Decide to continue or leave
- Outcome: Understand value, feel capable

**Motivation:**
- Goal: Determine if product is worth time investment
- Emotional: Need to feel welcomed, not lost, build confidence
- Success: See personal value, complete first task successfully
- Failure: Feel confused, overwhelmed, or unsure of value
```

### Journey Flow

```markdown
**Step 1: Welcome & Orient**
- Actor need: Understand what this is
- Interaction: Read welcome, see feature overview
- Rails: welcome_banner, feature_tiles
- Motivation: Assess fit quickly
- Next: Select feature to explore

**Step 2: Guided Exploration**
- Actor need: See value concretely
- Interaction: Complete guided task with sample data
- Rails: tutorial_overlay, sample_workspace
- Motivation: Build confidence, validate usefulness
- Next: Success screen or abandon

**Step 3: Transition to Real Use**
- Actor need: Connect learning to real work
- Interaction: Review what was learned, choose next steps
- Rails: progress_summary, next_steps_menu
- Motivation: Maintain momentum, reduce friction
- Next: Continue to main app or exit
```

---

# Part VIII: Anti-Patterns

## Anti-Pattern 1: Feature-First Design
Designing UI before understanding actors and their interactions.

**Resolution:** Always start with AIM analysis.

---

## Anti-Pattern 2: Visual-First Thinking
Jumping to mockups before defining rails and actor needs.

**Resolution:** Define semantic structure before visual design.

---

## Anti-Pattern 3: Canon Drift
Changing core constraints based on mode or actor type.

**Resolution:** Canon is immutable, modes are configurable.

---

## Anti-Pattern 4: Rail Proliferation
Creating too many specialized rails instead of reusable ones.

**Resolution:** Rails should serve general actor needs across contexts.

---

## Anti-Pattern 5: Motivation Mismatch
Building interactions that don't align with actor motivations.

**Resolution:** Validate every interaction against motivation analysis.

---

## Anti-Pattern 6: Ignoring Actor Constraints
Designing interactions that exceed actor capabilities or time budget.

**Resolution:** Always consider cognitive load, time pressure, expertise.

---

# Part IX: UX Evolution Under MDA

## 9.1 UX as System Evolution Pass

Every UX change follows MDA evolution protocol:

```markdown
## UX Evolution: [Feature Name]

### AIM Impact
- New actors: [List]
- New interactions: [List]
- Motivation changes: [How this affects actor goals]
- Constraint changes: [New limits or freedoms]

### Rail Changes
- New rails: [List with actor needs served]
- Modified rails: [List with changes and rationale]
- Deprecated rails: [List with actor impact analysis]

### Persona Impact
- New personas: [If any, with actor profiles]
- Persona config changes: [What and why]
- Mode adjustments: [How actor tasks change]

### Journey Changes
- New journeys: [Actor flows added]
- Modified journeys: [Changes to existing paths]
- Integration points: [How journeys connect]

### Architecture Alignment
- Data needs: [New API endpoints for interactions]
- State management: [Changes needed for actor context]
- Performance: [Implications for actor experience]

### CPT Alignment
[How this evolution serves product vision]

### Actor Success Validation
[How we measure if this serves actors better]
```

---

*This extension governs advanced UX design under MDA. Load Core Kernel first. Supersedes JTBD-based version with integrated AIM framework.*