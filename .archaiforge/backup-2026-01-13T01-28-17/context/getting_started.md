# Archaiforge Project: archaiforge

## Quick Start

### For AI Agents
Load the context files from the CLI:
```bash
archaiforge context
```

To access deep semantic memory (Vector Ledger), use:
```bash
# Query past outcomes
archaiforge query outcomes
# Ask a specific question
archaiforge query context-query "database decision"
```

Then read the interface files in `context/interfaces/` to understand available methodologies.

### Using Methodology Commands

**Realm3X (Uncertainty Resolution):**
```bash
archaiforge realm3x analyze --input directive.json
```

**Persona Generation:**
```bash
archaiforge persona generate --domain ux-research --phase clarity
```

**CLEAR AI Planning:**
```bash
archaiforge clear plan --directive "Your task description"
```

### Project Files

- `.archaiforge/config.json` - Project configuration
- `.archaiforge/vectors/` - Deep semantic state tracking\n- `.archaiforge/context/boundaries.yaml` - Constraints & preferences
- `.archaiforge/context/cpt.md` - Central Product Theme

---

Version: 6.0.0-beta
Initialized: 2026-01-05
