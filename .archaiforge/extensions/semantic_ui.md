<!--
═══════════════════════════════════════════════════════════════════════════════
⚜️ ARCHAIFORGE PROPRIETARY - SEMANTIC UI CORE METHODOLOGY
═══════════════════════════════════════════════════════════════════════════════
This file is part of the Archaiforge Semantic UI™ methodology.
CONFIDENTIAL AND PROPRIETARY. Unauthorized copying, modification, or
distribution is strictly prohibited.

© 2025 Archaiforge. All rights reserved.
═══════════════════════════════════════════════════════════════════════════════
-->

# Semantic UI Core
## Meaning-First Design Methodology for Intelligence Expression

> **Version**: 2.0  
> **Requires**: MDA Core Kernel loaded  
> **Purpose**: Core methodology for designing user interfaces that express intelligence, uncertainty, and semantic meaning. Essential for any system that visualizes AI outputs, confidence scores, or reasoning processes.
> **Update**: Now integrated with comprehensive semantic_patterns.yaml library (41 patterns)

---

## Core Principle

**Meaning Before Visuals**

Every UI element must map to semantic meaning. Never design screens—design **semantic architectures** that express how intelligence behaves, thinks, and evolves.

Work in this mandatory order:
1. Identify semantic dimensions (confidence, depth, lens, etc.)
2. Build the semantic map (regions, roles, movement)
3. Express UI from semantics
4. Map data/API to semantic structure
5. Select concrete patterns from semantic_patterns.yaml

---

## The 5-Step Semantic UI Process

### Step 1: Identify Semantic Dimensions

Before any UI work, identify the **dimensions of meaning** present in this intelligence system.

**Common semantic dimensions:**
- **Confidence**: 0-100% certainty in output
- **Certainty vs Ambiguity**: Known → Unknown → Unknowable
- **Severity / Priority**: Informational → Warning → Critical
- **Time / Temporality**: Historical → Current → Predictive
- **Context Depth**: Surface → Deep analysis
- **Reasoning Depth**: Quick → Thorough → Strategic
- **Lens / Persona Mode**: Different analytical perspectives (e.g., Editor vs Architect vs Validator)
- **Signal vs Insight**: Raw observation → Processed intelligence
- **Consensus Strength**: Single source → Multi-model agreement
- **Structural Flow**: Input → Processing → Output stages
- **Temporal Freshness**: Live → Recent → Stale
- **Collaboration Status**: Solo → Multi-user → Editing conflict

**Output Format:**
```
SEMANTIC DIMENSIONS:
• Confidence: [Scale definition and meaning]
• Reasoning Depth: [Layers and transitions]
• [Persona] Lens: [Available perspectives]
• Temporal Freshness: [Real-time vs stale data]
• [Other dimensions...]
```

**Example:**
```
SEMANTIC DIMENSIONS:
• Confidence: 0-100 scale representing system certainty in assessment
• Reasoning Depth: Surface → Deep → Strategic (3 layers)
• APS Lens: Editor (craft focus) / Architect (structure focus) / Validator (quality focus)
• Signal Type: Raw observation → Processed insight
• Temporal Freshness: Live → Recent (< 5min) → Stale (> 5min)
```

---

### Step 2: Build the Semantic Map

Create a **spatial representation of meaning** using regions, roles, and movement rules.

#### 2.1 Semantic Regions
Define zones where different types of intelligence live:

**Example Regions:**
- **Insight Lane**: High-confidence processed intelligence (ready for action)
- **Signal Band**: Raw observations awaiting processing (needs validation)
- **Uncertainty Zone**: Ambiguous or conflicting data (requires exploration)
- **Context Orbit**: Supporting background information (provides depth)
- **Depth Stack**: Layers from surface to strategic reasoning (progressive disclosure)

#### 2.2 Region Roles
What belongs in each region?

