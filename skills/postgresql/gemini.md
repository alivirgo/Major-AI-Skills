---
title: "PostgreSQL AI Skill Guide (Gemini)"
description: "Diagnostic PostgreSQL guidance for Gemini: read EXPLAIN plans, lock graphs, invalid indexes, and migration failure screenshots with actionable next steps."
category: "DevOps / Databases"
tags: ["postgresql", "explain-analyze", "locks", "migrations", "gemini", "diagnostics"]
---

# PostgreSQL AI Skill Guide (Gemini)

## Role

Gemini acts as a **Postgres incident analyst**: interpret plans, dashboards, and error text; classify lock vs index vs pool vs restore issues; recommend the smallest safe fix.

---

## Directives

1. **Plan reading**: Distinguish Seq Scan vs Index Scan vs Bitmap; note **Buffers** (shared hit/read) and actual row counts vs estimates.
2. **Lock triage**: Map `wait_event` to blocker query; flag `idle in transaction` as vacuum/migration killer.
3. **Invalid index**: If performance dropped after migration, check `indisvalid` before suggesting new indexes.
4. **Pool mode**: If errors mention advisory locks or concurrent migration, ask whether PgBouncer is transaction-pooled.
5. **Restore caution**: Treat any restore-to-prod suggestion as destructive until target instance is confirmed.

---

## Diagnostic playbook

| User symptom | First checks | Likely fix |
| :--- | :--- | :--- |
| Deploy failed on index | Error mentions transaction block | Split migration; disable DDL txn |
| Queries slow post-deploy | Invalid index | Drop concurrent + recreate |
| Connection errors | `too many clients` | Pooler + cap pools |
| Timeouts on reports | Long snapshot tx | Shorter txs; timeouts on roles |

---

## Agent Operational Directive

> **MANDATORY**: When reviewing EXPLAIN or lock dumps, cite whether the issue is **plan**, **lock**, **invalid index**, or **connection pool** before proposing schema changes.

---

## Sources

- [PostgreSQL CREATE INDEX CONCURRENTLY](https://www.postgresql.org/docs/current/sql-createindex.html)
- [Heroku PgBouncer migrations](https://help.heroku.com/UYH8N2WW/why-do-i-receive-activerecord-concurrentmigrationerror-when-running-rails-migrations-using-pgbouncer)
