---
name: postgresql
description: "Design PostgreSQL schemas, indexes, and safe online migrations; diagnose locks and slow queries with EXPLAIN; configure pooling, auth, and backup/restore without PgBouncer or invalid-index traps."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["postgresql", "sql", "indexes", "migrations", "pgbouncer", "vacuum", "backup", "connection-pooling", "explain"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# PostgreSQL Administration & SQL AI Skill Guide

## Overview & Engine Architecture

PostgreSQL is a relational database with **MVCC**: updates create new row versions; dead tuples remain until **VACUUM**. Writers never block readers on row data, but **DDL and some migrations take strong locks**. Connection storms are a common production failure mode—apps should pool (PgBouncer, RDS Proxy, or app pool) and cap `max_connections`.

```
App / ORM
    -> PgBouncer (session vs transaction pool) OR app pool
        -> Postmaster
            -> backends (one per session)
            -> shared_buffers + WAL
            -> heap / TOAST / indexes (B-tree, GIN, GiST, BRIN)
            -> autovacuum + pg_stat_statements
```

---

## When to use / when not to

**Use when**

- Designing tables, constraints, and indexes for real query shapes
- Planning **online** index or schema changes on production data
- Diagnosing lock waits, bloat, or slow plans with `EXPLAIN (ANALYZE, BUFFERS)`
- Configuring roles, TLS, and backup/restore for managed or self-hosted Postgres

**Do not use when**

- The workload is append-only analytics at huge scale (consider `@clickhouse`, `@duckdb`, `@snowflake`)
- You need flexible document nesting without joins (`@mongodb`)
- Someone asks to disable SSL verification or commit superuser passwords to git—refuse and use secrets managers

---

## Operational Capabilities & Agent Directives

1. **Connection safety**: Size pools to `(cores * 2–4)` on the DB side, not “one connection per request.” Never run migrations through **PgBouncer transaction pooling** without session pool or direct DB URL—advisory locks break.
2. **Migration safety**: `CREATE INDEX CONCURRENTLY` and `DROP INDEX CONCURRENTLY` **cannot run inside a transaction block**. One statement per migration when DDL transactions are disabled; drop invalid indexes before retry—never rely on `IF NOT EXISTS` after a failed concurrent build.
3. **Index discipline**: Index for equality filters first, then sort keys, then range; use partial indexes for hot subsets. Prefer `CONCURRENTLY` in prod; validate with `pg_index.indisvalid`.
4. **Lock awareness**: Long transactions block vacuum and concurrent index builds. Use `lock_timeout` / `statement_timeout` on migration roles; expand/contract for column type changes.
5. **Auth**: Least-privilege roles; separate migration role from app role. TLS to server; never embed passwords in repo connection strings.
6. **Backup/restore**: Understand **PITR** (WAL archiving) vs logical dumps (`pg_dump`). Restoring a dump to prod without rename/isolation destroys data—require explicit approval and restore targets.
7. **Observability**: Enable `pg_stat_statements`; correlate `pg_locks`, `pg_stat_activity`, and `EXPLAIN` on representative data volumes—not empty dev DBs.

---

## Production examples

### Schema + partial index (online)

```sql
CREATE TABLE orders (
  id            bigserial PRIMARY KEY,
  customer_id   bigint NOT NULL REFERENCES customers(id),
  status        text NOT NULL,
  total_cents   integer NOT NULL CHECK (total_cents >= 0),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Production: CONCURRENTLY, outside a transaction wrapper
DROP INDEX CONCURRENTLY IF EXISTS orders_customer_created_idx;
CREATE INDEX CONCURRENTLY orders_customer_created_idx
  ON orders (customer_id, created_at DESC)
  WHERE status <> 'cancelled';
```

### Safe migration pattern (expand/contract)

1. Add nullable column or new table; deploy app that dual-writes.
2. Backfill in keyed batches (`WHERE id > $last LIMIT 5000`) with short transactions.
3. Switch reads to new column; deploy.
4. Drop old column in a later release with `CONCURRENTLY` index swaps as needed.

### Connection string hygiene (app role)

```text
postgresql://app_ro:***@db.internal:5432/app?sslmode=verify-full&connect_timeout=10&statement_timeout=30000
```

Migrations: use **direct** Postgres or PgBouncer **session** mode URL, not transaction pool.

### Diagnosis

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT customer_id, sum(total_cents)
FROM orders
WHERE created_at >= now() - interval '30 days'
GROUP BY customer_id;

SELECT pid, wait_event_type, wait_event, query
FROM pg_stat_activity
WHERE state <> 'idle' AND query NOT LIKE '%pg_stat_activity%';

SELECT indexrelid::regclass, indisvalid
FROM pg_index
WHERE NOT indisvalid;
```

---

## Technical troubleshooting matrix

| Failure signature | Root cause | Diagnostic & fix |
| :--- | :--- | :--- |
| `CREATE INDEX CONCURRENTLY cannot run inside a transaction block` | ORM migration wrapped in transaction | Disable DDL transaction for that migration only; single statement |
| Migration “succeeds” but queries slow | **Invalid** index left after timeout | `pg_index.indisvalid = false`; `DROP INDEX CONCURRENTLY` then recreate |
| `ConcurrentMigrationError` / stuck advisory lock | PgBouncer **transaction** pooling | Session pool for migrations; kill stray `advisory` locks |
| `too many connections` | Unbounded app pools | PgBouncer; lower per-service pool; raise `max_connections` only after math |
| Rising dead tuples / bloat | Long txs / autovacuum blocked | Find blockers in `pg_stat_activity`; tune autovacuum; avoid long `REPEATABLE READ` reports |
| Seq Scan on large table | Missing or invalid index | Add partial/covering index; `ANALYZE`; check casts/wrappers on indexed columns |
| Restore “worked” but app broken | Restored over production or wrong timeline | Restore to new cluster/DB; repoint apps; verify extensions and roles |

---

## Best practices

- Use **`pg_stat_statements`** for top queries; fix plans before buying bigger hardware.
- Set **`idle_in_transaction_session_timeout`** on app roles to prevent connection leaks holding locks.
- Prefer **keyset pagination** (`WHERE id > $cursor ORDER BY id LIMIT n`) over large `OFFSET`.
- For FKs: index the referencing column; understand `VALIDATE CONSTRAINT` vs full table lock on add.
- Managed Postgres: confirm extension allowlist, parameter groups, and whether `CONCURRENTLY` is permitted from your migration runner.

---

## Limitations

- Logical replication, partitioning, and citus-style sharding need dedicated runbooks—not one-size fits all.
- ORM migrations often hide lock duration; always review generated SQL for table rewrites.
- This skill does not replace storage/IOPS capacity planning or HA failover testing.

---

## Related skills

- `@supabase` — Postgres product surface with RLS
- `@prisma` — ORM migrations still need SQL review
- `@redis` — cache-aside in front of hot reads
- `@vault` — dynamic DB credentials

---

## Agent Operational Directive

> **MANDATORY**: Never run production DDL inside a transaction that includes `CONCURRENTLY`. Never route schema migrations through PgBouncer transaction pooling without an explicit session-pool path. After any failed concurrent index build, check for invalid indexes before marking migrations complete. Do not put credentials in git or suggest `sslmode=disable` on untrusted networks.

---

## Source anchors (research)

- [PostgreSQL CREATE INDEX CONCURRENTLY](https://www.postgresql.org/docs/current/sql-createindex.html)
- [Postgres Migration Safety Handbook — CONCURRENTLY in transactions](https://migrationpilot.dev/handbook/concurrently-inside-transaction)
- [Heroku — PgBouncer advisory locks and migrations](https://help.heroku.com/UYH8N2WW/why-do-i-receive-activerecord-concurrentmigrationerror-when-running-rails-migrations-using-pgbouncer)
- [Flyway #2895 — transaction pooling vs advisory locks](https://github.com/flyway/flyway/issues/2895)
- [Invalid index trap with IF NOT EXISTS (2024)](https://www.shayon.dev/post/2024/225/stop-relying-on-if-not-exists-for-concurrent-index-creation-in-postgresql/)
