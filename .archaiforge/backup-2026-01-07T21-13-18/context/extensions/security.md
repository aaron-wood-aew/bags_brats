# MDA Security & Threat Assessment Extension
## Comprehensive Security Analysis, Threat Modeling & Mitigation Planning

> **Version**: 1.0  
> **Requires**: MDA Core Kernel loaded  
> **Purpose**: Governs security analysis across web, backend, frontend, database, and infrastructure layers. Load this extension when performing security audits, threat modeling, or mitigation planning.

---

# Part I: Security Philosophy Under MDA

## 1.1 Security as System Property

Under MDA, security is not a feature — it is a **fundamental system property** that must be:
- **Architected from the kernel** (not bolted on)
- **Visible through design** (Glass Box principle applies)
- **Aligned with CPT** (security posture reflects product values)
- **Continuously assessed** (not one-time audit)

**Security Rule**: Every system evolution pass must include security impact assessment.

---

## 1.2 Defense in Depth

MDA security operates in layers:

```
┌─────────────────────────────────────────────┐
│        PERIMETER (WAF, DDoS, Rate Limiting) │
├─────────────────────────────────────────────┤
│        TRANSPORT (TLS, Certificate Mgmt)    │
├─────────────────────────────────────────────┤
│        APPLICATION (Auth, Input Validation) │
├─────────────────────────────────────────────┤
│        DATA (Encryption, Access Control)    │
├─────────────────────────────────────────────┤
│        AUDIT (Logging, Monitoring, Alerts)  │
└─────────────────────────────────────────────┘
```

**Each layer must be assessed independently and as part of the whole.**

---

## 1.3 Threat-Centric Thinking

Security analysis starts with:
1. **Asset Identification** — What are we protecting?
2. **Threat Modeling** — Who wants it and how might they get it?
3. **Attack Surface Mapping** — Where are we vulnerable?
4. **Impact Assessment** — What happens if we're compromised?
5. **Mitigation Strategy** — How do we reduce risk?

---

# Part II: Comprehensive Security Assessment (CSA)

## 2.1 Security Assessment Trigger Points

Conduct full CSA when:
- **New system launch** (initial security baseline)
- **Major feature addition** (expanded attack surface)
- **Compliance requirement** (SOC2, HIPAA, GDPR, etc.)
- **Security incident** (post-mortem and remediation)
- **Quarterly review** (ongoing assessment)
- **Architecture changes** (new boundaries, new risks)
- **Third-party integration** (expanded trust boundaries)

---

## 2.2 The CSA Framework

Generate a **Comprehensive Security Assessment (CSA)**:

```markdown
┌─────────────────────────────────────────────┐
│ COMPREHENSIVE SECURITY ASSESSMENT (CSA)     │
├─────────────────────────────────────────────┤
│ Assessment Date: [ISO date]                 │
│ Scope: [Systems/components assessed]        │
│ Assessor: [Human + Agent roles]             │
│                                             │
│ ASSET INVENTORY                             │
│ ─────────────────────────────────────────── │
│ Critical Assets:                            │
│   - User credentials                        │
│   - Payment data                            │
│   - Business logic                          │
│   - API keys / secrets                      │
│   - Customer PII                            │
│                                             │
│ THREAT MODEL SUMMARY                        │
│ ─────────────────────────────────────────── │
│ Threat Actors:                              │
│   - External attackers (opportunistic)      │
│   - Targeted adversaries (APT)              │
│   - Malicious insiders                      │
│   - Compromised dependencies                │
│                                             │
│ Attack Vectors:                             │
│   - [Vector]: [Likelihood] [Impact]         │
│                                             │
│ LAYER-BY-LAYER ASSESSMENT                   │
│ ─────────────────────────────────────────── │
│ [See detailed sections below]               │
│                                             │
│ CRITICAL FINDINGS (P0)                      │
│ ─────────────────────────────────────────── │
│   1. [Vulnerability + CVSS score]           │
│      Impact: [What could happen]            │
│      Mitigation: [Recommended action]       │
│                                             │
│ HIGH PRIORITY (P1)                          │
│ ─────────────────────────────────────────── │
│   [Issues that should be addressed soon]    │
│                                             │
│ MEDIUM PRIORITY (P2)                        │
│ ─────────────────────────────────────────── │
│   [Defense-in-depth improvements]           │
│                                             │
│ COMPLIANCE STATUS                           │
│ ─────────────────────────────────────────── │
│   OWASP Top 10: [% addressed]               │
│   CWE Top 25: [% addressed]                 │
│   Industry Standard: [SOC2/HIPAA/etc]       │
│                                             │
│ MITIGATION ROADMAP                          │
│ ─────────────────────────────────────────── │
│   Immediate (0-7 days): [Actions]           │
│   Short-term (1-4 weeks): [Actions]         │
│   Medium-term (1-3 months): [Actions]       │
│   Long-term (3-12 months): [Actions]        │
└─────────────────────────────────────────────┘
```