**Example:**
```
INSIGHT LANE:
• High-confidence assessments (>80%)
• Validated recommendations
• Consensus items from multiple sources

SIGNAL BAND:
• Raw model outputs
• Unprocessed observations
• Single-source claims

UNCERTAINTY ZONE:
• Conflicting assessments
• Low-confidence items (<40%)
• Unresolved ambiguities
```

#### 2.3 Movement Rules
How do items transition between regions as intelligence evolves?

**Example:**
```
MOVEMENT RULES:
• Signal → Insight: When confidence crosses 80% threshold
• Uncertainty → Signal: When conflict resolves
• Surface → Deep: When additional context layers added
• Editor Lens → Architect Lens: When focus shifts from craft to structure
```

**Output Format:**
```
SEMANTIC MAP:

Regions:
1. [Region Name]
   Role: [What lives here]
   Entry Conditions: [How items enter]
   Exit Conditions: [How items leave]

2. [Region Name]
   ...

Movement Rules:
• [From] → [To]: [Condition]
• [From] → [To]: [Condition]
```

---

### Step 3: Express Semantic UI Components

Now translate semantic structure into UI expression.

#### Required Elements

**For each semantic dimension, define visual expression:**

**Confidence:**
```
Visual Expression:
• Gradient intensity (0% = faint, 100% = solid)
• Border weight (uncertain = dashed, certain = solid)
• Color saturation (low confidence = desaturated)

Pattern Library Support:
• pattern.intelligence.confidence_gradient
• semantic_overlay: confidence
```

**Reasoning Depth:**
```
Visual Expression:
• Vertical layers (Surface = top, Strategic = bottom)
• Indentation levels
• Expandable depth indicators

Pattern Library Support:
• pattern.intelligence.reasoning_trace
• pattern.disclosure.accordion_deep
• semantic_overlay: reasoning_depth
```

**Lens / Persona:**
```
Visual Expression:
• Lens toggle in header
• Color coding (Editor = blue, Architect = green, Validator = amber)
• Icon system per lens

Pattern Library Support:
• pattern.intelligence.lens_switcher
• semantic_overlay: lens_persona
```

**Regions:**
```
UI Components per Region:

INSIGHT LANE:
• Card component with high-confidence styling
• Action buttons (since these are actionable)
• Source attribution badges

Pattern Library Support:
• pattern.intelligence.semantic_region_canvas
• pattern.dashboard.main (for card layout)

SIGNAL BAND:
• List items with preliminary styling
• Confidence indicators visible
• "Process further" affordances

Pattern Library Support:
• pattern.intelligence.semantic_region_canvas
• pattern.activity.feed (for chronological signals)

UNCERTAINTY ZONE:
• Warning-styled containers
• Conflict visualization (multiple sources shown)
• Resolution workflow triggers

Pattern Library Support:
• pattern.intelligence.semantic_region_canvas
• pattern.comparison.split_view (for conflict comparison)
```

**Output Format:**
```
SEMANTIC UI COMPONENTS:

Dimension: [Name]
Visual Expression:
• [Method 1]
• [Method 2]
Pattern Support: [pattern IDs from library]

Region: [Name]
Components:
• [Component type]: [Purpose]
• [Component type]: [Purpose]
Pattern Support: [pattern IDs from library]

States & Transitions:
• [State A] → [State B]: [Visual change]
Pattern Support: [transition rules from library]
```

---

### Step 4: Map Data & API to Semantic Structure

For every semantic region and dimension, define the data requirements.

**Output Format:**
```
DATA/API MAPPING:

Dimension: Confidence
• Backend field: `confidence_score` (float 0-1)
• API endpoint: `/intelligence/confidence`
• Schema: { item_id, confidence_score, timestamp }

Region: Insight Lane
• Data required: Items where confidence_score > 0.8
• API query: GET /intelligence/items?confidence_min=0.8&status=validated
• Schema: { id, content, confidence, sources[], reasoning_depth }

Movement Rule: Signal → Insight
• Trigger: confidence_score crosses 0.8 threshold
• API event: POST /intelligence/promote { item_id, new_region: "insight" }
• Real-time support: WebSocket event "intelligence.item.moved"
• Pattern support: pattern.intelligence.movement_animation
```

