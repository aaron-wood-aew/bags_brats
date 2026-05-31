# System Evolution Log

> **Purpose**: Track major architectural changes, refactors, and system evolution passes over time. This log provides historical context for why the system looks the way it does.

---

## Log Entry Template

```markdown
### [YYYY-MM-DD] — [Brief Title]

**Plan ID**: [plan_id from ledger]  
**Type**: [Feature | Refactor | Bug Fix | Architecture | Security | UX]  
**Scope**: [subsystems affected]

#### What Changed
- [Bullet points describing the changes]

#### Why
- [Rationale for the change]

#### Impact
- [Effects on architecture, data model, UX, etc.]

#### Lessons Learned
- [Reflections from the work]

---
```

## Example Entries

### 2025-12-01 — Tenant-Scoped API Key Management

**Plan ID**: AUTH_2025_12  
**Type**: Feature  
**Scope**: Authentication subsystem

#### What Changed
- Added `ApiKey` model with tenant foreign key
- Implemented key rotation service in `AuthService`
- Added audit logging for all key operations
- Created admin UI for key management

#### Why
- Needed secure, per-tenant API authentication for headless clients
- Existing JWT tokens were session-based and unsuitable for long-lived integrations

#### Impact
- **Architecture**: Extended auth subsystem without touching core JWT logic
- **Data Model**: New `api_keys` table with tenant relationship
- **Security**: Keys are hashed, rotatable, and fully auditable
- **UX**: Admin panel now has dedicated API key management section

#### Lessons Learned
- Batching DB migrations with service changes reduced deployment risk
- Separate audit table for key operations proved valuable for compliance tracking

---

### 2025-11-15 — Migrated to Monorepo Structure

**Plan ID**: ARCH_2025_11  
**Type**: Architecture  
**Scope**: Entire repository structure

#### What Changed
- Moved frontend to `/apps/web`
- Moved backend to `/apps/api`
- Created shared `/packages/types` and `/packages/ui`
- Set up Turborepo for build orchestration

#### Why
- Code sharing between frontend and backend was becoming difficult
- TypeScript types were duplicated across projects
- Build times were increasing

#### Impact
- **Architecture**: Clear separation of concerns with explicit package boundaries
- **DX**: Faster builds with Turborepo cache
- **Maintenance**: Easier to enforce type safety across stack

#### Lessons Learned
- Migration was smoother by doing it incrementally (types first, then UI components)
- Turborepo cache configuration needed tuning for optimal performance

---

## Your Evolution History

<!-- Add your system evolution entries below this line -->
