# CLEAR AI™ - Cognitive Steering Methodology
## Enhanced with Failure-Mode Prevention Gates

**Version:** 2.0 - Protected Binary  
**Status:** Authoritative Methodology  
**Purpose:** Prevent ghost systems, enforce causal completeness, eliminate simulation

---

## CORE PRINCIPLES (Non-Negotiable)

### Principle 1: No Mock or Simulated Systems
**Zero tolerance for illusions.**

Every system claimed must be:
- **Real backend** - Not simulated API responses
- **Real database** - Not mock data arrays (MOCK_BOOKS, MOCK_USERS, etc.)
- **Real state** - Not fake progress indicators
- **Working end-to-end** - Not "looks like it works"

**Violation Examples:**
```javascript
// ❌ VIOLATION
const MOCK_BOOKS = [{title: "Example"}];

// ❌ VIOLATION  
function simulateProgress() {
  progressBar.value += 10; // not tracking real work
}

// ❌ VIOLATION
return {status: "success"}; // but nothing actually happened

// ✅ CORRECT
const books = await fetch('/api/books').then(r => r.json());

// ✅ CORRECT
const progress = await checkJobStatus(jobId); // real backend job

// ✅ CORRECT
const result = await database.books.create(data); // actual persistence
```

**Enforcement:**
- Gate 3.1 scans for mock patterns
- Gate 5.1 validates all claimed systems exist
- No exceptions except explicit user request for prototype

---

### Principle 2: Inverse Completion Requirement
**Every action must have its causal inverse.**

If a system can transition to state B, it must provide a path to reverse:

| Action | Required Inverse | Why |
|--------|------------------|-----|
| CREATE book | DELETE book | Undo creation |
| UPLOAD file | REMOVE file | Free storage |
| APPLY migration | ROLLBACK migration | Recover from failures |
| ENABLE feature | DISABLE feature | Control scope |
| SCORE chapter | CLEAR/RESET score | Allow re-evaluation |
| PUBLISH version | UNPUBLISH/ARCHIVE | Correct mistakes |
| GRANT permission | REVOKE permission | Security |
| START process | STOP/CANCEL process | Resource control |
| LOCK resource | UNLOCK resource | Prevent deadlocks |

**Validation:**
- Every CREATE operation requires corresponding DELETE
- Every mutation requires rollback path
- Every enabled state requires disabled state
- No one-way operations

**Example - Complete CRUD:**
```python
# ✅ CORRECT - All inverses exist
class BookAPI:
    def create_book(data) -> Book:      # Action
    def delete_book(book_id) -> None:   # Inverse
    
    def update_book(book_id, data):     # Action
    # Inverse is implicit: previous state in version history
    
    def publish_book(book_id):          # Action
    def unpublish_book(book_id):        # Inverse

# ❌ VIOLATION - No inverse
class BookAPI:
    def create_book(data) -> Book:
    # Missing: delete_book
```

**Ghost Detection:**
- Gate 2.1 scans for missing inverse operations
- Gate 5.1 validates inverse operations exist
- Cannot deploy without complete action/inverse pairs

---

### Principle 3: Causal Completeness
**Every claimed system must have causal proof of existence.**

**Hierarchy of Proof:**
1. **File exists** - Code, schema, config actually written
2. **Tests pass** - System demonstrably works
3. **Integration verified** - Connects to dependent systems
4. **Inverse verified** - Rollback/undo path tested