---

### Step 5: Select Concrete Patterns from Library

After defining semantic structure, select specific interaction patterns from semantic_patterns.yaml.

**Selection Process:**

1. **Match Semantic Requirements to Patterns**
   - Reasoning transparency → pattern.intelligence.reasoning_trace
   - Multi-perspective views → pattern.intelligence.lens_switcher
   - Confidence visualization → pattern.intelligence.confidence_gradient
   - Region visualization → pattern.intelligence.semantic_region_canvas

2. **Layer in Supporting Patterns**
   - Progressive disclosure → pattern.disclosure.accordion_deep
   - Real-time updates → pattern.realtime.live_indicator
   - Error recovery → pattern.error.undo_history
   - Multi-user awareness → pattern.collaboration.presence

3. **Add Standard Interaction Patterns**
   - Forms → pattern.form.standard
   - Navigation → pattern.nav.left_rail
   - Modals → pattern.modal.standard
   - Search → pattern.search.workspace

**Pattern Selection Matrix:**

| User Need | Semantic Requirement | Pattern(s) |
|-----------|---------------------|------------|
| See AI thinking | Reasoning transparency | pattern.intelligence.reasoning_trace |
| Switch perspectives | Lens/persona control | pattern.intelligence.lens_switcher |
| Understand confidence | Uncertainty visibility | pattern.intelligence.confidence_gradient |
| See semantic structure | Region visualization | pattern.intelligence.semantic_region_canvas |
| Watch intelligence evolve | Movement animation | pattern.intelligence.movement_animation |
| Explore deep content | Progressive disclosure | pattern.disclosure.accordion_deep |
| Know data freshness | Temporal awareness | pattern.realtime.live_indicator |
| Collaborate with team | Multi-user awareness | pattern.collaboration.presence |
| Recover from mistakes | Error recovery | pattern.error.undo_history |
| Work efficiently | Keyboard navigation | pattern.expert.keyboard_shortcuts |

---

## The 7 Mandatory Rules

### Rule 1: Always Start with Semantic Dimensions
Never skip to UI. Semantic dimensions define the meaning structure.

### Rule 2: Semantic Map Comes Before Components
Structure precedes expression. Build the map before designing components.

### Rule 3: Every Visual Element Must Map to Meaning
No decorative-only UI. Every element expresses intelligence state or dimension.

**Enforcement:** Use semantic_overlays in pattern library to ensure visual consistency.

### Rule 4: Express Uncertainty Visibly
Don't hide low confidence. Make ambiguity and uncertainty explicit.

**Pattern Support:**
- pattern.intelligence.confidence_gradient
- pattern.intelligence.semantic_region_canvas (Uncertainty Zone)
- semantic_overlay: confidence (dashed borders, reduced opacity)

### Rule 5: Show Lens/Persona Mode
Make the AI's perspective visible. Users should know which analytical lens is active.

**Pattern Support:**
- pattern.intelligence.lens_switcher
- semantic_overlay: lens_persona (color coding, icon systems)

### Rule 6: Design for Movement
Intelligence changes over time. UI must show transitions as data moves between semantic regions.

**Pattern Support:**
- pattern.intelligence.movement_animation
- transition.region_move (from sub_language)

### Rule 7: Map All Backend Data
Every semantic element needs a data source. Specify fields, endpoints, and schemas.

**Integration with Patterns:**
- Each pattern has implementation_contract section
- Defines required backend APIs and data structures
- Ensures semantic meaning has technical foundation

---

## Pattern Library Integration

### How Semantic UI + Pattern Library Work Together

