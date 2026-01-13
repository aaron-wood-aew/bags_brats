# Semantic UI™ - Meaning-First Design Engine

## What It Does
Semantic UI transforms intelligence systems into visual interfaces by mapping
meaning structures (confidence, reasoning depth, lens modes) to UI components.

## When to Invoke
- Designing UI for AI/intelligence systems
- Visualizing confidence, uncertainty, or reasoning
- Building multi-lens/persona-aware interfaces
- Creating semantic maps before wireframes

## How to Invoke (CLI)
```bash
# Generate semantic map for a system
archaiforge semantic-ui map --system "ai-dashboard" --output semantic_map.json

# Select patterns from library based on semantic requirements
archaiforge semantic-ui patterns --requirements requirements.json --output patterns.json

# Express semantic structure as UI spec
archaiforge semantic-ui express --map semantic_map.json --output ui_spec.json
```

## Input Format (Map Generation)
```json
{
  "system": "ai-analysis-dashboard",
  "intelligence_dimensions": ["confidence", "reasoning_depth", "lens_mode"],
  "data_sources": ["multi-model consensus", "real-time signals"],
  "user_workflows": ["explore uncertainty", "validate insights"]
}
```

## Output Format (Semantic Map)
```json
{
  "semantic_dimensions": [
    {"name": "confidence", "scale": "0-100", "expression": "gradient_opacity"},
    {"name": "reasoning_depth", "layers": ["surface", "deep", "strategic"]}
  ],
  "semantic_regions": [
    {"name": "Insight Lane", "role": "high-confidence validated items"},
    {"name": "Uncertainty Zone", "role": "ambiguous or conflicting data"}
  ],
  "movement_rules": [
    {"from": "Signal Band", "to": "Insight Lane", "condition": "confidence > 0.8"}
  ],
  "recommended_patterns": ["reasoning_trace", "confidence_gradient", "lens_switcher"]
}
```

## Agent Workflow
1. Identify intelligence dimensions in the system
2. Call `archaiforge semantic-ui map` to generate semantic structure
3. Call `archaiforge semantic-ui patterns` to select interaction patterns
4. Use output to guide UI implementation
5. Apply movement rules for dynamic intelligence visualization