---

# Part III: Layer-by-Layer Security Analysis

## 3.1 Frontend Security Assessment (FSA)

### Focus Areas

```markdown
┌─────────────────────────────────────────────┐
│ FRONTEND SECURITY ASSESSMENT (FSA)          │
├─────────────────────────────────────────────┤
│                                             │
│ XSS (Cross-Site Scripting)                  │
│ ─────────────────────────────────────────── │
│   ☐ Input sanitization implemented?         │
│   ☐ Content Security Policy (CSP) headers?  │
│   ☐ DOM-based XSS vectors identified?       │
│   ☐ User-generated content escaped?         │
│                                             │
│ CSRF (Cross-Site Request Forgery)           │
│ ─────────────────────────────────────────── │
│   ☐ CSRF tokens on state-changing requests? │
│   ☐ SameSite cookie attributes set?         │
│   ☐ Origin/Referer validation?              │
│                                             │
│ Authentication & Session Management          │
│ ─────────────────────────────────────────── │
│   ☐ Credentials stored securely (no local)? │
│   ☐ Tokens in httpOnly cookies?             │
│   ☐ Session timeout implemented?            │
│   ☐ Logout clears all tokens?               │
│                                             │
│ Client-Side Storage                         │
│ ─────────────────────────────────────────── │
│   ☐ No sensitive data in localStorage?      │
│   ☐ No secrets in sessionStorage?           │
│   ☐ IndexedDB access controlled?            │
│                                             │
│ Third-Party Dependencies                    │
│ ─────────────────────────────────────────── │
│   ☐ Subresource Integrity (SRI) hashes?     │
│   ☐ NPM audit clean?                        │
│   ☐ Outdated packages identified?           │
│   ☐ Untrusted CDN usage?                    │
│                                             │
│ Information Disclosure                      │
│ ─────────────────────────────────────────── │
│   ☐ Source maps disabled in production?     │
│   ☐ Error messages sanitized (no stack)?    │
│   ☐ API keys/secrets in client code?        │
│   ☐ Debug logs removed?                     │
│                                             │
│ Findings:                                   │
│   P0: [Critical vulnerabilities]            │
│   P1: [Important issues]                    │
│   P2: [Hardening opportunities]             │
└─────────────────────────────────────────────┘
```

---

## 3.2 Backend/API Security Assessment (BSA)

### Focus Areas