```
┌─────────────────────────────────────────────┐
│       SEMANTIC_UI.MD (Meaning Layer)        │
│                                             │
│  • Defines semantic dimensions              │
│  • Defines semantic regions                 │
│  • Defines movement rules                   │
│  • Defines expression principles            │
└─────────────────────────────────────────────┘
                    ↓
         [Informs pattern selection]
                    ↓
┌─────────────────────────────────────────────┐
│   SEMANTIC_PATTERNS.YAML (Behavior Layer)   │
│                                             │
│  • 41 concrete interaction patterns         │
│  • State machines for each pattern          │
│  • Semantic UI components specifications    │
│  • Semantic overlays for cross-cutting rules│
└─────────────────────────────────────────────┘
                    ↓
         [Generates implementation]
                    ↓
┌─────────────────────────────────────────────┐
│       IMPLEMENTATION (Component Layer)      │
│                                             │
│  • React/Vue/etc components                 │
│  • State management                         │
│  • API integration                          │
│  • Visual design tokens                     │
└─────────────────────────────────────────────┘
```

### Pattern Categories in Library

**Intelligence Expression (5 patterns):**
- pattern.intelligence.reasoning_trace
- pattern.intelligence.confidence_gradient
- pattern.intelligence.lens_switcher
- pattern.intelligence.semantic_region_canvas
- pattern.intelligence.movement_animation

**Progressive Disclosure (2 patterns):**
- pattern.disclosure.accordion_deep
- pattern.disclosure.context_drawer

**Real-Time & Collaboration (3 patterns):**
- pattern.realtime.live_indicator
- pattern.collaboration.presence
- pattern.collaboration.comments_thread

**Data Visualization (3 patterns):**
- pattern.viz.semantic_graph
- pattern.viz.heatmap_matrix
- pattern.viz.timeline_gantt

**Power User / Expert (3 patterns):**
- pattern.expert.keyboard_shortcuts
- pattern.expert.advanced_filters
- pattern.expert.bulk_edit

**Onboarding & Guidance (2 patterns):**
- pattern.onboarding.product_tour
- pattern.onboarding.contextual_help

**Error & Recovery (2 patterns):**
- pattern.error.diagnostic_panel
- pattern.error.undo_history

**Settings & Configuration (2 patterns):**
- pattern.settings.tabbed_preferences
- pattern.settings.preview_live

**Export & Sharing (2 patterns):**
- pattern.export.format_selector
- pattern.sharing.permissions_modal

**Mobile-Specific (2 patterns):**
- pattern.mobile.bottom_sheet
- pattern.mobile.swipe_actions

**Standard Patterns (15 patterns):**
- Authentication, forms, dashboards, modals, wizards, search, empty states, bulk actions, side panels, inline editing, resource pickers, activity feeds, comparison views, command palette, navigation

---

## Success Criteria

Your Semantic UI specification is successful when:

