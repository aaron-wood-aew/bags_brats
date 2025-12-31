# Archaiforge Project: bags_brats

## 🌐 Antigravity Mode

You're using Archaiforge in **companion mode** with Antigravity.

### How It Works
- **Antigravity** = Active workspace (planning, drafting, iteration)
- **Archaiforge** = Strategic memory (outcomes, lessons, patterns)

### Workflow
1. Plan and execute in Antigravity artifacts (implementation_plan.md, task.md)
2. After completing goals, update the Vector Ledger via CLI commands.\n   - Goal achieved
   - What actually happened
   - Lessons learned

### No Duplication
Don't copy step-by-step details from Antigravity to Archaiforge.
The ledger captures **meaning**, not activity.

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

### Project Files

- `.archaiforge/config.json` - Project configuration
- `.archaiforge/vectors/` - Deep semantic state tracking\n- `.archaiforge/boundaries.yaml` - Constraints & preferences
- `.archaiforge/cpt.md` - Central Product Theme

---

Version: 3.0.0-beta
Initialized: 2025-12-30
Mode: Antigravity Companion