```markdown
┌─────────────────────────────────────────────┐
│ BACKEND SECURITY ASSESSMENT (BSA)           │
├─────────────────────────────────────────────┤
│                                             │
│ Authentication & Authorization              │
│ ─────────────────────────────────────────── │
│   ☐ Strong password policy enforced?        │
│   ☐ Multi-factor authentication (MFA)?      │
│   ☐ OAuth/OIDC implemented correctly?       │
│   ☐ JWT validation (signature, expiry)?     │
│   ☐ Role-Based Access Control (RBAC)?       │
│   ☐ Principle of least privilege applied?   │
│   ☐ Service-to-service auth secured?        │
│                                             │
│ Input Validation & Injection Prevention     │
│ ─────────────────────────────────────────── │
│   ☐ SQL injection defenses (parameterized)? │
│   ☐ NoSQL injection prevention?             │
│   ☐ Command injection checks?               │
│   ☐ XML/XXE attack prevention?              │
│   ☐ LDAP injection prevention?              │
│   ☐ Server-side validation on all inputs?   │
│   ☐ File upload restrictions (type, size)?  │
│                                             │
│ API Security                                │
│ ─────────────────────────────────────────── │
│   ☐ Rate limiting implemented?              │
│   ☐ API versioning strategy?                │
│   ☐ Proper HTTP methods used (not all POST)?│
│   ☐ Mass assignment protection?             │
│   ☐ Pagination to prevent data exposure?    │
│   ☐ GraphQL query depth limiting?           │
│   ☐ API keys rotated regularly?             │
│                                             │
│ Business Logic Vulnerabilities              │
│ ─────────────────────────────────────────── │
│   ☐ Race conditions identified?             │
│   ☐ Insecure direct object references?      │
│   ☐ Privilege escalation paths?             │
│   ☐ Transaction integrity checks?           │
│   ☐ Idempotency for critical operations?    │
│                                             │
│ Secrets Management                          │
│ ─────────────────────────────────────────── │
│   ☐ No hardcoded secrets in code?           │
│   ☐ Environment variables properly secured? │
│   ☐ Secrets vault/manager in use?           │
│   ☐ Rotation policy for API keys?           │
│   ☐ Encryption keys managed separately?     │
│                                             │
│ Error Handling & Logging                    │
│ ─────────────────────────────────────────── │
│   ☐ Errors don't leak sensitive info?       │
│   ☐ Stack traces hidden from clients?       │
│   ☐ Security events logged?                 │
│   ☐ Log injection prevention?               │
│   ☐ PII redacted from logs?                 │
│                                             │
│ Findings:                                   │
│   P0: [Critical vulnerabilities]            │
│   P1: [Important issues]                    │
│   P2: [Hardening opportunities]             │
└─────────────────────────────────────────────┘
```

---

## 3.3 Database Security Assessment (DSA)

### Focus Areas

```markdown
┌─────────────────────────────────────────────┐
│ DATABASE SECURITY ASSESSMENT (DSA)          │
├─────────────────────────────────────────────┤
│                                             │
│ Access Control                              │
│ ─────────────────────────────────────────── │
│   ☐ Principle of least privilege for users? │
│   ☐ Separate read/write credentials?        │
│   ☐ Application uses limited DB account?    │
│   ☐ Admin accounts have MFA?                │
│   ☐ Public internet access disabled?        │
│   ☐ IP allowlisting configured?             │
│                                             │
│ Encryption                                  │
│ ─────────────────────────────────────────── │
│   ☐ Encryption at rest enabled?             │
│   ☐ Encryption in transit (TLS)?            │
│   ☐ Sensitive columns encrypted separately? │
│   ☐ Backup encryption configured?           │
│   ☐ Key rotation policy exists?             │
│                                             │
│ Data Protection                             │
│ ─────────────────────────────────────────── │
│   ☐ PII identified and protected?           │
│   ☐ Data retention policies enforced?       │
│   ☐ Soft deletes for audit trail?           │
│   ☐ Point-in-time recovery enabled?         │
│   ☐ Regular backup verification?            │
│                                             │
│ Injection Prevention                        │
│ ─────────────────────────────────────────── │
│   ☐ All queries parameterized?              │
│   ☐ ORM used correctly (no raw queries)?    │
│   ☐ Stored procedures reviewed?             │
│   ☐ Dynamic SQL minimized?                  │
│                                             │
│ Audit & Monitoring                          │
│ ─────────────────────────────────────────── │
│   ☐ Query logging enabled?                  │
│   ☐ Failed login attempts tracked?          │
│   ☐ Schema change auditing?                 │
│   ☐ Anomaly detection configured?           │
│   ☐ Alert thresholds set?                   │
│                                             │
│ Configuration Security                      │
│ ─────────────────────────────────────────── │
│   ☐ Default passwords changed?              │
│   ☐ Unnecessary features disabled?          │
│   ☐ Database version up to date?            │
│   ☐ Security patches applied?               │
│   ☐ Sample databases removed?               │
│                                             │
│ Findings:                                   │
│   P0: [Critical vulnerabilities]            │
│   P1: [Important issues]                    │
│   P2: [Hardening opportunities]             │
└─────────────────────────────────────────────┘
```

