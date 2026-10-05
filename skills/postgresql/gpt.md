---
title: "PostgreSQL AI Skill Guide (GPT & Codex)"
description: "Automation-first PostgreSQL guidance for GPT/Codex: migration runners, EXPLAIN scripts, invalid-index guards, and PgBouncer-safe DDL patterns."
category: "DevOps / Databases"
tags: ["postgresql", "migrations", "pgbouncer", "create-index-concurrently", "gpt-codex", "ci-sql"]
---

# PostgreSQL AI Skill Guide (GPT & Codex)

## Role

GPT/Codex acts as a **Database Reliability Engineer**: emit idempotent SQL, migration files, and shell checks that agents can run in CI—not prose-only advice.

```
CI / deploy
  -> preflight: pg_index.indisvalid, pool mode, lock_timeout
  -> migration: single-statement CONCURRENTLY (no txn wrapper)
  -> postflight: EXPLAIN smoke + pg_stat_statements delta
```

---

## Directives

1. **Emit one DDL statement per migration file** when `disable_ddl_transaction` / `atomic=False` is required.
2. **Preflight script** before index migrations: list invalid indexes; `DROP INDEX CONCURRENTLY IF EXISTS` then create.
3. **Separate URLs**: `DATABASE_URL` (transaction pool) vs `MIGRATION_DATABASE_URL` (session/direct).
4. **Never** generate `CREATE INDEX CONCURRENTLY IF NOT EXISTS` as the only recovery path after failures.
5. **EXPLAIN artifacts**: store `EXPLAIN (ANALYZE, BUFFERS)` output in CI for changed queries.

---

## Production: invalid-index guard (SQL)

```sql
-- Run before CREATE INDEX CONCURRENTLY in deploy scripts
SELECT c.relname AS index_name, i.indisvalid
FROM pg_index i
JOIN pg_class c ON c.oid = i.indexrelid
WHERE NOT i.indisvalid;

-- Template migration (run outside transaction)
DROP INDEX CONCURRENTLY IF EXISTS orders_customer_created_idx;
CREATE INDEX CONCURRENTLY orders_customer_created_idx
  ON orders (customer_id, created_at DESC)
  WHERE status <> 'cancelled';
```

---

## Production: connection preflight (bash)

```bash
# Detect PgBouncer transaction pooling (heuristic: show pool_mode if accessible)
psql "$MIGRATION_DATABASE_URL" -v ON_ERROR_STOP=1 -c "SELECT version();"
psql "$MIGRATION_DATABASE_URL" -v ON_ERROR_STOP=1 -c "
  SET lock_timeout = '5s';
  SET statement_timeout = '0';
"
```

---

## Troubleshooting (automation lens)

| Signal | Script/check |
| :--- | :--- |
| Slow deploy | `pg_locks` + `pg_stat_progress_create_index` |
| Pool exhaustion | `pg_stat_activity` count by `application_name` |
| Plan regression | Compare `pg_stat_statements.mean_exec_time` week-over-week |

---

## Agent Operational Directive

> **MANDATORY**: Generated migrations must declare pool mode requirements in comments and fail CI if `MIGRATION_DATABASE_URL` is unset when DDL uses `CONCURRENTLY`.

---

## Sources

- [PostgreSQL CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)
- [migrationpilot.dev — CONCURRENTLY in transactions](https://migrationpilot.dev/handbook/concurrently-inside-transaction)
