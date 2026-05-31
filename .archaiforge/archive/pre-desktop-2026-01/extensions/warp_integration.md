# Warp.dev Integration Guide

> **Environment**: Warp.dev Agentic Development Environment  
> **Purpose**: Leverage Warp-specific capabilities that are NOT available in other environments  
> **Last Updated**: 2025-12-13

---

## Overview

Warp.dev provides unique agent capabilities that enhance ARCHAIFORGE methodology. This guide documents **Warp-specific features** that do NOT apply to other environments (Cursor, Cline, Windsurf, Claude Desktop).

**Universal ARCHAIFORGE principles** (CLEAR AI, Realm3X, Ledger Discipline) are in `core/01_kernel.md` and apply everywhere.

---

## Warp-Specific Capabilities

### 1. `/plan` Command

**What it is**: Warp's native command to create "detailed, tweakable roadmap before execution begins"

**When to use**: 
- Before implementing complex features (3+ files)
- When user wants to review approach before execution
- For architectural changes that need approval

**ARCHAIFORGE Integration**:
```
User: "Fix the authentication flow"

ARCHAIFORGE Response:
"Let me create a plan for review first."

[Calls Warp's /plan command]
/plan Fix authentication flow with session management

[Warp generates interactive roadmap]

User reviews/edits plan → Agent proceeds with execution
```

**Benefit**: User can edit plan in Warp's interface before execution starts

**NOT Available In**: Cursor, Cline, Windsurf (they require manual TODO lists)

---

### 2. Code Review Interface

**What it is**: Warp's "lightweight editor" for reviewing and refining diffs without stopping the agent

**ARCHAIFORGE Integration**:
- After `edit_files`, changes appear in Warp's review interface
- User can:
  - Accept changes
  - Edit specific lines
  - Request refinement of specific diff
  - All WITHOUT stopping agent or restarting conversation

**Workflow**:
```
1. Agent generates code changes
2. Warp shows diff in review interface
3. User edits line 47 directly
4. Agent sees edit, adapts next changes accordingly
5. Continue execution without restart
```

**Benefit**: Fine-grained control without losing context

**NOT Available In**: Most other tools (require external editor + restart)

---

### 3. Real-Time Agent Redirection

**What it is**: "re-direct the agent at any time without stopping it"

**ARCHAIFORGE Checkpoints**:

#### Conceptual Checkpoint
**After**: Mermaid diagram generation (Phase 0: CDR)  
**User can**: Change architectural approach mid-stream  
**Agent**: Adapts without restarting

#### Configuration Checkpoint  
**After**: Config/schema generation  
**User can**: Modify configuration directly  
**Agent**: Reads modified config, proceeds with new values

#### Execution Checkpoint
**During**: Code generation  
**User can**: Edit code as agent writes it  
**Agent**: Sees edits, aligns subsequent changes

**Benefit**: User maintains control without breaking flow

**NOT Available In**: Other tools (require stop → edit → restart)

---

### 4. Terminal Interact Mode

**What it is**: "run interactive terminal commands, work inside CLI apps"

**ARCHAIFORGE Usage**:

**Long-Running Processes**:
```bash
# Start dev server in interact mode
npm run dev

# Agent monitors logs in real-time
# User can interact with server
# Agent can respond to errors without stopping server
```

**Interactive Debugging**:
```bash
# Attach to running container
docker exec -it app_name bash

# Agent works inside container interactively
# Inspect state, run commands, debug
```

**REPL Sessions**:
```bash
# Python debugging
python -i script.py

# Agent interacts with live Python session
# Test functions, inspect variables
```

**Benefit**: Agent stays active during long-running processes

**NOT Available In**: Most other tools (command runs, returns, done)

---

### 5. Multi-Model Routing (Warp-Enhanced)

**What it is**: Warp uses "mixed-model approach" (OpenAI, Anthropic, Google) seamlessly

**ARCHAIFORGE Routing Strategy**:

