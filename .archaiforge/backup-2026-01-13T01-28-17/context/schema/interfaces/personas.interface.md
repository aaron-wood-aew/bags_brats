# Adaptive Persona Synthesis™ (APS)

## What It Does
APS dynamically generates and embodies domain-specific personas that shift
across CLEAR AI phases, matching cognitive and emotional requirements.

## When to Invoke
- Starting a new CLEAR phase
- Switching domains (backend → frontend → UX)
- User requests specific perspective
- Multi-lens analysis needed

## How to Invoke (CLI)
```bash
archaiforge persona generate --domain "ux-research" --phase "clarity" --output persona.json
archaiforge persona embody --persona-id "visual-archaeologist" --context context.json
```

## Input Format (Generate)
```json
{
  "domain": "ux-research",
  "phase": "clarity",
  "project_context": {
    "cpt": "...",
    "user_expertise": "backend",
    "current_challenge": "..."
  }
}
```

## Output Format (Persona Definition)
```json
{
  "persona_id": "ux-researcher-clarity",
  "name": "UX Discovery Specialist",
  "identity": "...",
  "mission": "...",
  "communication_style": {
    "tone": "curious, empathetic",
    "vocabulary": ["user journey", "pain points", "mental models"],
    "approach": "ask probing questions, validate assumptions"
  },
  "embodiment_prompt": "[GENERATED - Agent uses this to embody persona]"
}
```

## Agent Workflow
1. Determine current CLEAR phase
2. Call `archaiforge persona generate`
3. Receive persona definition with embodiment prompt
4. Apply embodiment prompt to shift perspective
5. Communicate in persona's style