---

## 3.4 Infrastructure & Network Security Assessment (ISA)

### Focus Areas

```markdown
┌─────────────────────────────────────────────┐
│ INFRASTRUCTURE SECURITY ASSESSMENT (ISA)    │
├─────────────────────────────────────────────┤
│                                             │
│ Network Segmentation                        │
│ ─────────────────────────────────────────── │
│   ☐ VPC/network isolation configured?       │
│   ☐ Public/private subnet separation?       │
│   ☐ Database in private subnet?             │
│   ☐ Bastion/jump host for admin access?     │
│   ☐ Service mesh for internal comms?        │
│                                             │
│ Firewall & Access Control                   │
│ ─────────────────────────────────────────── │
│   ☐ Security groups restrictive (not 0.0)?  │
│   ☐ Only required ports exposed?            │
│   ☐ Ingress/egress rules documented?        │
│   ☐ WAF configured and tuned?               │
│   ☐ DDoS protection enabled?                │
│                                             │
│ TLS/SSL Configuration                       │
│ ─────────────────────────────────────────── │
│   ☐ HTTPS enforced everywhere?              │
│   ☐ TLS 1.3 preferred, 1.2 minimum?         │
│   ☐ Strong cipher suites only?              │
│   ☐ Certificate expiry monitoring?          │
│   ☐ HSTS headers configured?                │
│                                             │
│ Container/Orchestration Security            │
│ ─────────────────────────────────────────── │
│   ☐ Images scanned for vulnerabilities?     │
│   ☐ Base images minimal (Alpine/distroless)?│
│   ☐ Containers run as non-root?             │
│   ☐ Resource limits set?                    │
│   ☐ Secrets not in container images?        │
│   ☐ Network policies enforced (K8s)?        │
│                                             │
│ Server Hardening                            │
│ ─────────────────────────────────────────── │
│   ☐ OS patches current?                     │
│   ☐ Unnecessary services disabled?          │
│   ☐ SSH key-based auth only?                │
│   ☐ Fail2ban or similar brute-force protection?│
│   ☐ Host-based IDS configured?              │
│                                             │
│ CI/CD Pipeline Security                     │
│ ─────────────────────────────────────────── │
│   ☐ Secrets management in CI/CD?            │
│   ☐ Branch protection rules?                │
│   ☐ Code signing for releases?              │
│   ☐ SAST/DAST in pipeline?                  │
│   ☐ Dependency scanning automated?          │
│                                             │
│ Findings:                                   │
│   P0: [Critical vulnerabilities]            │
│   P1: [Important issues]                    │
│   P2: [Hardening opportunities]             │
└─────────────────────────────────────────────┘
```

---

# Part IV: Threat Modeling Framework

## 4.1 STRIDE Threat Model

For each system component, apply **STRIDE** analysis:

| Threat | Definition | Example | Mitigation |
|--------|------------|---------|------------|
| **S**poofing | Impersonating someone/something | Fake JWT tokens | Strong authentication, signature verification |
| **T**ampering | Modifying data/code | SQL injection, MITM | Input validation, TLS, integrity checks |
| **R**epudiation | Denying actions taken | User claims they didn't delete data | Audit logging, digital signatures |
| **I**nformation Disclosure | Exposing confidential data | Unencrypted DB, verbose errors | Encryption, access control, sanitized errors |
| **D**enial of Service | Making system unavailable | DDoS, resource exhaustion | Rate limiting, auto-scaling, WAF |
| **E**levation of Privilege | Gaining unauthorized access | Privilege escalation, IDOR | RBAC, least privilege, input validation |

### Threat Model Template