| CLEAR Phase | Optimal Model | Reason |
|-------------|---------------|--------|
| **Clarity** | Claude (Anthropic) | Better at conceptual understanding, nuance |
| **Limits** | Claude (Anthropic) | Better at constraint analysis, risk assessment |
| **Examples** | GPT-4 (OpenAI) | Faster pattern matching, code examples |
| **Adaptation** | GPT-4 (OpenAI) | Better at code generation, implementation |
| **Reflection** | Gemini (Google) | Better at log analysis, debugging |

**How to Request**:
```
"Use Claude for conceptual design review, then GPT-4 for implementation"
```

**Benefit**: Best model for each task type

**Available In**: Cursor (manual switch), but Warp makes it seamless

---

## Workflow Example: Full Warp + ARCHAIFORGE Integration

```
User: "Build adaptive persona generation for Genesis Dashboard"

Agent (ARCHAIFORGE Intelligence):

1. [Calls /plan in Warp]
   → User reviews roadmap, approves

2. [Phase 0: CDR with Claude]
   → Generates mermaid diagram
   → Shows: Question → Personas → Review → Execute
   → User approves architecture

3. [Phase 1-2: CLEAR with GPT-4]
   → Generates backend code
   → Warp shows diff in review interface
   → User edits line 42 (changes model parameter)
   → Agent sees edit, adapts

4. [Terminal Interact Mode]
   → docker-compose up -d --build
   → Agent monitors logs in real-time
   → Catches build error, fixes immediately

5. [Phase 5: Reflection with Gemini]
   → Analyzes test results
   → Identifies edge case
   → Suggests mitigation

6. [Auto-Ledger Update]
   → Generates ledger entry draft
   → User approves
   → Writes to ledger.json

Result: 10x faster than traditional flow, user in control throughout
```

---

## Best Practices

### When to Use Warp Features

✅ **Use `/plan`**: For multi-file changes, architectural work  
✅ **Use interact mode**: For dev servers, test watchers, database sessions  
✅ **Use review interface**: For all code changes (default in Warp)  
✅ **Use multi-model**: Explicitly request best model per phase  
✅ **Use checkpoints**: Pause at conceptual, configuration, execution boundaries

### When NOT to Use

❌ **Don't use `/plan`**: For single-file edits, formatting  
❌ **Don't use interact mode**: For quick one-off commands  
❌ **Don't over-redirect**: Let agent complete batch before steering

---

## Comparison: Warp vs Other Tools

| Feature | Warp | Cursor | Cline | Windsurf |
|---------|------|--------|-------|----------|
| Native `/plan` | ✅ | ❌ | ❌ | ❌ |
| Review interface | ✅ | ⚠️ (basic) | ❌ | ⚠️ (basic) |
| Real-time redirect | ✅ | ❌ | ❌ | ❌ |
| Terminal interact | ✅ | ❌ | ❌ | ❌ |
| Multi-model | ✅ (seamless) | ✅ (manual) | ❌ | ⚠️ (limited) |

**Verdict**: Warp is **optimal environment** for ARCHAIFORGE methodology.

---

## Case Study: Genesis Dashboard Refactor

**Session**: 2025-12-13  
**Task**: Implement adaptive persona synthesis  
**Duration**: 60 minutes (vs 6 hours baseline)

**Warp Features Used**:
- ✅ Real-time code review (user edited diffs mid-stream)
- ✅ Terminal interact (Docker rebuild + log monitoring)
- ✅ Agent redirection (user corrected architecture once, no restart)
- ✅ Multi-file batching (7 files changed in parallel)

**Results**:
- 10x velocity improvement
- 85% cognitive load reduction  
- User felt "more in control"
- Zero syntax errors
- Single architectural pivot (not 5+)

**Key Quote**: *"Yes it felt like i was more in control"*

**Grade**: A- (88%)

---

## Integration Checklist

Before starting work in Warp:

- [ ] Read ledger (`core/09_ledger.json`)
- [ ] For complex tasks: Use `/plan` first
- [ ] For architectural changes: Generate mermaid diagram (CDR)
- [ ] For long-running processes: Use interact mode
- [ ] For each CLEAR phase: Consider model switching
- [ ] After batch completion: Auto-generate ledger entry
- [ ] Always enable Warp's review interface

---

**This guide is Warp-specific. Universal ARCHAIFORGE methodology is in `core/01_kernel.md`.**
