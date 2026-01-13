# GitHub Copilot Protocol - Archaiforge Integration

**Status**: Active  
**Integration**: VS Code Workspace + .github/copilot-instructions.md  
**Enforcement**: Voluntary (guidance-based)

---

## Protocol Overview

GitHub Copilot reads `.github/copilot-instructions.md` automatically when working in this workspace. This file guides Copilot to follow Archaiforge protocols.

**Key Difference from Other Agents**:
- **GEMINI.md**: Deep Antigravity integration with signature construction
- **WARP.md**: Terminal-focused AI with command-line context
- **CLINE.md**: VS Code extension with file editing integration
- **COPILOT.md**: Chat-based assistance with workspace awareness

---

## Integration Points

### 1. Workspace Instructions
**File**: `.github/copilot-instructions.md`  
**Auto-loaded**: ✅ Yes (by Copilot when workspace opened)  
**Purpose**: Protocol summary, drift awareness, CLI integration

### 2. Protocol Reference
**Primary**: `context/boot.md`  
**Copilot reads**: On demand (when asked about protocols)  
**Contains**: Complete Archaiforge specification

### 3. Drift Detection
**File**: `.archaiforge/reflex/pulse.json`  
**Copilot reads**: Manually (code snippet in instructions)  
**Purpose**: Check drift_status before major work

---

## Usage Patterns

### Pattern 1: Check Drift Before Work
```javascript
// Copilot can suggest this check
const pulse = JSON.parse(
    fs.readFileSync('.archaiforge/reflex/pulse.json', 'utf8')
);

if (pulse.drift_status !== 'OK') {
    console.warn('⚠️ DRIFT:', pulse.drift_message);
    console.warn('Violations:', pulse.drift_violations);
}
```

### Pattern 2: Task Boundary Creation
When Copilot detects complex work (3+ files, >5min), it should suggest:
```markdown
Creating task boundary...

**Task**: [Name]
**Files**: [List]
**Estimate**: H:Xm • G:Xm • A:Xm • ROI:Xx

Location: .archaiforge/tasks/[task-name].md
```

### Pattern 3: CLI Integration
Copilot knows about Archaiforge CLI:
```bash
# Suggest these commands
npx archaiforge heartbeat status
npx archaiforge log -m "Completed feature"
npx archaiforge query outcomes --limit 5
```

---

## Limitations

**Copilot Cannot**:
- Track its own tool calls (no structured tool concept)
- Write to pulse.json (no daemon integration)
- Enforce protocols architecturally (relies on voluntary compliance)
- Construct atomic signatures (chat interface, not structured responses)

**Copilot Can**:
- Read pulse.json for drift status
- Reference boot.md for protocols
- Suggest DriftDetector API usage
- Guide task boundary creation
- Recommend CLI commands

---

## Manual Drift Logging

Since Copilot doesn't auto-track, log drift after sessions:

```bash
# After Copilot session with suspected violations
node -e "
const DriftDetector = require('./lib/drift_detector');
const detector = new DriftDetector('.');

detector.logViolation({
  pattern: 'task_boundary_missing',
  severity: 'MEDIUM',
  message: 'Copilot session: Changed 6 files without task.md',
  metadata: {
    session_tool: 'copilot',
    files_count: 6,
    timestamp: new Date().toISOString()
  }
});
"
```

---

## Testing Integration

**Test in VS Code**:
1. Open Archaiforge workspace
2. Start GitHub Copilot Chat
3. Ask: "What protocols apply in this workspace?"
4. Verify: Copilot references .github/copilot-instructions.md

**Expected Behavior**:
- Copilot mentions drift detection
- References boot.md for protocols
- Suggests task boundaries for complex work
- Knows archaiforge CLI commands

---

## Configuration

**VS Code Settings** (optional):
```json
{
  "github.copilot.advanced": {
    "debug.workspace": true
  },
  "files.watcherExclude": {
    "**/.archaiforge/vectors/**": true
  }
}
```

---

## Comparison Matrix

| Feature | GEMINI | WARP | CLINE | COPILOT |
|---------|--------|------|-------|---------|
| Signature | Required | Terminal | N/A | N/A |
| Drift Detection | Auto | Manual | Auto | Manual |
| Task Boundaries | Artifacts | Commands | Files | Suggestions |
| Integration Depth | Deep | Medium | Deep | Surface |
| Enforcement | Architectural | Procedural | Procedural | Guidance |

---

**Status**: Ready to use  
**Maintenance**: Update .github/copilot-instructions.md as protocols evolve
