# Cline Integration Guide

## Overview

**CLINE.md** is the Archaiforge protocol SDK for Cline (VS Code Extension). It enforces atomic signature protocols, NEXUS memory access, and anti-tunnel vision checkpoints natively within Cline.

**Key Benefits**:
- ✅ Auto-loaded into every Cline session (no manual reminders)
- ✅ Forces context loading via `@file` system
- ✅ Enforces Ledger discipline with automatic logging prompts
- ✅ Maintains persona embodiment across sessions
- ✅ Tracks time TRIAD (H/G/A/ROI) on all work

---

## Installation

### Automatic Installation (Recommended)

```bash
# In your Archaiforge project:
archaiforge init
```

The CLI auto-detects Cline and installs `CLINE.md` to VS Code settings.

**Expected Output**:
```
⚜️ Installing Atomic Signature Protocol...
🔍 Detected: Cline (VS Code Extension), Antigravity / Google AI Code Assist
✅ Cline (VS Code Extension): Protocol installed
✅ Antigravity / Google AI Code Assist: Protocol installed
```

### Manual Installation (if auto-detection fails)

1. Copy protocol content:
   ```bash
   cat .archaiforge/context/protocols/CLINE.md | pbcopy
   ```

2. Open VS Code Settings (Cmd/Ctrl + ,)

3. Search: `cline.customInstructions`

4. Paste the protocol content

5. Restart VS Code

---

## Verification

### Test Protocol is Active

1. Open Cline in VS Code sidebar
2. Send message: "What protocols are you enforcing?"
3. **Expected Response**:
   ```
   ⚜️ [❤️ HEALTHY] [🎭 ARCHITECT] [⏱️ H:Xm • G:Xm • A:Xm • ROI:Xx]
   
   I am enforcing Archaiforge protocols:
   - Atomic Signature (⚜️) on all responses
   - NEXUS context loading via @file
   - CLEAR AI methodology for strategic work
   - Ledger discipline for outcome tracking
   ```

4. Ask: "Load my product vision"
5. **Expected**: Cline uses `@file .archaiforge/context/cpt.md` to load context

---

## Usage Examples

### Example 1: Quick Fix (Tier 0)

**User**: "Fix the typo in validation.js"

**Cline (with Archaiforge protocol)**:
```
⚜️ [❤️ HEALTHY] [🎭 OPERATOR] [⏱️ H:2m • G:1m • A:30s • ROI:4x]

On it—fixing the typo in the validation message.

[Edit file via Cline diff view]

✓ Done. Changed "passowrd" → "password".
```

### Example 2: Strategic Work (Tier 2)

**User**: "Implement authentication system"

**Cline (with Archaiforge protocol)**:
```
⚜️ [❤️ HEALTHY] [🎭 ARCHITECT ⊗ MUSE] [⏱️ H:90m • G:45m • A:20m • ROI:4.5x]

This is strategic work. Executing CLEAR AI Protocol.

## CLEAR AI Plan: Authentication System
**C - Clarity**: Implement JWT-based auth with session management
**L - Limits**: No external auth providers in MVP
**E - Examples**: [Uses @file to load task.md for context]
**A - Adapt**: Create middleware, routes, database schema
**R - Reflect**: Test with Postman, validate security

Want me to proceed with this plan?
```

**After work completes**:
```
✓ Work complete. 

→ MANDATORY: Log this outcome to ledger (Tier 2 requires logging)

Run: archaiforge log
```

---

## Cline-Specific Features

### 1. @-Mention Integration

Cline's `@file`, `@folder`, `@url`, `@problems` system maps to Archaiforge NEXUS:

| Cline Feature | Archaiforge NEXUS | Usage |
|---------------|-------------------|-------|
| `@file [path]` | Context loading | `@file .archaiforge/context/boot.md` |
| `@folder [path]` | Batch context | `@folder .archaiforge/context/` |
| `@url [link]` | External refs | `@url https://docs.api.com` |
| `@problems` | CRITIC activation | Shows linter errors → CRITICAL mode |

### 2. Checkpoint System

Cline creates workspace snapshots → Archaiforge maps these to ledger checkpoints:

- User creates Cline checkpoint → Cline asks: "Log to ledger?"
- User can compare/restore → Maintains ledger alignment
- Each checkpoint = potential outcome to log

### 3. Browser Automation

When Cline launches browser (Computer Use):
- Auto-activates CRITIC persona
- Documents visual bugs, runtime errors
- Offers to log test results

### 4. Terminal Integration

Cline can execute terminal commands → Direct Archaiforge CLI access:

```bash
# Query ledger from within Cline chat
archaiforge query outcomes --limit 5

# Log outcome from Cline
archaiforge log --epic "Feature Development" --content "Built auth system"

# Check system status
archaiforge boot
```

---

## Troubleshooting

### Protocol Not Loading

**Symptom**: Cline doesn't show ⚜️ signature

**Fix**:
1. Open VS Code Settings
2. Search `cline.customInstructions`
3. Verify protocol content is present
4. If empty → Re-run `archaiforge init`
5. Restart VS Code

### Cline Not Detected During Init

**Symptom**: `archaiforge init` doesn't find Cline

**Possible Causes**:
- Cline extension not installed
- VS Code not in standard location
- Using VS Code Insiders (different config path)

**Manual Fix**:
```bash
# Check extension installed
ls ~/Library/Application\ Support/Code/extensions/ | grep claude-dev

# If missing, install Cline:
# Open VS Code → Extensions → Search "Cline" → Install
```

---

## Advanced: MCP Integration (Optional)

Cline supports Model Context Protocol (MCP) for custom tools. You can create an MCP server that exposes Archaiforge CLI as native Cline tools.

**Note**: This is optional. The core CLINE.md protocol works without MCP.

**Future Enhancement**: We plan to provide a ready-made MCP server in future releases.

---

## Comparison: Cline vs. Antigravity

Both platforms now have first-class Archaiforge support:

| Aspect | Antigravity (Gemini) | Cline (VS Code) |
|--------|---------------------|-----------------|
| **Protocol** | GEMINI.md | CLINE.md |
| **Install Path** | `~/.gemini/GEMINI.md` | VS Code User Settings |
| **Context System** | Artifacts + task.md | @file mentions |
| **Platform** | Google AI Code Assist | VS Code Extension |
| **Availability** | Gemini users | Cross-platform (Win/Mac/Linux) |
| **Best For** | Google Workspace workflows | IDE-based development |
| **Auto-Install** | ✅ `archaiforge init` | ✅ `archaiforge init` |

**Verdict**: Use the AI platform you prefer—Archaiforge protocols work on both.

---

## Next Steps

1. **Start Using Cline with Archaiforge**:
   - Open Cline sidebar
   - Ask: "Show my Recent work from ledger"
   - Cline will run `archaiforge query outcomes`

2. **Build Your First Feature**:
   - "Create [feature] using Tier 2 planning"
   - Cline executes CLEAR AI phases
   - Log outcome when complete

3. **Check Your ROI**:
   - Run `archaiforge boot` in terminal
   - See Time TRIAD from recent work
   - Track efficiency multipliers

---

**Version**: 4.1 (Cline SDK Release)  
**Last Updated**: 2026-01-05  
**Status**: Production-Ready  
**Platform**: Cline (VS Code Extension) - https://cline.bot
