# Intent Lens Architecture™ (ILA) Framework

## What It Does
Intent Lens Architecture applies three lenses to understand true user motivations,
design user journeys, and create experience maps that serve real user needs.

The three lenses:
- **Surface Lens** — What users ask for
- **Intent Lens** — What they're trying to do
- **Purpose Lens** — Why it matters

## When to Invoke
- Designing new features
- Understanding user motivations
- Creating user journey maps
- Defining product requirements from user perspective

## How to Invoke (CLI)
```bash
# Apply Intent Lens Architecture to a feature
archaiforge ux intent --feature "document collaboration" --output ila.json

# Generate user journey map
archaiforge ux journey --persona "power user" --intent "share-document" --output journey.json
```

## Input Format (ILA Analysis)
```json
{
  "feature": "document collaboration",
  "target_users": ["individual contributors", "team leads"],
  "existing_pain_points": ["version conflicts", "unclear ownership"]
}
```

## Output Format (ILA Analysis)
```json
{
  "ila_analysis": {
    "functional_intents": [
      {"intent": "Share document with team", "importance": "high"},
      {"intent": "Track who edited what", "importance": "medium"}
    ],
    "emotional_intents": [
      {"intent": "Feel confident changes won't be lost", "importance": "high"}
    ],
    "social_intents": [
      {"intent": "Appear organized to colleagues", "importance": "medium"}
    ]
  },
  "recommended_features": ["...", "..."]
}
```

## Agent Workflow
1. Identify feature or product area
2. Call `archaiforge ux intent` to apply Intent Lens Architecture
3. Call `archaiforge ux journey` to map user experience
4. Use output to inform design decisions
5. Validate designs against intent outcomes
