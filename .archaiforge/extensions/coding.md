# MDA Coding Extension
## Domain-Specific Patterns & Best Practices for Code Development

> **Version**: 2.0  
> **Requires**: MDA Core Kernel + CLEAR AI Core loaded  
> **Purpose**: Provides coding-specific guidance, patterns, and quality standards. Load this extension when working on software development tasks.

---

## Prerequisites

**Before using this extension, ensure you have loaded:**

1. `01_kernel.md` — MDA Core Kernel
2. `03_clear_ai.md` — CLEAR AI Core (provides planning & execution rules)

This extension supplements CLEAR AI with coding-specific patterns and best practices.

**Optional Enhancement**: Load `extensions/adaptive_personas.md` for dynamic persona embodiment during coding work.

---

## Coding Personas (Optional)

When using Adaptive Personality Synthesis for coding work, these personas enhance phase-specific collaboration:

### Requirements Analyst (Clarity Phase)
**Identity**: Detail-oriented technical analyst who clarifies ambiguous requirements
**Mission**: Transform vague feature requests into precise technical specifications
**Mindset**: "Before we code anything, let's ensure we're solving the right problem the right way."

### Technical Lead (Limits Phase)
**Identity**: Experienced engineer who sets pragmatic technical boundaries
**Mission**: Define architectural constraints and technology choices that guide implementation
**Mindset**: "Smart constraints prevent technical debt and focus our energy productively."

### Solution Explorer (Examples Phase)
**Identity**: Curious engineer who evaluates multiple implementation approaches
**Mission**: Generate and compare different technical solutions before committing
**Mindset**: "Let's explore 2-3 approaches to find the best fit for this context."

### Senior Developer (Adaptation Phase)
**Identity**: Experienced implementer who synthesizes the best approach into clean code
**Mission**: Write production-quality code following established patterns
**Mindset**: "This code should be obvious to maintain, test, and extend."

### Code Reviewer (Reflection Phase)
**Identity**: Critical but constructive peer reviewer
**Mission**: Identify bugs, edge cases, and improvement opportunities
**Mindset**: "Good code works. Great code works AND is maintainable."

*To use these personas, enable in `boundaries.json`: `"persona_synthesis": { "enabled": true, "active_domains": ["technical"] }`*

---

# Coding-Specific Guidelines

## Code Quality Standards

### Readability First
- Code is read 10x more than written — optimize for human comprehension
- Prefer clarity over cleverness
- Name things for what they mean, not what they are
- Keep functions focused on single responsibilities

### Consistency Over Preference
- Follow existing patterns in the codebase
- Reference `preferences.json` for stack-specific conventions
- When refactoring, update all instances or none — no half-migrations

### Architecture Awareness
- Understand module boundaries before adding dependencies
- New dependencies require justification in CLEAR Plan
- Check `boundaries.json` before cross-cutting changes

---

## Language & Framework Patterns

### TypeScript/JavaScript
```typescript
// Prefer explicit types over inference for public APIs
export interface UserService {
  findById(id: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
}

// Use discriminated unions for state management
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: Error };
```

### Python
```python
# Use type hints for function signatures
def process_user(user_id: str, options: ProcessOptions) -> ProcessResult:
    """Process user with given options.
    
    Args:
        user_id: Unique identifier for user
        options: Processing configuration
        
    Returns:
        Processing result with status and metadata
    """
    pass

# Prefer dataclasses for structured data
from dataclasses import dataclass

@dataclass
class UserProfile:
    id: str
    email: str
    created_at: datetime
```

---

## Testing Patterns

### Test Structure (Arrange-Act-Assert)
```javascript
describe('AuthService', () => {
  it('should generate valid JWT tokens', () => {
    // Arrange
    const user = createTestUser({ role: 'admin' });
    const service = new AuthService(config);
    
    // Act
    const token = service.generateToken(user);
    
    // Assert
    expect(token).toBeDefined();
    expect(service.verifyToken(token)).toEqual(user.id);
  });
});
```

### Coverage Priorities
1. **Critical paths first**: Auth, payment, data integrity
2. **Business logic**: Calculations, transformations, workflows
3. **Edge cases**: Null values, empty arrays, boundary conditions
4. **Happy paths last**: These often work; focus on failure modes

### Test Naming
```
[method/feature] should [expected behavior] when [condition]

✅ "generateToken should throw error when user is inactive"
❌ "test token generation"
```

---

## Database & Schema Patterns

### Migration Discipline
- Migrations are **append-only** — never edit existing migrations
- Each migration has corresponding rollback
- Test migrations on copy of production data
- Include migration in same batch as code changes

### Query Optimization
- Use indexes for commonly filtered/joined columns
- Avoid N+1 queries — batch or eager load
- Profile before optimizing — measure, don't guess
- Document complex queries with comments explaining intent

### Data Integrity
```sql
-- Use constraints to enforce business rules
ALTER TABLE api_keys
  ADD CONSTRAINT valid_expiry 
  CHECK (expires_at > created_at);

-- Use foreign keys for referential integrity
ALTER TABLE user_sessions
  ADD CONSTRAINT fk_user 
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;
```

---

## API Design Patterns

### RESTful Conventions
```
GET    /api/users          → List users
GET    /api/users/:id      → Get single user
POST   /api/users          → Create user
PATCH  /api/users/:id      → Update user
DELETE /api/users/:id      → Delete user
```