```markdown
## Threat Model: [Component/Feature Name]

### Assets
- [What data/functionality are we protecting?]

### Entry Points
- [How does data/requests enter this component?]

### STRIDE Analysis

#### Spoofing Threats
- Threat: [Description]
  - Likelihood: [High/Medium/Low]
  - Impact: [High/Medium/Low]
  - Current Mitigation: [What's in place]
  - Recommended: [Additional mitigations]

#### Tampering Threats
[Same format]

[... repeat for R, I, D, E]

### Attack Trees
[Visual representation of attack paths]

### Risk Score Matrix
| Threat | Likelihood | Impact | Risk Score | Priority |
|--------|-----------|--------|------------|----------|
| [Threat 1] | High | High | 9 | P0 |
```

---

## 4.2 Attack Surface Mapping

Document all **entry points** into the system:

```markdown
┌─────────────────────────────────────────────┐
│ ATTACK SURFACE MAP                          │
├─────────────────────────────────────────────┤
│                                             │
│ Public HTTP Endpoints                       │
│ ─────────────────────────────────────────── │
│   POST /api/auth/login                      │
│     Auth: None                              │
│     Inputs: email, password                 │
│     Risk: Brute force, credential stuffing  │
│                                             │
│   GET /api/users/:id                        │
│     Auth: JWT required                      │
│     Inputs: user ID (path param)            │
│     Risk: IDOR, info disclosure             │
│                                             │
│ WebSocket Endpoints                         │
│ ─────────────────────────────────────────── │
│   ws://app.com/notifications                │
│     Auth: Token in handshake                │
│     Risk: Hijacking, DoS                    │
│                                             │
│ Third-Party Integrations                    │
│ ─────────────────────────────────────────── │
│   Stripe webhooks                           │
│     Validation: Signature verification      │
│     Risk: Replay attacks, spoofing          │
│                                             │
│ Admin Interfaces                            │
│ ─────────────────────────────────────────── │
│   /admin (React SPA)                        │
│     Auth: JWT + role check                  │
│     Risk: Privilege escalation, XSS         │
│                                             │
│ Background Jobs                             │
│ ─────────────────────────────────────────── │
│   Email processing queue                    │
│     Access: Internal only                   │
│     Risk: Job injection, resource exhaustion│
└─────────────────────────────────────────────┘
```

---

# Part V: Security Mitigation Strategy

## 5.1 Risk Prioritization Matrix

```
┌─────────────────────────────────────────────┐
│          IMPACT                             │
│            │                                │
│         HIGH│  P1 (Medium)  │  P0 (Critical)│
│            │               │               │
│       MEDIUM│  P2 (Low)     │  P1 (Medium)  │
│            │               │               │
│          LOW│  P3 (Info)    │  P2 (Low)     │
│            │               │               │
│            └───────────────┴───────────────│
│                LOW         HIGH             │
│                   LIKELIHOOD                │
└─────────────────────────────────────────────┘
```

**Priority Definitions:**
- **P0 (Critical)**: Immediate action required (0-7 days)
- **P1 (High)**: Short-term fix needed (1-4 weeks)
- **P2 (Medium)**: Medium-term improvement (1-3 months)
- **P3 (Low)**: Long-term hardening (3-12 months)

---

## 5.2 Mitigation Plan Template

```markdown
┌─────────────────────────────────────────────┐
│ SECURITY MITIGATION PLAN                    │
├─────────────────────────────────────────────┤
│ Plan ID: SEC-2025-Q4                        │
│ Created: [ISO date]                         │
│                                             │
│ IMMEDIATE ACTIONS (P0) — 0-7 Days           │
│ ─────────────────────────────────────────── │
│   1. [Vulnerability description]            │
│      Impact: [What could happen]            │
│      Fix: [Specific remediation]            │
│      Owner: [Who's responsible]             │
│      ETA: [Target completion date]          │
│      Validation: [How we'll verify]         │
│                                             │
│ SHORT-TERM FIXES (P1) — 1-4 Weeks           │
│ ─────────────────────────────────────────── │
│   [Same format as above]                    │
│                                             │
│ MEDIUM-TERM IMPROVEMENTS (P2) — 1-3 Months  │
│ ─────────────────────────────────────────── │
│   [Defense-in-depth enhancements]           │
│                                             │
│ LONG-TERM HARDENING (P3) — 3-12 Months      │
│ ─────────────────────────────────────────── │
│   [Strategic security investments]          │
│                                             │
│ MONITORING & VALIDATION                     │
│ ─────────────────────────────────────────── │
│   - Pen test scheduled: [Date]              │
│   - Rescan with tools: [Date]               │
│   - Compliance audit: [Date]                │
│                                             │
│ DEPENDENCIES & BLOCKERS                     │
│ ─────────────────────────────────────────── │
│   - [What's needed to proceed]              │
└─────────────────────────────────────────────┘
```