- [ ] Someone can understand the **meaning structure** before seeing any UI
- [ ] Confidence/uncertainty is **always visible**
- [ ] Lens/persona mode is **clearly expressed**
- [ ] Movement rules show how intelligence **evolves**
- [ ] Every UI element **maps to backend data**
- [ ] Selected patterns from library **match semantic requirements**
- [ ] Semantic overlays are **consistently applied**
- [ ] Developers can **implement from your spec**
- [ ] No blind states (users always know what's happening)
- [ ] Intelligence transitions are smooth and meaningful

---

## Anti-Patterns to Avoid

❌ Starting with "Here's a dashboard with these widgets..."  
✅ Starting with "The semantic dimensions are..."

❌ "This card shows the data"  
✅ "This card expresses high-confidence structural insights in the CLARITY phase"

❌ Generic UI without semantic meaning  
✅ Every UI element tied to intelligence dimension with pattern support

❌ Static screens  
✅ Living semantic structures that show intelligence evolution (movement_animation)

❌ Hiding uncertainty or low confidence  
✅ Making doubt and ambiguity visible and actionable (confidence_gradient, Uncertainty Zone)

❌ Single view for all contexts  
✅ Lens-based views that change perspective (lens_switcher)

❌ Selecting patterns randomly  
✅ Selecting patterns that match semantic requirements

❌ Ignoring semantic overlays  
✅ Applying semantic overlays for visual consistency

---

## Integration with CLEAR AI

Semantic UI naturally integrates with CLEAR AI phases:

**C (Clarity):**
- Semantic dimensions emerge from operational requirements
- Requirements define what intelligence needs to be expressed
- Pattern selection: pattern.form.standard, pattern.intelligence.reasoning_trace

**L (Limits):**
- Constraints affect semantic regions (e.g., performance limits affect real-time updates)
- Platform capabilities determine available visual expressions
- Pattern selection: pattern.settings.tabbed_preferences

**E (Examples - System Design):**
- Semantic map is part of system decomposition
- Behavioral contracts include UI state contracts
- Pattern selection: pattern.dashboard.main, pattern.viz.semantic_graph

**A (Adaptation):**
- Full-stack specification includes semantic UI layer
- API/Data mapping happens in this phase
- Pattern selection: pattern.intelligence.semantic_region_canvas, pattern.realtime.live_indicator

**R (Reflection):**
- Validate that semantic structure serves user needs
- Verify no intelligence is hidden or misrepresented
- Pattern selection: pattern.error.diagnostic_panel, pattern.error.undo_history

---

## Integration with Realm 3X

Semantic UI is critical for expressing Realm 3X outputs:

**Ambiguity Detection:**
- Uncertainty Zone displays ambiguities
- Visual indicators show severity of ambiguity
- Pattern support: pattern.intelligence.semantic_region_canvas

**Scenario Generation:**
- Each scenario occupies a semantic region
- Confidence gradients show scenario strength
- Pattern support: pattern.intelligence.confidence_gradient, pattern.comparison.split_view

**Meta-Uncertainty:**
- Special visual treatment for "unknown unknowns"
- Distinct from regular low-confidence items
- Pattern support: semantic_overlay: uncertainty_zone

**Human Inquiry:**
- Questions displayed in interactive regions
- Clear affordances for human input
- Pattern support: pattern.form.standard, pattern.modal.standard

---

## Common Use Cases

### Use Case 1: AI Analysis Dashboard
**Semantic Dimensions**: Confidence, Reasoning Depth, Analysis Type  
**Semantic Regions**: Insight Lane, Signal Band, Uncertainty Zone  
**Movement**: Raw data → Signals → Insights based on confidence

**Pattern Stack:**
1. pattern.intelligence.semantic_region_canvas (main visualization)
2. pattern.intelligence.confidence_gradient (show confidence levels)
3. pattern.intelligence.lens_switcher (switch perspectives)
4. pattern.dashboard.main (card layout for insights)
5. pattern.realtime.live_indicator (data freshness)
6. pattern.intelligence.movement_animation (show transitions)

### Use Case 2: Multi-Model Consensus Interface
**Semantic Dimensions**: Consensus Strength, Model Source, Agreement Level  
**Semantic Regions**: Consensus Ring, Conflict Zone, Validated Insights  
**Movement**: Individual models → Consensus engine → Unified output

**Pattern Stack:**
1. pattern.intelligence.semantic_region_canvas (region visualization)
2. pattern.comparison.split_view (model comparison)
3. pattern.intelligence.confidence_gradient (consensus strength)
4. pattern.viz.semantic_graph (model relationships)
5. pattern.collaboration.presence (model source indicators)

### Use Case 3: Uncertainty Exploration Tool
**Semantic Dimensions**: Certainty Level, Exploration Depth, Risk Score  
**Semantic Regions**: Known Space, Uncertain Territory, Unknowable Edge  
**Movement**: Known → Uncertain → Investigation → Resolution

**Pattern Stack:**
1. pattern.intelligence.semantic_region_canvas (3-zone visualization)
2. pattern.intelligence.reasoning_trace (exploration process)
3. pattern.disclosure.accordion_deep (progressive depth)
4. pattern.intelligence.confidence_gradient (uncertainty visualization)
5. pattern.error.undo_history (exploration recovery)

### Use Case 4: Adaptive Persona Interface (CLEAR AI)
**Semantic Dimensions**: Active Persona, Phase, Confidence in Output  
**Semantic Regions**: Phase Workspaces (C/L/E/A/R), Transition States  
**Movement**: Phase-to-phase transitions with persona switching

**Pattern Stack:**
1. pattern.intelligence.lens_switcher (persona control)
2. pattern.wizard.multi_step (phase progression)
3. pattern.intelligence.reasoning_trace (phase-specific thinking)
4. pattern.disclosure.context_drawer (phase details)
5. pattern.activity.feed (work history)

### Use Case 5: Collaborative Intelligence Review
**Semantic Dimensions**: Confidence, User Consensus, Review Status  
**Semantic Regions**: Draft, Under Review, Approved, Disputed  
**Movement**: Draft → Review → Consensus/Dispute → Final

**Pattern Stack:**
1. pattern.collaboration.presence (who's reviewing)
2. pattern.collaboration.comments_thread (feedback)
3. pattern.intelligence.confidence_gradient (confidence changes)
4. pattern.comparison.split_view (version comparison)
5. pattern.error.undo_history (revert changes)
6. pattern.realtime.live_indicator (active editing)

---

## Quick Reference Commands

When the human invokes these, the agent responds accordingly:

- **"Semantic map for X"** → Generate dimensions, regions, movement rules for system X
- **"Express uncertainty"** → Design UI that makes doubt and ambiguity visible
- **"Lens switching"** → Design persona/perspective switching interface
- **"Map to data"** → Define backend fields and API contracts for semantic structure
- **"Select patterns"** → Choose interaction patterns from library that match semantic requirements
- **"Apply overlays"** → Apply semantic overlay rules for visual consistency

---

## Advanced: Creating Custom Semantic Overlays

When standard overlays don't cover your needs, create custom ones:

```yaml
semantic_overlays:
  - dimension: custom_dimension_name
    description: >
      What this dimension means and when it applies.
    affects_patterns:
      - pattern.id.one
      - pattern.id.two
    expression_rules:
      state_a:
        visual_property_1: value
        visual_property_2: value
      state_b:
        visual_property_1: value
        visual_property_2: value
```

**Example: Trust Level Overlay**
```yaml
semantic_overlays:
  - dimension: trust_level
    description: >
      User's trust in AI outputs based on historical accuracy.
    affects_patterns:
      - pattern.intelligence.confidence_gradient
      - pattern.intelligence.reasoning_trace
    expression_rules:
      verified:
        badge: "✓ Verified"
        color: green
        show_sources: true
      tentative:
        badge: "~ Tentative"
        color: blue
        show_sources: true
      unverified:
        badge: "? Unverified"
        color: orange
        show_warning: true
```

---

## Versioning & Updates

**Version 2.0 Changes:**
- Integrated with semantic_patterns.yaml library (41 patterns)
- Added Step 5: Pattern Selection to process
- Expanded semantic overlays section
- Added pattern support annotations throughout
- New use cases demonstrating pattern stacks
- Integration guidance for pattern library

**Migration from 1.0:**
- All 1.0 concepts remain valid
- Step 5 is new addition
- Pattern library provides concrete implementations for abstract concepts
- Semantic overlays now have library enforcement

---

*This methodology ensures intelligence is expressed honestly, uncertainty is visible, and users can navigate meaning structures with confidence. Version 2.0 integrates seamlessly with the comprehensive semantic_patterns.yaml library for implementation guidance.*
