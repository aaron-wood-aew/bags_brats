# Vector Ledger Tools - Catalog

> **Quick reference for AI agents**  
> These are diagnostic and reference tools. For production use, always use the `archaiforge` CLI.

---

## Available Tools

| Tool | File | Type | Description | Usage |
|------|------|------|-------------|-------|
| **Query Vector DB** | - | CLI | Query CPT history, outcomes, metrics | `archaiforge query <command>` |
| **Inspect Database** | `inspect-vector-ledger.js` | Diagnostic | View all tables and schemas | `node inspect-vector-ledger.js` |
| **Inspect Metrics** | `inspect-metrics-schema.js` | Diagnostic | View metrics table schema | `node inspect-metrics-schema.js` |
| **Register CPT** | `register-cpt-vector.js` | Reference | Example CPT registration | `node register-cpt-vector.js` |
| **Verify System** | `verify-archaiforge.js` | Diagnostic | Check system health | `node verify-archaiforge.js` |
| **Ledger Manager** | `ledger-manager.js` | Management | Sync CPT, manage ledger | `node ledger-manager.js <command>` |

---

## Quick Commands

### Query Vector Database (Production)
```bash
archaiforge query cpt-history          # All CPT versions
archaiforge query cpt-gold             # Current GOLD STANDARD
archaiforge query outcomes             # All outcomes
archaiforge query stats                # Database statistics
```

### Diagnostics (Development)
```bash
node inspect-vector-ledger.js          # View database structure
node verify-archaiforge.js             # System health check
```

### Management (Advanced)
```bash
node ledger-manager.js read-cpt        # Read CPT from JSON
node ledger-manager.js sync-cpt        # Sync CPT to vector DB
```

---

## For AI Agents

**Primary tool**: Use `archaiforge query` CLI commands for all production queries.

**Diagnostic tools**: Only use the `.js` scripts when debugging or understanding the vector system internals.

**Vector database location**: `.archaiforge/vectors/` (not here - this directory contains tools only)

---

## Documentation

- [README.md](./README.md) - Complete architecture documentation
- [TOOLS_STATUS.md](./TOOLS_STATUS.md) - Tool capabilities matrix
- [COMPLETE.md](./COMPLETE.md) - Implementation history

---

**Updated**: 2025-12-21