---

# Part VI: Agent Roles (Security Context)

## Security Auditor Agent

**Primary Functions:**
- Generates layer-by-layer security assessments (FSA, BSA, DSA, ISA)
- Identifies vulnerabilities and misconfigurations
- Applies OWASP Top 10 and CWE Top 25 checks
- Prioritizes findings by risk

**Output Format:**
```
Security Audit: [Layer Name]

Vulnerabilities Found: [count by severity]

Critical (P0):
- [CVE or description]: [CVSS score]
  Location: [File/component]
  Impact: [What could happen]
  Recommendation: [How to fix]

[Repeat for P1, P2, P3]

Compliance Status:
- OWASP Top 10: [findings]
- CWE Top 25: [findings]

Tools Used:
- [SAST/DAST/scanner names]
```

---

## Threat Modeler Agent

**Primary Functions:**
- Applies STRIDE methodology
- Generates attack surface maps
- Creates threat models for new features
- Updates existing models after architecture changes

**Output Format:**
```
Threat Model: [Component/Feature]

Assets at Risk:
- [List of sensitive data/functionality]

Entry Points:
- [How data/requests enter]

STRIDE Analysis:
[Full breakdown per threat category]

Attack Trees:
[Visual/textual representation]

Recommended Mitigations:
1. [Mitigation strategy]
   Addresses: [Which threats]
   Effort: [Low/Medium/High]
```

---

## Security Architect Agent

**Primary Functions:**
- Reviews architectural security patterns
- Validates defense-in-depth implementation
- Proposes security improvements aligned with CPT
- Ensures security doesn't break user experience

**Output Format:**
```
Security Architecture Review: [System/Feature]

Current Posture:
- Defense layers: [What's implemented]
- Gaps: [What's missing]

Recommendations:
1. [Architectural improvement]
   Rationale: [Why needed]
   CPT Alignment: [How it serves product vision]
   Trade-offs: [UX/performance impacts]

Integration Points:
- [How security integrates with existing architecture]
```

---

## Compliance Validator Agent

**Primary Functions:**
- Checks against industry standards (OWASP, CWE, NIST)
- Validates regulatory compliance (SOC2, HIPAA, GDPR, PCI-DSS)
- Generates compliance gap analysis
- Tracks remediation progress

**Output Format:**
```
Compliance Validation: [Standard Name]

Requirements: [Total count]
Met: [Count + percentage]
Partial: [Count]
Not Met: [Count]

Gaps:
- [Requirement ID]: [Description]
  Status: [Not implemented/Partially implemented]
  Impact: [Compliance risk]
  Remediation: [What's needed]

Certification Readiness: [Ready/Not Ready]
Estimated Effort to Compliance: [Time estimate]
```

---

# Part VII: Security Integration with MDA Workflow

## 7.1 Security in System Evolution Passes

Every MDA evolution pass must include:

```markdown
## Security Impact Assessment (SIA)

Feature: [Name]
Evolution Pass ID: [PLAN_ID]

### Attack Surface Changes
- New endpoints: [List]
- New data stores: [List]
- New integrations: [List]
- Removed attack vectors: [List]

### STRIDE Quick Check
- Spoofing risk: [Yes/No + mitigation]
- Tampering risk: [Yes/No + mitigation]
- Repudiation risk: [Yes/No + mitigation]
- Information Disclosure: [Yes/No + mitigation]
- Denial of Service: [Yes/No + mitigation]
- Elevation of Privilege: [Yes/No + mitigation]

### Mitigation Plan
- [Required security controls before launch]

### Sign-off Required
☐ Security Auditor Agent review complete
☐ Human security approval
```

