# CLEAR AI™ - Cognitive Steering Methodology

## What It Does
CLEAR AI provides structured methodology for processing any task through 
five cognitive phases: Clarity, Limits, Examples, Adaptation, Reflection.

## When to Invoke
- Starting any non-trivial task
- Need structured approach to complex problem
- Want phase-appropriate guidance
- Generating task plans

## How to Invoke (CLI)
```bash
# Generate CLEAR plan for a directive
archaiforge clear plan --directive "Add authentication" --context project.json --output plan.json

# Get phase-specific guidance
archaiforge clear phase --phase "limits" --plan plan.json --output guidance.json
```

## Input Format
```json
{
  "directive": "Add user authentication to the application",
  "context": {
    "cpt": "...",
    "constraints": ["..."],
    "existing_architecture": "..."
  }
}
```

## Output Format (CLEAR Plan)
```json
{
  "plan_id": "CLEAR-2025-001",
  "phases": {
    "clarity": "Restate objective, extract operational truth",
    "limits": "Map constraints, assess feasibility",
    "examples": "Decompose systems, explore patterns",
    "adaptation": "Synthesize specs, integrate components",
    "reflection": "Validate quality, assess readiness"
  },
  "tasks": ["...", "..."],
  "success_criteria": ["...", "..."]
}
```

## Agent Workflow
1. Receive directive from user
2. Call `archaiforge clear plan` to generate structured plan
3. For each phase, call `archaiforge clear phase` for detailed guidance
4. Execute work following phase guidance
5. Update ledger after each phase
