# Vector Ledger Tools — Reference Documentation

**Created**: 2025-12-20  
**Updated**: 2025-12-22 (MiniLM embedding integration)  
**Purpose**: Reference documentation for Archaiforge's LanceDB vector ledger system

> [!NOTE]
> **This directory contains reference tools and documentation only.**  
> The actual vector database is located at `.archaiforge/vectors/` in your project.  
> All tools now use **MiniLM L6 embeddings** for proper semantic search.

---

## 🤖 For AI Agents

**You are reading this because you initialized a project with `archaiforge init`.**

This directory contains **reference documentation** about how the vector ledger system works. These tools show you the architecture, schemas, and operations available.

### Primary Tool for Reading Vector Memory

To query the vector database, use the `archaiforge` CLI:

```bash
archaiforge query <command>
```

**Available commands:**
- `cpt-history` — Get all CPT versions
- `cpt-gold` — Get current GOLD STANDARD CPT
- `outcomes-query "search term"` — Semantic search for outcomes
- `context-query "search term"` — Search architectural decisions
- `metrics [days]` — Performance metrics
- `stats` — Database status

All commands return JSON that you can parse and use.

### Writing to Vector Memory

Use `ledger-manager.js` for vector writes with **real semantic embeddings**:

```bash
# Write an outcome (uses MiniLM L6 for semantic embedding)
node .archaiforge/context/vector-ledger-tools/ledger-manager.js \
  add-outcome "Epic Name" "Outcome description" "complete"

# Write context (uses MiniLM L6 for semantic embedding)
node .archaiforge/context/vector-ledger-tools/ledger-manager.js \
  add-context "decision" "We chose PostgreSQL for ACID compliance" "database,architecture"

# Write boundary (uses MiniLM L6 for semantic embedding)  
node .archaiforge/context/vector-ledger-tools/ledger-manager.js \
  add-boundary "technical" "Node.js >= 16" "true"
```

### When to Query Vectors

- User asks "what was our original vision?" → `archaiforge query cpt-history`
- User asks "how did we implement X?" → `archaiforge query outcomes-query "X"`
- User asks "why did we choose Y?" → `archaiforge query context-query "Y"`
- Check system health → `archaiforge query stats`

---

## Technical Architecture

### Embedding Model

All vector writes use **Xenova/all-MiniLM-L6-v2** (ONNX):
- 384-dimensional embeddings
- Local execution via `@xenova/transformers`
- Consistent with `lib/embeddings.js` and `lib/vector_bridge.js`

```javascript
const { pipeline } = require('@xenova/transformers');
const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
const output = await pipe(text, { pooling: 'mean', normalize: true });
const vector = Array.from(output.data);  // 384-dim embedding
```

### LanceDB Integration

**Library**: `@lancedb/lancedb` (npm package, v0.23+)

**Connection**:
```javascript
const lancedb = require('@lancedb/lancedb');
const db = await lancedb.connect('/path/to/.archaiforge/vectors');
```

**Table Operations**:
```javascript
// Open table
const table = await db.openTable('outcomes');

// Vector search (semantic)
const results = await table.vectorSearch(queryVector).limit(10).toArray();

// Add records
await table.add([{ id, vector, epic, outcome, status, ... }]);
```

### Database Tables

| Table | Purpose | Has Vector |
|-------|---------|------------|
| `cpt_versions` | CPT evolution history | ✅ |
| `outcomes` | Past work results and learnings | ✅ |
| `context` | Architectural decisions and rationale | ✅ |
| `boundaries` | Constraint definitions | ✅ |
| `archaiforge_metrics` | Performance metrics | ❌ |
| `quality_signals` | Quality indicators | ❌ |

---

## Tools Included

### 1. `ledger-manager.js` ✅ PRIMARY TOOL
**Purpose**: Full CRUD operations for vector ledger with semantic embeddings  
**Usage**: `node ledger-manager.js <command> [args]`

**Commands**:
- `add-outcome "Epic" "Description" [status]` — Write outcome with embedding
- `add-context "category" "content" [tags]` — Write context with embedding
- `add-boundary "type" "value" [active]` — Write boundary with embedding
- `sync-cpt` — Sync CPT from JSON to vector ledger
- `read-cpt` — Read CPT from JSON ledger
- `metrics` — Show recent metrics

### 2. `inspect-vector-ledger.js` ✅ DIAGNOSTIC
**Purpose**: Examine existing vector database schema and data  
**Usage**: `node inspect-vector-ledger.js`

### 3. `register-cpt-vector.js` ✅ CPT REGISTRATION
**Purpose**: Register CPT in vector database with semantic embedding  
**Usage**: `node register-cpt-vector.js`

### 4. `verify-archaiforge.js` ✅ SYSTEM CHECK
**Purpose**: Comprehensive system verification  
**Usage**: `node verify-archaiforge.js`

---

## Dependencies

```json
{
  "dependencies": {
    "@lancedb/lancedb": "^0.23.0",
    "@xenova/transformers": "^2.17.2"
  },
  "optionalDependencies": {
    "@lancedb/lancedb-darwin-x64": "^0.23.0"
  }
}
```

Both dependencies are automatically added to your project during `archaiforge init`.

---

## Final Status

**Production Status**:
- ✅ Vector Database: Fully operational (6 tables)
- ✅ Semantic Embeddings: MiniLM L6 v2 (384-dim)
- ✅ Vector Writing: All tools use real embeddings
- ✅ Vector Querying: Fully operational via `archaiforge query` CLI

**Conclusion**: Vector ledger is the single source of truth. All writes use real MiniLM embeddings for proper semantic search.

---

**Created by**: Archaiforge Intelligence  
**Updated**: 2025-12-22 (MiniLM embedding integration)