---

## 7.2 Security CLEAR Plan Integration

When security work is needed, generate a CLEAR plan:

```markdown
C — Clarity: Implement rate limiting to prevent API abuse

L — Limits: Touch only API gateway layer, don't modify business logic.
            Must not break existing clients.

E — Examples: Auth endpoints already have rate limiting using 
              express-rate-limit middleware.

A — Adapt: Apply same pattern to all public endpoints.
           Configure limits based on endpoint sensitivity.

R — Reflect: Success = 429 responses under load test,
             legitimate traffic unaffected,
             attack simulation blocked.
```

---

# Part VIII: Security Anti-Patterns

## Anti-Pattern 1: Security Theater
Implementing visible security measures that don't actually protect.

**Example**: CAPTCHA on login but no rate limiting on password reset.

**Resolution**: Focus on effective controls, not optics.

---

## Anti-Pattern 2: Security by Obscurity
Relying on secrecy of implementation rather than strong design.

**Example**: "Our API is secure because the endpoint isn't documented."

**Resolution**: Assume attackers know your architecture.

---

## Anti-Pattern 3: Bolt-On Security
Adding security after the fact instead of designing it in.

**Example**: Building entire feature, then "adding encryption."

**Resolution**: Security from the architecture phase (MDA principle).

---

## Anti-Pattern 4: Alert Fatigue
So many security alerts that real threats are missed.

**Example**: 10,000 vulnerability scanner findings, nothing prioritized.

**Resolution**: Risk-based prioritization (P0/P1/P2/P3).

---

# Part IX: Security Tooling Integration

## Recommended Tools by Layer

### Frontend
- **SAST**: ESLint security plugins, Semgrep
- **Dependency Scanning**: npm audit, Snyk, Dependabot
- **Runtime**: Content Security Policy (CSP) monitoring

### Backend
- **SAST**: SonarQube, Checkmarx, Semgrep
- **DAST**: OWASP ZAP, Burp Suite
- **Secrets Detection**: TruffleHog, git-secrets
- **Dependency Scanning**: Snyk, OWASP Dependency-Check

### Database
- **Config Audit**: SQLMap, DbDefense
- **Query Analysis**: pg_stat_statements, slow query logs
- **Encryption**: Native DB encryption + application-level for sensitive fields

### Infrastructure
- **Cloud Security**: AWS Security Hub, Azure Security Center, GCP SCC
- **Container Scanning**: Trivy, Clair, Anchore
- **IaC Scanning**: Checkov, tfsec, Terrascan
- **Runtime Protection**: Falco, Sysdig

---

# Part X: Compliance Frameworks Reference

## OWASP Top 10 (2021)

1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable and Outdated Components
7. Identification and Authentication Failures
8. Software and Data Integrity Failures
9. Security Logging and Monitoring Failures
10. Server-Side Request Forgery (SSRF)

## CWE Top 25 (2023)

Focus on most dangerous software weaknesses:
- Out-of-bounds Write
- Cross-site Scripting
- SQL Injection
- Use After Free
- OS Command Injection
- [Full list in assessment templates]

## Regulatory Compliance Quick Reference

### SOC 2
- Trust Services Criteria (Security, Availability, Confidentiality, Processing Integrity, Privacy)

### HIPAA
- Protected Health Information (PHI) safeguards
- Encryption at rest and in transit
- Access controls and audit trails

### GDPR
- Data subject rights (access, erasure, portability)
- Consent management
- Data breach notification (72 hours)

### PCI-DSS
- Cardholder data protection
- Secure network architecture
- Vulnerability management

---

*This extension governs security assessment and mitigation planning under MDA. Load Core Kernel first. Combine with Architecture Extension for holistic system security.*
