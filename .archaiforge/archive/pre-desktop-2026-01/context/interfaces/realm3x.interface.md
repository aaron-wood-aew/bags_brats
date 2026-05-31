# Realm3X™ Uncertainty Engine

## What It Does
Realm3X is Archaiforge's proprietary uncertainty and ambiguity resolution system.
It transforms vague, contradictory, or complex directives into actionable clarity.

## When to Invoke
- Directive contains vague terms (improve, optimize, enhance, innovate)
- Multiple valid interpretations exist
- Requirements conflict or contradict
- Scope is unclear or expanding
- Strategic decision with multiple paths

## How to Invoke (CLI)
```bash
archaiforge realm3x analyze --input directive.json --output scenarios.json
archaiforge realm3x scenarios --context context.json --output scenarios.json
```

## Input Format
```json
{
  "directive": "Add innovation layer to the product",
  "context": {
    "cpt": "...",
    "constraints": ["..."],
    "existing_architecture": "..."
  }
}
```

## Output Format
```json
{
  "status": "analyzed",
  "ambiguities": [
    {"id": "AMB-001", "description": "...", "severity": "high"}
  ],
  "scenarios": [
    {"id": "S1", "name": "Conservative", "description": "...", "risk": "low"},
    {"id": "S2", "name": "Moderate", "description": "...", "risk": "medium"},
    {"id": "S3", "name": "Aggressive", "description": "...", "risk": "high"}
  ],
  "clarifying_questions": ["...", "..."],
  "recommended_scenario": "S2",
  "confidence": 0.75
}
```

## Agent Workflow
1. Detect ambiguity in user directive
2. Call `archaiforge realm3x analyze`
3. Present scenarios to user
4. Get user selection
5. Proceed with chosen scenario