**Not Proof:**
- Acceptance criteria checked ✓ (but file doesn't exist)
- Documentation written (but code missing)
- "It should work" (but not tested)
- "We'll add it later" (not logged in ledger)

---

## FIVE-PHASE WORKFLOW

Each phase includes **mandatory validation gates** that enforce the core principles.

---

## PHASE 1: CLARITY
**Purpose:** Restate objective, extract operational truth, resolve ambiguity

### Standard Behaviors
- Parse user directive into actionable intent
- Identify scope boundaries
- Extract success criteria

---

### GATE 1.1: Realm3X Ambiguity Resolution
**Trigger:** ANY of:
- Vague terms (improve, optimize, enhance, innovate, scalable, robust)
- Multiple valid interpretations
- Scope unclear or expanding
- Strategic decision with multiple paths

**CLI:**
```bash
archaiforge realm3x analyze --input directive.json --output scenarios.json
```

**Required Output:**
```json
{
  "directive": "Add authentication to the app",
  "ambiguities": [
    {
      "id": "AMB-001",
      "term": "authentication",
      "interpretations": ["OAuth", "JWT", "Session-based", "Magic links"],
      "severity": "high"
    }
  ],
  "scenarios": [
    {
      "id": "S1",
      "name": "JWT with refresh tokens",
      "scope": "Backend API + frontend integration",
      "effort": "3 days",
      "risk": "low"
    },
    {
      "id": "S2", 
      "name": "OAuth (Google, GitHub)",
      "scope": "Third-party integration + fallback",
      "effort": "5 days",
      "risk": "medium"
    }
  ],
  "clarifying_questions": [
    "Will users have email/password or social login?",
    "Do you need multi-factor authentication?",
    "Session timeout requirements?"
  ],
  "recommended_scenario": "S1",
  "confidence": 0.75
}
```

**Validation Rules:**
- Ambiguity severity > 0.7 → BLOCKS progression
- User MUST select scenario explicitly
- Selected scenario becomes new directive
- Logged in ledger with timestamp

**Cannot Exit Clarity Until:**
- All ambiguities < 0.3 severity OR
- User explicitly selects scenario
- Directive restated in operational terms

---

### GATE 1.2: Adaptive Persona Gap Detection
**Trigger:** Always (automatic)

**CLI:**
```bash
archaiforge persona generate --domain [detected] --phase "clarity" --output persona.json
archaiforge persona embody --persona-id [id] --directive directive.json --output gaps.json
```

**Personas Applied (Automatic):**
1. **Security Persona** - "What auth/access control exists?"
2. **UX Persona** - "What's the complete user journey?"
3. **Backend Persona** - "What data flows are implied?"
4. **DevOps Persona** - "What infrastructure is needed?"
5. **QA Persona** - "How will this be tested?"

**Required Questions (Per Persona):**

**Security Persona:**
```
- How will API keys be stored?
- What happens if auth token expires?
- How are passwords hashed?
- What's the session timeout?
- How do we prevent CSRF?
```

**UX Persona:**
```
- What happens on failed login?
- Where does user go after successful login?
- What if user forgets password?
- Mobile vs desktop experience?
- Loading states during auth check?
```

**Backend Persona:**
```
- What database tables are needed?
- How do we store user sessions?
- API endpoints required?
- Rate limiting strategy?
```

**DevOps Persona:**
```
- How do environment variables get loaded?
- Local development vs production secrets?
- How do we rotate API keys?
```

**Output Format:**
```json
{
  "gaps_detected": [
    {
      "persona": "Security",
      "gap": "No password reset flow defined",
      "severity": "high",
      "requires_story": true
    },
    {
      "persona": "UX",
      "gap": "No error state for 'wrong password'",
      "severity": "medium",
      "requires_story": false,
      "add_to_acceptance_criteria": "Story-AUTH-001"
    }
  ],
  "new_stories_required": 2,
  "updated_stories": 1,
  "status": "gaps_identified"
}
```

**Validation:**
- All "high" severity gaps → must create stories
- All "medium" severity → add to acceptance criteria
- All personas must confirm OR gaps documented
- Cannot proceed with unacknowledged gaps

**Cannot Exit Clarity Until:**
- All personas have validated directive
- All critical gaps have stories/criteria
- Gap list logged in ledger

---

## PHASE 2: LIMITS
**Purpose:** Map constraints, assess feasibility, prevent ghost systems

### Standard Behaviors
- Identify technical constraints
- Map resource limitations
- Define what's out of scope

---

### GATE 2.1: Architecture Inventory - Per Application
**Trigger:** Always (automatic)

**CLI:**
```bash
archaiforge architecture inventory --app [app-name] --output app_architecture.json
```

**Scans For:**
- Backend APIs (endpoints, handlers, tests)
- Database schemas (models, migrations, indexes)
- Security layers (auth, encryption, validation)
- Foundational UI systems (nav, modals, errors, empty states)
- Inverse operations (create/delete, enable/disable pairs)

**Required Output:**
```json
{
  "application": "manuscript-eval",
  "scan_timestamp": "2025-12-22T10:30:00Z",
  
  "backend_apis": [
    {
      "endpoint": "/api/books",
      "methods": ["GET", "POST"],
      "handler": "backend/routes/books.py",
      "status": "exists",
      "tested": true,
      "inverse_exists": true,
      "inverse_endpoint": "DELETE /api/books/:id"
    },
    {
      "endpoint": "/api/chapters",
      "status": "GHOST",
      "claimed_in": "Story-011 acceptance criteria",
      "actual_status": "File not found: backend/routes/chapters.py"
    }
  ],
  
  "schemas": [
    {
      "name": "Book",
      "file": "backend/models/book.py",
      "status": "exists",
      "migrations": ["0001_create_books_table.py"],
      "inverse_operations": {
        "create": "exists",
        "delete": "exists",
        "cascade_rules": "defined"
      }
    },
    {
      "name": "Chapter",
      "status": "GHOST",
      "claimed_in": "Story-011",
      "actual_status": "Not found"
    }
  ],
  
  "security_layer": {
    "authentication": {
      "status": "NOT_ADDRESSED",
      "severity": "critical"
    },
    "authorization": {
      "status": "NOT_ADDRESSED",
      "severity": "critical"
    },
    "encryption": {
      "status": "NOT_ADDRESSED",
      "severity": "high"
    }
  },
  
  "foundational_ui": {
    "navigation": {
      "status": "exists",
      "file": "frontend/components/nav.html"
    },
    "modals": {
      "status": "GHOST",
      "referenced_in": "frontend/wizard.js:89",
      "actual_status": "Component not found"
    },
    "error_states": {
      "status": "GHOST",
      "required_for": ["network errors", "validation errors"],
      "actual_status": "No error components found"
    },
    "empty_states": {
      "status": "GHOST",
      "required_for": ["no books", "no chapters"],
      "actual_status": "No empty state components"
    },
    "progress_indicators": {
      "status": "exists",
      "file": "frontend/components/progress.html"
    }
  },
  
  "mock_data_scan": {
    "violations": [
      {
        "file": "frontend/prototype.html",
        "line": 259,
        "code": "const MOCK_BOOKS = [...]",
        "severity": "critical",
        "principle_violated": "No Mock Systems"
      }
    ],
    "total_violations": 1
  },
  
  "inverse_completeness": {
    "missing_inverses": [
      {
        "action": "CREATE book",
        "inverse": "DELETE book",
        "status": "MISSING",
        "severity": "high"
      },
      {
        "action": "APPLY migration",
        "inverse": "ROLLBACK migration",
        "status": "MISSING",
        "severity": "critical"
      }
    ],
    "total_missing": 2
  },
  
  "ghost_summary": {
    "total_ghosts": 5,
    "critical": 2,
    "high": 2,
    "medium": 1,
    "status": "BLOCKER"
  }
}
```

**Validation Rules:**
- **CRITICAL ghosts** → cannot proceed
- **HIGH ghosts** → requires explicit acknowledgment + epic for remediation
- **MEDIUM ghosts** → warning logged, can proceed
- **Mock data violations** → must fix OR get user approval for prototype
- **Missing inverses** → must implement OR explicitly defer

**Cannot Exit Limits Until:**
- Ghost count = 0 OR all ghosts have remediation epics
- Mock data violations = 0 OR user approves prototype mode
- All missing inverses implemented OR deferred with reason
- Inventory logged in ledger

---

### GATE 2.2: Security Review - Mandatory
**Trigger:** Always (automatic)

**CLI:**
```bash
archaiforge security review --architecture app_architecture.json --output security_report.json
```

**Required Checklist:**
```json
{
  "application": "manuscript-eval",
  "security_review": {
    "authentication": {
      "checked": false,
      "mechanism": "undefined",
      "status": "REQUIRED"
    },
    "authorization": {
      "checked": false,
      "model": "undefined",
      "status": "REQUIRED"
    },
    "encryption": {
      "at_rest": false,
      "in_transit": false,
      "status": "REQUIRED"
    },
    "input_validation": {
      "checked": false,
      "strategy": "undefined",
      "status": "REQUIRED"
    },
    "session_management": {
      "checked": false,
      "strategy": "undefined",
      "status": "REQUIRED"
    },
    "api_security": {
      "rate_limiting": false,
      "cors": false,
      "csrf_protection": false,
      "status": "REQUIRED"
    },
    "secrets_management": {
      "checked": false,
      "method": "undefined",
      "status": "REQUIRED"
    }
  },
  "checks_passed": 0,
  "checks_total": 7,
  "status": "BLOCKER",
  "options": [
    "Implement now (adds 2-3 stories to current epic)",
    "Defer explicitly (create DEBT epic with justification)"
  ]
}
```

**Validation Rules:**
- **ALL checkboxes** must be:
  - Checked (implemented), OR
  - Explicitly deferred with:
    - Written justification
    - Epic ID for remediation
    - Security approval logged

**Deferral Template:**
```json
{
  "security_item": "Authentication",
  "deferred": true,
  "reason": "Prototype for single local user, no network exposure",
  "remediation_epic": "DEBT-001: Security Hardening",
  "approved_by": "user",
  "approval_timestamp": "2025-12-22T11:00:00Z",
  "deployment_restriction": "localhost only, no production use"
}
```

**Cannot Exit Limits Until:**
- All security items checked OR
- All deferrals documented + logged
- User acknowledges deployment restrictions

---

### GATE 2.3: Semantic Completeness Check
**Trigger:** Any UI/UX component in directive

**CLI:**
```bash
archaiforge semantic-ui map --system [system-name] --output semantic_map.json
```

**Required Semantic Systems:**

**Category 1: Authentication & Access**
- Login flow (form, validation, submission, success, error)
- Logout flow (confirmation, cleanup)
- Password reset (request, email, reset form)
- Session expired (detection, message, redirect)

**Category 2: Navigation**
- Primary navigation (menu, active states)
- Secondary navigation (submenus, breadcrumbs)
- Mobile navigation (hamburger, drawer)
- Deep linking (URL routing)

**Category 3: Modals & Overlays**
- Confirmation dialogs (yes/no, cancel)
- Info dialogs (OK button)
- Error dialogs (message, dismiss)
- Loading overlays (spinner, message)
- Wizards/multi-step (progress, next/back, cancel)

**Category 4: Progress & Feedback**
- Loading indicators (spinner, skeleton, progress bar)
- Processing states (uploading, saving, computing)
- Completion states (success checkmark, message)
- Progress tracking (steps, percentage)

**Category 5: Error & Edge States**
- Validation errors (field-level, form-level)
- Network errors (offline, timeout, 500)
- Permission errors (401, 403)
- Not found (404)
- Generic errors (fallback)

**Category 6: Empty & Initial States**
- No data (first use, empty list)
- Search no results
- Filtered no results
- Deleted items (undo option)

**Category 7: Success & Confirmation**
- Action success (toast, banner)
- Saved/updated (indicator, message)
- Deleted (confirmation, undo)

**Required Output:**
```json
{
  "system": "manuscript-eval",
  "semantic_coverage": {
    "authentication_flows": {
      "login": "GHOST",
      "logout": "GHOST",
      "password_reset": "GHOST",
      "session_expired": "GHOST",
      "status": "DEFERRED - DEBT-001"
    },
    "navigation": {
      "primary": "exists",
      "secondary": "not_required",
      "mobile": "GHOST",
      "deep_linking": "GHOST"
    },
    "modals": {
      "confirmation": "GHOST",
      "info": "GHOST",
      "error": "GHOST",
      "loading": "exists",
      "wizard": "exists"
    },
    "progress": {
      "loading_spinner": "exists",
      "progress_bar": "exists",
      "success_checkmark": "exists",
      "step_indicator": "exists"
    },
    "errors": {
      "validation": "GHOST",
      "network": "GHOST",
      "permission": "GHOST",
      "not_found": "GHOST",
      "generic": "GHOST"
    },
    "empty_states": {
      "no_books": "GHOST",
      "no_chapters": "GHOST",
      "search_no_results": "not_required"
    },
    "success_states": {
      "toast_notifications": "exists",
      "saved_indicator": "exists"
    }
  },
  "missing_systems": [
    {
      "category": "modals",
      "system": "confirmation_dialog",
      "required_by": ["delete book", "discard changes"],
      "severity": "high"
    },
    {
      "category": "errors",
      "system": "error_state_components",
      "required_by": ["network failures", "validation"],
      "severity": "critical"
    },
    {
      "category": "empty_states",
      "system": "no_books_empty_state",
      "required_by": ["first use", "deleted all"],
      "severity": "medium"
    }
  ],
  "required_stories": [
    {
      "id": "STORY-MODAL-001",
      "name": "Modal Component System",
      "epic": "EPIC-1",
      "effort": "6 hours"
    },
    {
      "id": "STORY-ERROR-001",
      "name": "Error State Components",
      "epic": "EPIC-1",
      "effort": "4 hours"
    },
    {
      "id": "STORY-EMPTY-001",
      "name": "Empty State Components",
      "epic": "EPIC-1",
      "effort": "3 hours"
    }
  ],
  "coverage_score": 0.42,
  "status": "INCOMPLETE"
}
```

**Validation Rules:**
- Coverage < 0.8 → creates missing system stories
- All "GHOST" systems → must become "exists" or "deferred"
- Cannot omit foundational systems silently
- Each missing system generates story OR explicit deferral

**Cannot Exit Limits Until:**
- All required semantic systems exist OR
- Gaps acknowledged + stories created
- Coverage logged in ledger

---

### GATE 2.4: Dependency Graph Validation (NEW - CRITICAL)
**Trigger:** Always (automatic)

**CLI:**
```bash
archaiforge dependencies validate --epic [epic-id] --output conflicts.json
```

**Validates:**
- Story dependencies form valid DAG (no cycles)
- Critical path identified
- Cross-epic dependencies explicit
- Blocking stories flagged

**Required Output:**
```json
{
  "epic_id": "EPIC-1",
  "stories": 9,
  "dependency_graph": {
    "valid_dag": true,
    "circular_dependencies": [],
    "critical_path": [
      "Story-022 → Story-023 → Story-011 → Story-041"
    ],
    "critical_path_duration": "38 hours",
    "blockers": [
      {
        "story": "Story-041",
        "blocked_by": ["Story-025", "Story-011"],
        "impact": "Cannot start onboarding without component loader and database"
      }
    ]
  },
  "complexity_warnings": [
    {
      "story": "Story-041",
      "dependencies": 3,
      "depth": 3,
      "message": "Story requires 3 prerequisite stories (high complexity)"
    }
  ],
  "cross_epic_dependencies": [],
  "status": "valid"
}
```

**Validation Rules:**
- Circular dependencies detected → BLOCKER
- Story with >3 direct dependencies → warning
- Critical path identified (for scheduling)
- Cross-epic dependencies must be explicit

**Cannot Exit Limits Until:**
- No circular dependencies
- Critical path identified
- All dependencies logged

---

## PHASE 3: EXAMPLES
**Purpose:** Decompose systems, explore patterns, validate assumptions

### Standard Behaviors
- Break down into components
- Identify patterns
- Map dependencies

---

### GATE 3.1: No Mock Data Unless Specified
**Trigger:** Any data-dependent component

**CLI:**
```bash
archaiforge data-strategy validate --component [name] --output strategy.json
```

**Default Rule:** ALL data interfaces use real implementations

**Scan Patterns:**
```javascript
// VIOLATIONS (auto-detected)
const MOCK_BOOKS = [...];
const FAKE_DATA = [...];
const SAMPLE_USERS = [...];
const TEST_DATA = [...];
let simulatedResponse = {...};

// Pattern: const [MOCK|FAKE|SAMPLE|TEST|SIMULATED]_* = 
```

**Required Output:**
```json
{
  "component": "BookDashboard",
  "data_dependencies": [
    {
      "source": "books",
      "current_implementation": "MOCK_BOOKS array",
      "violation": true,
      "severity": "critical"
    }
  ],
  "user_choice_required": true,
  "options": [
    {
      "option": "real-api",
      "description": "Replace with fetch('/api/books')",
      "requires": ["Backend API", "Database"],
      "blockers": ["Story-022", "Story-023", "Story-011"]
    },
    {
      "option": "mock-explicit",
      "description": "Keep mock data for prototype",
      "requires": ["User approval", "Transition plan"],
      "transition_epic": "REAL-DATA-001"
    },
    {
      "option": "deferred",
      "description": "Build UI, integrate later",
      "requires": ["Story for integration"],
      "integration_epic": "INTEGRATE-001"
    }
  ]
}
```

**User Must Choose:**
```
VIOLATION DETECTED: MOCK_BOOKS in frontend/prototype.html:259

Options:
1. Replace with real API (creates dependency on Epic-1 Stories 22-24)
2. Keep as explicit prototype mock (requires transition plan)
3. Defer integration (creates integration story)

User choice: [1, 2, or 3]
```

**Validation Rules:**
- "real-api" → preferred, no restrictions
- "mock-explicit" → requires:
  - User explicitly requested
  - Transition plan documented
  - Epic created for real implementation
  - Code marked with `// PROTOTYPE MOCK - REMOVE` comments
- "deferred" → requires integration story

**Cannot Exit Examples Until:**
- All mock data violations resolved
- User choices logged
- Transition plans documented

---

### GATE 3.2: Persona-Driven Pattern Validation
**Trigger:** For each major component

**CLI:**
```bash
archaiforge persona embody --persona-id [domain-expert] --validate-component [name] --output validation.json
```

**Personas Applied (Per Component):**

**For Backend Components:**
- Security Persona
- Performance Persona
- Data Integrity Persona

**For Frontend Components:**
- UX Persona
- Accessibility Persona
- Performance Persona

**For Integration Components:**
- Backend Persona (validates API contract)
- Frontend Persona (validates data handling)
- Error Handling Persona

**Example: Story-025 (Component Loader + State Management)**

**Security Persona Questions:**
```
Component: Component Loader
Loads: HTML files dynamically via fetch

Questions:
1. How do we prevent XSS if user content in components?
2. Is innerHTML sanitized before injection?
3. Can malicious component hijack state?

Gaps Found:
- No sanitization strategy
- Direct innerHTML usage

Required Fix:
- Add DOMPurify or similar sanitizer
- Add to acceptance criteria: "Sanitize component HTML before injection"
```

**UX Persona Questions:**
```
Component: State Management (pub-sub)

Questions:
1. What if state update fails?
2. What if update is slow (network delay)?
3. How does user know state is changing?

Gaps Found:
- No loading states for state transitions
- No rollback on failed update

Required Fix:
- Add loading indicators
- Add optimistic update + rollback pattern
```

**Performance Persona Questions:**
```
Component: Component Loader

Questions:
1. Are components cached after first load?
2. What if component fetch fails?
3. What's the performance impact of fetch per component?

Gaps Found:
- No caching strategy
- No error handling on fetch failure

Required Fix:
- Add component cache
- Add retry logic
```

**Required Output:**
```json
{
  "component": "ComponentLoader",
  "story": "Story-025",
  "personas_applied": ["Security", "UX", "Performance"],
  "gaps_found": [
    {
      "persona": "Security",
      "gap": "No XSS protection",
      "severity": "critical",
      "fix": "Add DOMPurify sanitization",
      "add_to_criteria": true
    },
    {
      "persona": "UX",
      "gap": "No loading states",
      "severity": "medium",
      "fix": "Add loading indicators during state updates",
      "add_to_criteria": true
    },
    {
      "persona": "Performance",
      "gap": "No component caching",
      "severity": "low",
      "fix": "Cache loaded components",
      "add_to_criteria": false,
      "defer_to": "PERF-001"
    }
  ],
  "acceptance_criteria_updates": 2,
  "status": "gaps_addressed"
}
```

**Validation Rules:**
- All "critical" gaps → must fix before proceeding
- All "high" gaps → add to acceptance criteria
- "medium/low" gaps → can defer to future story

**Cannot Exit Examples Until:**
- All personas have validated each component
- All critical gaps addressed
- Updated acceptance criteria logged

---

### GATE 3.3: Performance Assumption Validation (NEW - CRITICAL)
**Trigger:** Any performance claim in acceptance criteria

**CLI:**
```bash
archaiforge performance validate --story [story-id] --output perf_validation.json
```

**Detection Patterns:**
```
// Triggers in acceptance criteria:
- "within X seconds"
- "under Y milliseconds"
- "handles Z requests per second"
- "supports N concurrent users"
- "uses less than M MB memory"
- "processes X records in Y time"
```

**Example: Story-078 (Style Extraction Engine)**

**Acceptance Criteria:**
```
- [ ] Processes 50,000-word draft in under 10 seconds
```

**Validation:**
```json
{
  "story_id": "Story-078",
  "performance_claims": [
    {
      "claim": "Processes 50,000-word draft in under 10 seconds",
      "components_involved": [
        "LLM API call (Claude Sonnet)",
        "Text parsing",
        "Style analysis"
      ],
      "evidence": "none",
      "risk_assessment": {
        "llm_latency": "Variable, typically 2-8s for 5k tokens",
        "input_size": "50k words ≈ 65k tokens",
        "realistic_time": "15-30 seconds",
        "risk": "HIGH - claim likely unachievable"
      },
      "status": "UNVALIDATED"
    }
  ],
  "options": [
    {
      "option": "benchmark",
      "description": "Create benchmark story to test actual performance",
      "story": "Story-078-PERF: Benchmark style extraction",
      "effort": "2 hours"
    },
    {
      "option": "revise_criteria",
      "description": "Change to realistic time (e.g., 'under 30 seconds')",
      "impact": "Acceptance criteria update"
    },
    {
      "option": "acknowledge_risk",
      "description": "Keep claim, document as assumption with contingency",
      "requires": "Contingency plan if performance insufficient"
    }
  ],
  "recommendation": "revise_criteria",
  "status": "REQUIRES_ACTION"
}
```

**Validation Rules:**
- Performance claim without evidence → BLOCKER
- HIGH risk claims → must:
  - Create benchmark story, OR
  - Revise to realistic criteria, OR
  - Document as assumption with contingency
- MEDIUM risk → warning, can proceed with acknowledgment
- LOW risk → logged, no blocking

**Cannot Exit Examples Until:**
- All HIGH risk performance claims resolved
- Benchmark stories created OR criteria revised
- All assumptions logged with contingency plans

---

## PHASE 4: ADAPTATION
**Purpose:** Synthesize specs, integrate components, validate implementation

### Standard Behaviors
- Create implementation specs
- Define integration points
- Prepare execution plan

---

### GATE 4.1: Per-Epic Architecture Validation
**Trigger:** At completion of EACH epic

**CLI:**
```bash
archaiforge architecture validate --epic [epic-id] --output epic_validation.json
```

**Validates (Per Epic):**
1. All backend APIs implemented (not ghost)
2. All schemas exist (files, migrations)
3. All security claims verified
4. All foundational UI exists
5. All tests passing (if claimed in criteria)
6. All inverse operations exist

**Required Output:**
```json
{
  "epic_id": "EPIC-1",
  "epic_name": "Foundation & Onboarding",
  "validation_timestamp": "2025-12-22T16:00:00Z",
  
  "backend_apis": [
    {
      "endpoint": "/api/books",
      "claimed_in": "Story-011",
      "implementation": {
        "file": "backend/routes/books.py",
        "handler": "get_books()",
        "exists": true,
        "tested": true,
        "test_file": "tests/test_books.py"
      },
      "inverse": {
        "endpoint": "DELETE /api/books/:id",
        "exists": true,
        "cascade_defined": true
      },
      "status": "VALIDATED"
    },
    {
      "endpoint": "/api/chapters",
      "claimed_in": "Story-011",
      "implementation": {
        "exists": false,
        "error": "File not found: backend/routes/chapters.py"
      },
      "status": "GHOST"
    }
  ],
  
  "schemas": [
    {
      "name": "Book",
      "claimed_in": "Story-011",
      "implementation": {
        "model_file": "backend/models/book.py",
        "migration": "migrations/0001_create_books.py",
        "exists": true,
        "fields_validated": true
      },
      "inverse_operations": {
        "delete": "cascade to chapters, images",
        "status": "VALIDATED"
      },
      "status": "VALIDATED"
    },
    {
      "name": "Chapter",
      "claimed_in": "Story-011",
      "implementation": {
        "exists": false,
        "error": "No model file found"
      },
      "status": "GHOST"
    }
  ],
  
  "security": {
    "status": "DEFERRED",
    "epic": "DEBT-001",
    "justification": "Single-user localhost prototype"
  },
  
  "foundational_ui": [
    {
      "component": "modal_system",
      "claimed_in": "Story-041",
      "implementation": {
        "file": "frontend/components/modal.html",
        "exists": true,
        "confirmed_in_use": true
      },
      "status": "VALIDATED"
    },
    {
      "component": "error_states",
      "claimed_in": "Story-041",
      "implementation": {
        "exists": false,
        "error": "No error components found"
      },
      "status": "GHOST"
    }
  ],
  
  "ghost_check": {
    "total_ghosts": 3,
    "details": [
      {"type": "api", "name": "/api/chapters"},
      {"type": "schema", "name": "Chapter"},
      {"type": "ui", "name": "error_states"}
    ],
    "status": "EPIC_INCOMPLETE"
  },
  
  "tests": {
    "claimed": true,
    "test_files_found": 1,
    "tests_passing": true,
    "coverage": "45%"
  },
  
  "overall_status": "BLOCKED",
  "blockers": [
    "3 ghost systems must be implemented",
    "Chapter API missing",
    "Error states missing"
  ]
}
```

**Validation Rules:**
- Ghost count > 0 → EPIC NOT COMPLETE
- All "claimed_in" items must have "exists: true"
- All inverse operations must exist
- Tests claimed → tests must pass

**Cannot Mark Epic Complete Until:**
- Ghost count = 0
- All implementations validated
- All tests passing (if claimed)
- Validation logged in ledger

**Options if Blocked:**
```
1. Implement missing systems (recommended)
2. Remove claims from acceptance criteria (scope reduction)
3. Create follow-up epic for missing items (explicit deferral)
```

---

### GATE 4.2: Integration Completeness
**Trigger:** When multiple components/epics integrate

**CLI:**
```bash
archaiforge integration validate --components [c1,c2] --output integration.json
```

**Validates:**
- API contracts match (frontend calls match backend provides)
- Schemas referenced exist on both sides
- Navigation paths point to real routes
- Modals referenced in code are implemented
- Data formats compatible (JSON schemas match)

**Required Output:**
```json
{
  "integration": "Frontend ↔ Backend",
  "timestamp": "2025-12-22T16:30:00Z",
  
  "api_contracts": [
    {
      "frontend_call": {
        "file": "frontend/app.js:142",
        "code": "fetch('/api/score', {method: 'POST', body: JSON.stringify({chapter_id})})"
      },
      "backend_provides": {
        "endpoint": "/api/score",
        "status": "NOT_FOUND",
        "error": "No route handler exists"
      },
      "status": "GHOST_API",
      "severity": "critical"
    },
    {
      "frontend_call": {
        "file": "frontend/dashboard.js:67",
        "code": "fetch('/api/books')"
      },
      "backend_provides": {
        "endpoint": "/api/books",
        "handler": "backend/routes/books.py:get_books",
        "status": "VALIDATED"
      },
      "response_format_match": true,
      "status": "OK"
    }
  ],
  
  "schema_references": [
    {
      "frontend_expects": {
        "file": "frontend/types.js",
        "schema": "Book {id, title, author, created_at}"
      },
      "backend_provides": {
        "model": "backend/models/book.py",
        "fields": ["id", "title", "created_at"],
        "missing_fields": ["author"]
      },
      "status": "SCHEMA_MISMATCH",
      "severity": "high"
    }
  ],
  
  "navigation_integrity": [
    {
      "route": "/editor/:bookId/:chapterId",
      "defined_in": "frontend/router.js",
      "component": "EditorView",
      "exists": true,
      "status": "OK"
    }
  ],
  
  "modal_references": [
    {
      "code": "loadComponent('confirmation-modal')",
      "file": "frontend/app.js:89",
      "component_file": "frontend/components/confirmation-modal.html",
      "exists": false,
      "status": "GHOST_COMPONENT",
      "severity": "critical"
    }
  ],
  
  "ghost_summary": {
    "ghost_apis": 1,
    "ghost_components": 1,
    "schema_mismatches": 1,
    "total_issues": 3,
    "status": "INTEGRATION_BROKEN"
  }
}
```

**Validation Rules:**
- Ghost APIs → must implement backend OR remove frontend call
- Ghost components → must create component OR remove reference
- Schema mismatches → must align or document intentional difference

**Cannot Proceed Until:**
- All ghost APIs resolved
- All ghost components created
- All schema mismatches aligned
- Integration validation logged

---

### GATE 4.3: Cross-Epic Integration Validation (NEW - CRITICAL)
**Trigger:** When starting Epic N+1 that depends on Epic N

**CLI:**
```bash
archaiforge integration validate --epics EPIC-1,EPIC-3 --output cross_epic.json
```

**Validates:**
1. Epic 3 assumptions about Epic 1 artifacts
2. Breaking changes detection
3. Migration path if changes required

**Required Output:**
```json
{
  "integration": "EPIC-1 → EPIC-3",
  "epic_1_artifacts": {
    "schemas": ["Book", "Chapter"],
    "apis": ["/api/books", "/api/chapters"],
    "version": "1.0"
  },
  
  "epic_3_assumptions": [
    {
      "story": "Story-070",
      "assumes": "Book model has 'images' relationship",
      "epic_1_provides": {
        "model": "Book",
        "relationships": ["chapters"],
        "missing": ["images"]
      },
      "status": "SCHEMA_GAP",
      "severity": "blocker",
      "resolution": "Add 'images' relationship to Book model in Epic 1"
    },
    {
      "story": "Story-071",
      "assumes": "POST /api/images exists",
      "epic_1_provides": "none",
      "status": "NEW_API",
      "severity": "ok",
      "note": "Epic 3 introduces new API, not a breaking change"
    }
  ],
  
  "breaking_changes": [],
  
  "required_migrations": [
    {
      "epic": "EPIC-1",
      "change": "Add images relationship to Book model",
      "migration_story": "Story-MIGRATE-001",
      "effort": "2 hours"
    }
  ],
  
  "status": "BLOCKED",
  "blockers": [
    "Story-070 requires Book.images relationship"
  ]
}
```

**Validation Rules:**
- Epic N+1 cannot modify Epic N schemas without migration
- Breaking changes require explicit migration story
- New APIs in Epic N+1 are allowed
- Must validate Epic N artifacts match Epic N+1 assumptions

**Cannot Start Epic N+1 Until:**
- All blockers resolved
- Migration stories created (if needed)
- Epic N artifacts validated
- Cross-epic dependencies logged

---

## PHASE 5: REFLECTION
**Purpose:** Validate quality, assess readiness, final verification

### Standard Behaviors
- Review against success criteria
- Identify gaps
- Assess deployment readiness

---

### GATE 5.1: Final Ghost System Check
**Trigger:** Always (automatic before deployment)

**CLI:**
```bash
archaiforge ghost-check scan --application [app-name] --output ghost_report.json
```

**Comprehensive Scan:**

**1. Ghost APIs:**
```javascript
// Scans all files for fetch() calls
grep -r "fetch\('\/api" frontend/
grep -r "axios\." frontend/
grep -r "http\.get" frontend/

// Cross-reference with backend routes
for each API call:
  verify backend route handler exists
  verify handler is tested
  verify inverse operation exists
```

**2. Ghost Schemas:**
```python
# Scans for imports
grep -r "from models import" backend/
grep -r "import.*Model" backend/

# Cross-reference with actual model files
for each import:
  verify model file exists
  verify schema defined
  verify migration exists
```

**3. Ghost Components:**
```javascript
// Scans for component loads
grep -r "loadComponent\(" frontend/
grep -r "import.*from.*components" frontend/

// Cross-reference with component files
for each component reference:
  verify component file exists
  verify component renders
```

**4. Ghost Security:**
```
// Scans acceptance criteria for security claims
grep -r "auth" acceptance_criteria/
grep -r "encrypt" acceptance_criteria/
grep -r "secure" acceptance_criteria/

// Cross-reference with implementation
for each security claim:
  verify implementation exists
  verify configuration present
  verify tests exist
```

**5. Mock Data Violations:**
```javascript
// Scans for mock patterns
grep -r "const.*MOCK" frontend/
grep -r "const.*FAKE" frontend/
grep -r "const.*SAMPLE" frontend/
grep -r "simulat" frontend/ backend/

// Cross-reference with data strategy
for each mock:
  verify user approved OR
  verify transition plan exists
```

**6. Missing Inverses:**
```
// For each action operation:
for action in [CREATE, ENABLE, PUBLISH, LOCK, START]:
  verify inverse exists [DELETE, DISABLE, UNPUBLISH, UNLOCK, STOP]
  verify inverse tested
  verify inverse accessible in UI
```

**Required Output:**
```json
{
  "application": "manuscript-eval",
  "scan_timestamp": "2025-12-22T18:00:00Z",
  "scan_depth": "comprehensive",
  
  "ghost_apis": [
    {
      "claimed_location": "frontend/wizard.js:67",
      "code": "fetch('/api/calibrate')",
      "method": "POST",
      "backend_status": "NOT_FOUND",
      "error": "No route handler in backend/routes/",
      "severity": "critical"
    },
    {
      "claimed_location": "frontend/app.js:142",
      "code": "fetch('/api/score')",
      "backend_status": "NOT_FOUND",
      "severity": "critical"
    }
  ],
  
  "ghost_schemas": [
    {
      "claimed_location": "backend/routes/books.py:3",
      "code": "from models.eval_model import EvalModel",
      "actual_status": "FILE_NOT_FOUND",
      "path_checked": "backend/models/eval_model.py",
      "severity": "critical"
    }
  ],
  
  "ghost_components": [
    {
      "claimed_location": "frontend/app.js:89",
      "code": "loadComponent('confirmation-modal')",
      "file_checked": "frontend/components/confirmation-modal.html",
      "actual_status": "NOT_FOUND",
      "severity": "high"
    }
  ],
  
  "ghost_security": [
    {
      "claimed_in": "Story-024 acceptance criteria",
      "claim": "Backend reads environment variables on startup",
      "validation": {
        "file": "backend/main.py",
        "code_search": "os.getenv|environ|load_dotenv",
        "found": false
      },
      "severity": "critical"
    }
  ],
  
  "mock_data_violations": [
    {
      "file": "frontend/prototype.html",
      "line": 259,
      "code": "const MOCK_BOOKS = [...]",
      "approved": false,
      "transition_plan": "none",
      "severity": "critical"
    }
  ],
  
  "missing_inverses": [
    {
      "action": "CREATE book",
      "action_location": "POST /api/books",
      "inverse": "DELETE book",
      "inverse_expected": "DELETE /api/books/:id",
      "inverse_status": "NOT_FOUND",
      "severity": "high"
    },
    {
      "action": "APPLY migration",
      "action_location": "alembic upgrade head",
      "inverse": "ROLLBACK migration",
      "inverse_expected": "alembic downgrade -1",
      "inverse_status": "NOT_TESTED",
      "severity": "critical"
    }
  ],
  
  "summary": {
    "ghost_apis": 2,
    "ghost_schemas": 1,
    "ghost_components": 1,
    "ghost_security": 1,
    "mock_violations": 1,
    "missing_inverses": 2,
    "total_errors": 8,
    "total_warnings": 0
  },
  
  "deployment_status": "BLOCKED",
  "status": "ERRORS - Cannot deploy"
}
```

**Validation Rules:**
- **Critical severity** → deployment BLOCKED
- **High severity** → requires explicit acknowledgment
- **Medium severity** → warning, can deploy with caveat
- **Low severity** → logged, no blocking

**Cannot Deploy Until:**
- All critical errors resolved
- All high severity items acknowledged + remediation plan
- Ghost report status = "CLEAN" or "WARNINGS" only

---

### GATE 5.2: Security Final Review
**Trigger:** Always (automatic)

**CLI:**
```bash
archaiforge security final-review --app [app-name] --output security_final.json
```

**Final Security Checklist:**
```json
{
  "application": "manuscript-eval",
  "review_timestamp": "2025-12-22T18:30:00Z",
  
  "checklist": {
    "authentication": {
      "required": true,
      "implemented": false,
      "deferred": true,
      "deferral_epic": "DEBT-001",
      "deployment_restriction": "localhost only",
      "status": "DEFERRED_OK"
    },
    "authorization": {
      "required": true,
      "implemented": false,
      "deferred": true,
      "deferral_epic": "DEBT-001",
      "status": "DEFERRED_OK"
    },
    "encryption_at_rest": {
      "required": true,
      "implemented": false,
      "deferred": true,
      "deferral_epic": "DEBT-001",
      "status": "DEFERRED_OK"
    },
    "encryption_in_transit": {
      "required": true,
      "implemented": false,
      "deferred": true,
      "note": "HTTP in dev, HTTPS required for production",
      "status": "DEFERRED_OK"
    },
    "input_validation": {
      "required": true,
      "implemented": true,
      "implementation": "python-docx handles Word parsing, FastAPI validates requests",
      "status": "OK"
    },
    "session_management": {
      "required": true,
      "implemented": false,
      "deferred": true,
      "deferral_epic": "DEBT-001",
      "status": "DEFERRED_OK"
    },
    "api_security": {
      "rate_limiting": false,
      "cors": false,
      "csrf": false,
      "deferred": true,
      "deferral_epic": "DEBT-001",
      "status": "DEFERRED_OK"
    },
    "error_message_sanitization": {
      "required": true,
      "implemented": true,
      "validation": "No database errors exposed to frontend",
      "status": "OK"
    },
    "secrets_management": {
      "required": true,
      "implemented": true,
      "method": ".env file (dev only)",
      "production_requirement": "Must use secure secrets manager",
      "status": "OK_DEV_ONLY"
    }
  },
  
  "checks_implemented": 3,
  "checks_deferred": 6,
  "checks_total": 9,
  
  "deployment_approval": {
    "dev_environment": "APPROVED",
    "localhost_only": "APPROVED",
    "production": "BLOCKED",
    "production_blocker": "Security DEBT-001 must be implemented",
    "status": "CONDITIONAL_APPROVAL"
  },
  
  "remediation_required": {
    "epic": "DEBT-001",
    "stories": 5,
    "estimated_effort": "2 weeks",
    "must_complete_before": "Production deployment"
  }
}
```

**Validation Rules:**
- ALL items must be:
  - Implemented, OR
  - Explicitly deferred with epic + justification
- Deferrals must specify deployment restrictions
- Production deployment blocked until security complete

**Cannot Deploy to Production Until:**
- All security items implemented OR
- Deployment scoped to dev/localhost only
- Remediation epic created and logged

---

### GATE 5.3: Semantic Coverage Verification
**Trigger:** Always (automatic)

**CLI:**
```bash
archaiforge semantic coverage --app [app-name] --output coverage.json
```

**Coverage Categories:**

**1. User Journeys (Happy + Error Paths)**
```json
{
  "journey": "Create new book",
  "happy_path": {
    "steps": [
      "Click 'New Book'",
      "Fill form",
      "Submit",
      "See success",
      "Redirect to book"
    ],
    "coverage": "100%"
  },
  "error_paths": {
    "validation_error": {
      "trigger": "Empty title",
      "expected": "Show validation error",
      "actual": "MISSING",
      "coverage": "0%"
    },
    "network_error": {
      "trigger": "API down",
      "expected": "Show network error",
      "actual": "MISSING",
      "coverage": "0%"
    }
  },
  "overall_coverage": "33%"
}
```

**2. Interactive Elements (Feedback States)**
```json
{
  "element": "Save button",
  "states": {
    "idle": "exists",
    "hover": "exists",
    "active": "exists",
    "loading": "exists",
    "disabled": "exists",
    "success": "exists",
    "error": "MISSING"
  },
  "coverage": "85%"
}
```

**3. Data-Driven Components (Loading/Error/Empty)**
```json
{
  "component": "Book List",
  "states": {
    "loading": "exists (spinner)",
    "loaded_with_data": "exists",
    "empty": "MISSING (no 'no books yet' state)",
    "error": "MISSING (no network error state)",
    "filtered_empty": "not_required"
  },
  "coverage": "50%"
}
```

**4. Accessibility**
```json
{
  "component": "Modal",
  "accessibility": {
    "keyboard_navigation": "MISSING (no Esc to close)",
    "focus_trap": "MISSING",
    "aria_labels": "exists",
    "screen_reader": "partial"
  },
  "coverage": "40%"
}
```

**Required Output:**
```json
{
  "application": "manuscript-eval",
  "coverage_timestamp": "2025-12-22T19:00:00Z",
  
  "user_journeys": {
    "total": 8,
    "complete_happy_path": 8,
    "complete_error_paths": 2,
    "coverage": "62.5%"
  },
  
  "interactive_elements": {
    "total": 15,
    "complete_feedback": 10,
    "coverage": "66.7%"
  },
  
  "data_components": {
    "total": 5,
    "has_loading": 5,
    "has_error": 1,
    "has_empty": 0,
    "coverage": "40%"
  },
  
  "accessibility": {
    "keyboard_nav": "60%",
    "focus_management": "40%",
    "aria_labels": "80%",
    "screen_reader": "50%",
    "overall": "57.5%"
  },
  
  "missing_patterns": [
    {
      "category": "error_states",
      "components": ["BookList", "ChapterEditor", "ImageUploader"],
      "severity": "high",
      "recommended_story": "Story-ERROR-001: Error State Components"
    },
    {
      "category": "empty_states",
      "components": ["BookList", "ChapterList"],
      "severity": "medium",
      "recommended_story": "Story-EMPTY-001: Empty State Components"
    },
    {
      "category": "accessibility",
      "gaps": ["keyboard nav in modals", "focus trap"],
      "severity": "medium",
      "recommended_story": "Story-A11Y-001: Accessibility Baseline"
    }
  ],
  
  "overall_coverage": "56.5%",
  "status": "WARNINGS",
  "deployment_recommendation": "Can deploy with caveats, log missing patterns as polish stories"
}
```

**Validation Rules:**
- Coverage < 60% → WARNING (not blocking, but flagged)
- Coverage < 40% → BLOCKER (too incomplete)
- Missing error states → always flag
- Missing accessibility → flag for v1.1

**Can Deploy If:**
- Coverage > 60% OR
- All missing patterns logged as future stories
- User acknowledges incomplete coverage

---

### GATE 5.4: Deployment Strategy Validation (NEW - CRITICAL)
**Trigger:** Before marking system production-ready

**CLI:**
```bash
archaiforge deployment validate --app [app-name] --output deployment.json
```

**Required Validation:**

**1. Deployment Method**
```json
{
  "environments": {
    "development": {
      "method": "docker-compose up",
      "documented": true,
      "tested": true,
      "status": "OK"
    },
    "production": {
      "method": "unknown",
      "documented": false,
      "status": "MISSING"
    }
  }
}
```

**2. Deployment Checklist**
```json
{
  "checklist": [
    {
      "item": "Production deployment method",
      "status": "missing",
      "required": true,
      "blocker": true
    },
    {
      "item": "Secrets management (non-.env)",
      "status": "missing",
      "required": true,
      "blocker": true
    },
    {
      "item": "Database backup strategy",
      "status": "missing",
      "required": true,
      "blocker": true
    },
    {
      "item": "Rollback procedure",
      "status": "missing",
      "required": true,
      "blocker": true
    },
    {
      "item": "Monitoring/alerting",
      "status": "missing",
      "required": false,
      "blocker": false
    },
    {
      "item": "Log aggregation",
      "status": "missing",
      "required": false,
      "blocker": false
    },
    {
      "item": "TLS/HTTPS configuration",
      "status": "missing",
      "required": true,
      "blocker": true
    }
  ],
  "required_items": 5,
  "completed_items": 0,
  "blockers": 5
}
```

**Required Output:**
```json
{
  "application": "manuscript-eval",
  "deployment_validation": {
    "scope": "localhost_prototype",
    "production_deployment": {
      "defined": false,
      "status": "OUT_OF_SCOPE"
    },
    "justification": "Single-user local prototype, no network exposure",
    "deployment_restrictions": [
      "Localhost only",
      "No external network access",
      "Single user",
      "No production use"
    ],
    "future_production": {
      "epic": "PROD-001: Production Hardening",
      "requirements": [
        "Kubernetes deployment",
        "Secrets management (Sealed Secrets)",
        "Database backup (automated)",
        "TLS termination (Ingress)",
        "Monitoring (Prometheus)",
        "Logging (ELK stack)"
      ],
      "estimated_effort": "3 weeks"
    },
    "status": "APPROVED_FOR_DEV"
  }
}
```

**OR (Production Deployment Defined):**
```json
{
  "deployment_validation": {
    "scope": "production",
    "production_deployment": {
      "method": "Kubernetes via Helm",
      "helm_chart": "charts/manuscript-eval",
      "documented": true,
      "tested": true,
      "status": "DEFINED"
    },
    "checklist_complete": true,
    "secrets": "AWS Secrets Manager",
    "database_backup": "RDS automated backups (daily)",
    "rollback": "Helm rollback + database restore procedure",
    "monitoring": "Datadog",
    "logging": "CloudWatch Logs",
    "tls": "ALB with ACM certificate",
    "status": "APPROVED_FOR_PRODUCTION"
  }
}
```

**Validation Rules:**
- Must explicitly scope as dev-only OR define production deployment
- Cannot claim "production ready" without:
  - Deployment method documented
  - Secrets management (not .env)
  - Database backup strategy
  - Rollback procedure
- Can defer monitoring/logging if acknowledged

**Cannot Deploy to Production Until:**
- All required checklist items complete OR
- Explicitly scoped as dev-only
- Deployment strategy logged

---

## LEDGER INTEGRATION

All gate validations are logged to the ledger for traceability.

**Ledger Entry Format:**
```json
{
  "epic_id": "EPIC-1",
  "epic_name": "Foundation & Onboarding",
  "completion_timestamp": "2025-12-22T20:00:00Z",
  
  "gates_executed": {
    "1.1_realm3x": {
      "timestamp": "2025-12-22T10:00:00Z",
      "ambiguity_score": 0.75,
      "scenario_selected": "S2: JWT authentication",
      "status": "passed"
    },
    "1.2_persona_gaps": {
      "timestamp": "2025-12-22T10:15:00Z",
      "gaps_found": 4,
      "stories_created": 2,
      "status": "passed"
    },
    "2.1_architecture": {
      "timestamp": "2025-12-22T11:00:00Z",
      "ghosts_detected": 0,
      "mock_violations": 0,
      "missing_inverses": 0,
      "status": "passed"
    },
    "2.2_security": {
      "timestamp": "2025-12-22T11:30:00Z",
      "checks_implemented": 3,
      "checks_deferred": 6,
      "deferral_epic": "DEBT-001",
      "status": "passed_with_deferrals"
    },
    "2.3_semantic": {
      "timestamp": "2025-12-22T12:00:00Z",
      "coverage": 0.85,
      "missing_systems": 1,
      "stories_created": 1,
      "status": "passed"
    },
    "2.4_dependencies": {
      "timestamp": "2025-12-22T12:15:00Z",
      "valid_dag": true,
      "critical_path": "Story-022 → Story-023 → Story-011 → Story-041",
      "status": "passed"
    },
    "3.1_no_mock_data": {
      "timestamp": "2025-12-22T14:00:00Z",
      "violations": 1,
      "user_approved_mock": false,
      "replaced_with_real": true,
      "status": "passed"
    },
    "3.2_persona_validation": {
      "timestamp": "2025-12-22T14:30:00Z",
      "components_validated": 5,
      "gaps_found": 3,
      "acceptance_criteria_updated": 2,
      "status": "passed"
    },
    "3.3_performance": {
      "timestamp": "2025-12-22T15:00:00Z",
      "claims_validated": 1,
      "benchmarks_created": 0,
      "criteria_revised": 1,
      "status": "passed"
    },
    "4.1_epic_validation": {
      "timestamp": "2025-12-22T16:00:00Z",
      "ghosts_detected": 0,
      "all_tests_passing": true,
      "status": "passed"
    },
    "4.2_integration": {
      "timestamp": "2025-12-22T16:30:00Z",
      "ghost_apis": 0,
      "ghost_components": 0,
      "schema_mismatches": 0,
      "status": "passed"
    },
    "4.3_cross_epic": {
      "timestamp": "2025-12-22T17:00:00Z",
      "applicable": false,
      "note": "First epic, no cross-epic dependencies",
      "status": "n/a"
    },
    "5.1_ghost_check": {
      "timestamp": "2025-12-22T18:00:00Z",
      "total_ghosts": 0,
      "mock_violations": 0,
      "missing_inverses": 0,
      "status": "passed"
    },
    "5.2_security_final": {
      "timestamp": "2025-12-22T18:30:00Z",
      "deployment_approved": "dev_only",
      "production_blocked": true,
      "status": "passed_conditional"
    },
    "5.3_semantic_coverage": {
      "timestamp": "2025-12-22T19:00:00Z",
      "overall_coverage": 0.85,
      "warnings": 2,
      "status": "passed_with_warnings"
    },
    "5.4_deployment": {
      "timestamp": "2025-12-22T19:30:00Z",
      "scope": "dev_only",
      "production_epic": "PROD-001",
      "status": "passed_scoped"
    }
  },
  
  "overrides": [],
  
  "final_status": "VALIDATED",
  "deployment_approved": "dev_environment_only",
  "production_blocker": "DEBT-001 (Security), PROD-001 (Deployment)"
}
```

---

## GATE OVERRIDE POLICY

Gates can only be overridden with explicit justification.

**Override Requirements:**
1. Written reason for override
2. Epic ID for remediation
3. Security approval (for security gates)
4. Logged in ledger with timestamp

**Override CLI:**
```bash
archaiforge clear gate-override \
  --gate "2.2_security" \
  --reason "Prototype for single local user, no network exposure" \
  --epic "DEBT-001" \
  --approved-by "user" \
  --output override.json
```

**Override Log:**
```json
{
  "gate": "2.2_security",
  "override_timestamp": "2025-12-22T11:45:00Z",
  "reason": "Prototype for single local user, no network exposure",
  "remediation_epic": "DEBT-001",
  "approved_by": "user",
  "restrictions": ["localhost only", "no production use"],
  "logged_in_ledger": true
}
```

**Restrictions:**
- Gates 5.1 (Ghost Check) and 3.1 (No Mock Data) **cannot be overridden**
- Security gates can be deferred but not skipped
- All overrides require remediation epic

---

## CLI REFERENCE

**Execute Full CLEAR Process:**
```bash
archaiforge clear execute \
  --directive "Add authentication system" \
  --enforce-gates true \
  --output execution_log.json
```

**Check Gate Status:**
```bash
archaiforge clear gate-status \
  --phase "limits" \
  --output status.json
```

**Generate Compliance Report:**
```bash
archaiforge clear report \
  --app "manuscript-eval" \
  --output compliance_report.json
```

**Validate Specific Gate:**
```bash
archaiforge clear validate-gate \
  --gate "2.1_architecture" \
  --app "manuscript-eval" \
  --output validation.json
```

---

## AGENT BEHAVIOR

### Old Behavior (Without Gates):
```
User: "Add authentication"

Agent:
1. Creates auth system
2. Claims it works
3. No validation

Result:
- Ghost APIs
- No security review
- Mock data persists
- Missing error states
```

### New Behavior (With Gates):
```
User: "Add authentication"

Agent:
1. [CLARITY PHASE]
   Gate 1.1 (Realm3X):
   - Detects ambiguity in "authentication"
   - Presents scenarios: OAuth, JWT, Session
   - User selects: JWT
   
   Gate 1.2 (Personas):
   - Security persona asks about password hashing
   - UX persona asks about error states
   - Backend persona asks about session storage
   - Creates 2 additional stories

2. [LIMITS PHASE]
   Gate 2.1 (Architecture):
   - Scans existing system
   - No auth APIs exist (clean start)
   - No mock data violations
   - Missing inverses flagged (logout must exist)
   
   Gate 2.2 (Security):
   - Authentication: to be implemented
   - Encryption: bcrypt for passwords
   - Session management: JWT with refresh
   - All checkboxes will be checked after implementation
   
   Gate 2.3 (Semantic):
   - Login flow required
   - Error states required
   - Session expired handling required
   - Creates Story-AUTH-UI-001
   
   Gate 2.4 (Dependencies):
   - Auth depends on database (User model)
   - Creates dependency: Story-DB → Story-AUTH

3. [EXAMPLES PHASE]
   Gate 3.1 (No Mock):
   - No mock auth allowed
   - Real JWT library required
   
   Gate 3.2 (Personas):
   - Security validates password strength requirements
   - UX validates error message clarity
   
   Gate 3.3 (Performance):
   - "Login within 2 seconds" → validated as achievable

4. [ADAPTATION PHASE]
   Gate 4.1 (Epic Validation):
   - All auth APIs implemented
   - All schemas exist (User model)
   - All tests passing
   - Inverse operations exist (logout)
   
   Gate 4.2 (Integration):
   - Frontend /login calls match backend provides
   - JWT tokens properly validated

5. [REFLECTION PHASE]
   Gate 5.1 (Ghost Check):
   - Scan: 0 ghosts
   - All claimed systems exist
   
   Gate 5.2 (Security Final):
   - Authentication: implemented
   - All security checks passed
   
   Gate 5.3 (Coverage):
   - Login flow: 100%
   - Error states: 100%
   
   Gate 5.4 (Deployment):
   - Production deployment method documented

Result:
- Zero ghosts
- Security validated
- No mock data
- Complete coverage
- Deployment ready
```

---

## SUCCESS METRICS

### Before Gates (Baseline):
- 40% of epics contain ghost systems
- 60% have undocumented dependencies
- 30% have unvalidated performance claims
- 80% have no production deployment plan
- Security review happens ad-hoc
- Mock data persists to production

### After Gates (Target):
- <2% ghost systems (explicit deferrals only)
- <5% dependency issues (caught early)
- <5% performance claims without evidence
- <10% missing deployment strategy (all flagged)
- 100% security review compliance
- 0% accidental mock data in production

**Overall Failure Mode Prevention: 98%**

---

## PROTECTED BINARY ENFORCEMENT

This enhanced CLEAR AI methodology is the **protected binary**.

**Agents MUST:**
- Execute all mandatory gates
- Produce required artifacts
- Validate before progression
- Log all gate results
- Never simulate/mock systems (unless explicitly approved)
- Implement inverse operations for all actions
- Provide causal proof of existence

**Agents CANNOT:**
- Skip gates
- Claim systems exist without validation
- Proceed with ghost systems
- Use mock data without approval
- Omit security review
- Deploy without deployment strategy
- Create one-way operations (no inverse)

**Violation Consequences:**
- Ledger flag
- Remediation epic created
- Deployment blocked
- Gate re-execution required

---

## VERSION HISTORY

**v1.0** - Original CLEAR AI (Clarity, Limits, Examples, Adaptation, Reflection)  
**v2.0** - Enhanced with 15 mandatory gates, inverse completion principle, no mock systems principle

---

*This methodology is authoritative and non-negotiable.*  
*All Archaiforge agents must comply.*  
*Violations are logged and flagged.*