---
name: postgresql
description: "Operational skill for PostgreSQL: schema design, indexing, EXPLAIN ANALYZE, vacuum, safe migrations, and production query hygiene."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["postgresql", "sql", "indexes", "explain", "migrations", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# PostgreSQL Administration & SQL AI Skill Guide

## Overview & Engine Architecture

PostgreSQL is a relational database with MVCC, rich indexing (B-tree, GIN, GiST, BRIN), and extensibility. Writers create new row versions; `VACUUM` reclaims dead tuples. Agents design schemas and indexes for real query shapes, use `EXPLAIN (ANALYZE, BUFFERS)`, and treat locking migrations as production incidents waiting to happen.

```
Clients / poolers (PgBouncer)
        |
        v
  Postmaster + backends
        |
   +----+----+
   | shared buffers / WAL |
   | tables / indexes / TOAST |
   +------------------------+
```

## When to use this skill

- Designing tables, constraints, and indexes
- Diagnosing slow queries
- Planning online migrations (`CREATE INDEX CONCURRENTLY`, expand/contract)
- Reviewing ORM-generated SQL

## Operational directives

1. Always bound writes with a precise `WHERE` (or use keyed batches).
2. Create hot indexes with `CONCURRENTLY` in production.
3. Prefer `EXPLAIN (ANALYZE, BUFFERS)` on realistic data volumes.
4. Add `NOT NULL` / FKs intentionally; understand lock levels of DDL.
5. Never put production credentials in connection strings committed to git.

## Schema + index example

```sql
CREATE TABLE orders (
  id            bigserial PRIMARY KEY,
  customer_id   bigint NOT NULL REFERENCES customers(id),
  status        text NOT NULL,
  total_cents   integer NOT NULL CHECK (total_cents >= 0),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX CONCURRENTLY orders_customer_created_idx
  ON orders (customer_id, created_at DESC)
  WHERE status <> 'cancelled';
```

## Query diagnosis

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT customer_id, sum(total_cents)
FROM orders
WHERE created_at >= now() - interval '30 days'
GROUP BY customer_id;
```

| Plan smell | Meaning | Direction |
| --- | --- | --- |
| Seq Scan on large table | Missing/usable index | Covering index or better filter |
| Nested Loop explosion | Bad join order/stats | Analyze; rewrite join |
| Sort + Disk | work_mem / missing index | Index for ORDER BY; raise carefully |
| Lock waits | DDL or long tx | Shorter transactions |

## Migration safety (expand/contract)

1. Add nullable column / new table.
2. Dual-write or backfill in batches.
3. Switch reads.
4. Drop old column in a later release.

## Best practices

- Connection pool in app or PgBouncer; do not open unbounded connections.
- Autovacuum tuning before manual vacuum storms.
- Use `pg_stat_statements` for top offenders.
- Time-outs (`statement_timeout`) on app roles.

## Limitations

- Managed Postgres (RDS/Cloud SQL/Aurora/Supabase) changes backup and extension availability.
- Logical replication and partitioning need dedicated designs.
- This skill does not replace capacity planning for IOPS/storage.

## Related skills

- `@supabase` - Postgres with Auth/RLS product surface
- `@redis` - caching in front of hot reads
- `@prisma` - TypeScript ORM migrations that still need SQL review