### Error Responses
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "field": "email",
    "details": {}
  }
}
```

### Versioning Strategy
- URL versioning for major breaking changes: `/api/v2/users`
- Header versioning for minor changes: `Accept-Version: 2024-01-15`
- Deprecation warnings before removal
- Maintain two versions maximum

---

## Security Patterns for Code

### Input Validation
```typescript
// Validate at boundary, trust internally
app.post('/users', async (req, res) => {
  const validated = UserCreateSchema.parse(req.body); // Throws if invalid
  const user = await userService.create(validated);   // Receives clean data
  res.json(user);
});
```

### Authentication & Authorization
- Authentication: Who are you? (JWT, sessions, API keys)
- Authorization: What can you do? (RBAC, ABAC, ownership)
- Check auth at route level, enforce authz at service level
- Never trust client-provided user IDs — use session/token

### Secrets Management
```bash
# ❌ Never commit secrets
DATABASE_URL=postgresql://user:password@localhost/db

# ✅ Use environment variables
DATABASE_URL=${DATABASE_URL}

# ✅ Reference secret manager in production
DATABASE_URL=$(vault read -field=url secret/database)
```

---

## Code Organization Patterns

### Feature-Based Structure
```
src/
  features/
    auth/
      services/
        auth.service.ts
      controllers/
        auth.controller.ts
      models/
        user.model.ts
      tests/
        auth.test.ts
```

### Layered Architecture
```
Controllers  → Handle HTTP, validation, serialization
Services     → Business logic, orchestration
Repositories → Data access, queries
Models       → Domain entities, schemas
```

### Dependency Flow
- Outer layers depend on inner layers, never reverse
- Controllers → Services → Repositories
- No circular dependencies between modules

---

## Performance Patterns

### Caching Strategy
```typescript
// Cache at multiple levels
const user = await cache.get(`user:${id}`) // L1: In-memory
  ?? await redis.get(`user:${id}`)          // L2: Redis
  ?? await db.users.findById(id);           // L3: Database

// Invalidate on write
await db.users.update(id, data);
await cache.del(`user:${id}`);
await redis.del(`user:${id}`);
```

### Async Patterns
- Use async/await for I/O operations
- Parallelize independent operations with `Promise.all()`
- Use queues for background work
- Implement timeouts for external calls

---

## Refactoring Patterns

### The Strangler Fig Pattern
When replacing legacy code:
1. Route new requests to new implementation
2. Gradually migrate existing behavior
3. Remove old implementation when traffic = 0
4. Never "big bang" replacement

### Extract Method
```javascript
// Before: Long function doing multiple things
function processOrder(order) {
  // 50 lines of validation
  // 30 lines of pricing
  // 20 lines of inventory
  // 15 lines of notification
}

// After: Extracted methods with clear names
function processOrder(order) {
  validateOrder(order);
  const total = calculatePricing(order);
  reserveInventory(order);
  sendConfirmation(order, total);
}
```

---

## Error Handling

### Fail Fast, Fail Loud
```typescript
// ❌ Silent failures
try {
  await sendEmail(user.email, message);
} catch (e) {
  console.log('Email failed'); // Lost in logs
}

// ✅ Explicit error handling
try {
  await sendEmail(user.email, message);
} catch (e) {
  logger.error('Email delivery failed', { userId: user.id, error: e });
  await notificationService.queueRetry(user.id, message);
  throw new EmailDeliveryError('Failed to send confirmation', { cause: e });
}
```

### Error Boundaries
- Application layer: HTTP errors (400, 500)
- Service layer: Domain errors (ValidationError, NotFoundError)
- Repository layer: Data errors (QueryError, ConnectionError)

---

## Documentation Patterns

### Code Comments
```typescript
// ❌ Obvious comments
// Increment counter by 1
counter++;

// ✅ Explain "why", not "what"
// Reset counter to prevent overflow after 1M increments
if (counter > 1_000_000) counter = 0;

// ✅ Document non-obvious behavior
// Note: This query intentionally uses LEFT JOIN to include
// users without sessions (for onboarding flow)
```

### API Documentation
Use OpenAPI/Swagger for REST APIs, include:
- Request/response schemas
- Authentication requirements
- Example requests
- Error codes

---

## Deployment & DevOps Patterns

### Environment Configuration
```
development  → Local, verbose logging, hot reload
staging      → Production-like, real integrations, debug enabled
production   → Optimized, minimal logging, monitoring enabled
```

### Health Checks
```typescript
app.get('/health', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    external_api: await checkExternalService()
  };
  
  const healthy = Object.values(checks).every(c => c.ok);
  res.status(healthy ? 200 : 503).json(checks);
});
```

---

## Tools & Automation

### Code Quality Tools
- **Linting**: ESLint, Pylint, RuboCop
- **Formatting**: Prettier, Black, RustFmt
- **Type Checking**: TypeScript, mypy, Flow
- **Security Scanning**: Snyk, npm audit, semgrep

### Pre-Commit Hooks
```bash
# Run before each commit
- Linting
- Type checking  
- Unit tests
- Format check
```

---

## Integration with CLEAR AI

When coding under MDA with CLEAR AI loaded:

### Planning Phase
- **Examples** should reference existing code patterns from the codebase
- **Limits** should specify affected files, modules, and boundaries
- **Reflect** should include which tests validate the change

### Execution Phase
- Group changes by layer (models → services → controllers)
- Update tests in same batch as implementation
- Run linter after each batch

### Reflection Phase
- Did we introduce technical debt?
- Are there similar patterns elsewhere that should be refactored?
- What would make this code easier to test?

---

*Load MDA Core Kernel (01) and CLEAR AI Core (03) before using this extension. For architecture reviews, also load the Architecture extension. For security-sensitive code, load Security extension.*
