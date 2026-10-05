---
name: snowflake
description: "Size Snowflake warehouses, design RBAC and stages, run idempotent COPY/MERGE loads, bound ad-hoc SQL cost, and avoid Time Travel/Fail-safe and restore credit surprises."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["snowflake", "warehouse", "rbac", "copy", "merge", "snowpipe", "time-travel", "storage-integration"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Snowflake Warehouse AI Skill Guide

## Overview & Engine Architecture

Snowflake separates **storage** (micro-partitions in cloud object storage) from **compute** (virtual warehouses). SQL runs on warehouses; services layer handles auth, metadata, and result cache. **Roles** gate objects; **stages** reference cloud files; **COPY** / **Snowpipe** / connectors load data. Time Travel and Fail-safe retain historical data at **cost**.

```
Stages / Snowpipe / connectors
    -> tables (micro-partitions, clustering metadata)
    -> virtual warehouse (compute credits)
    -> RESULT_SCAN / query history / RBAC
```

---

## When to use / when not to

**Use when**

- Cloud warehouse ELT with `@dbt`, role-separated envs (DEV/PROD)
- Semi-structured loads (Parquet/JSON) via stages and file formats
- Sharing read-only datasets via Secure Data Sharing (with governance)

**Do not use when**

- Sub-millisecond OLTP on many small rows (`@postgresql`)
- Local laptop-only analytics without cloud account (`@duckdb`)
- Daily work as `ACCOUNTADMIN`—use least-privilege roles

---

## Operational Capabilities & Agent Directives

1. **Auth/RBAC**: Separate loader, transformer, analyst roles; `USE ROLE` explicitly in scripts; key-pair auth for service users; never commit passwords or private keys.
2. **Warehouse cost**: Auto-suspend (60s typical); right-size WH; separate WH for ETL vs ad-hoc; bound exploratory queries with date filters and `LIMIT`.
3. **Loads**: Prefer **`COPY INTO`** / **`MERGE`** set-based patterns; track load idempotency with file metadata or staging keys—duplicate COPY without strategy duplicates rows.
4. **Connection safety**: JDBC/ODBC pool sizes modest; `STATEMENT_TIMEOUT_IN_SECONDS` on sessions; use `QUERY_TAG` for cost attribution.
5. **Clustering**: For huge filtered tables, monitor clustering depth; avoid wrapping filter columns in functions that prevent pruning.
6. **Backup/restore**: Time Travel `DATA_RETENTION_TIME_IN_DAYS` is not a DR plan alone; Fail-safe adds cost; cloning (`CREATE TABLE ... CLONE`) is not free—document credit impact.
7. **Exactly-once myth**: Snowflake transactions are ACID within statements/tables, but **pipeline** exactly-once requires merge keys and dedupe of staged files across retries.

---

## Production examples

### Session hygiene

```sql
USE ROLE TRANSFORMER;
USE WAREHOUSE ETL_WH;
USE DATABASE ANALYTICS;
ALTER SESSION SET STATEMENT_TIMEOUT_IN_SECONDS = 600;
ALTER SESSION SET QUERY_TAG = 'dbt_daily_fct_orders';
```

### Stage + COPY

```sql
CREATE FILE FORMAT IF NOT EXISTS ff_parquet TYPE = PARQUET;

CREATE STAGE IF NOT EXISTS stg_orders
  URL = 's3://bucket/orders/'
  STORAGE_INTEGRATION = si_prod;

COPY INTO raw.orders_ext
FROM @stg_orders
FILE_FORMAT = ff_parquet
PATTERN = '.*\\.parquet'
ON_ERROR = 'ABORT_STATEMENT';
```

### Idempotent MERGE

```sql
MERGE INTO marts.fct_orders t
USING raw.orders_ext s
ON t.order_id = s.order_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN
  UPDATE SET amount = s.amount, updated_at = s.updated_at
WHEN NOT MATCHED THEN
  INSERT (order_id, amount, updated_at)
  VALUES (s.order_id, s.amount, s.updated_at);
```

### Cost/debug

```sql
SELECT * FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())
WHERE query_tag = 'dbt_daily_fct_orders'
ORDER BY start_time DESC LIMIT 20;
```

---

## Technical troubleshooting matrix

| Failure signature | Root cause | Diagnostic & fix |
| :--- | :--- | :--- |
| Credit spike | WH never suspends / XL default | Auto-suspend; resize; separate WH |
| Slow full scan | Poor clustering / cast filters | Cluster keys; sargable predicates |
| Access denied | Role or future grants missing | `SHOW GRANTS`; grant USAGE chain |
| Duplicate fact rows | Re-run COPY without purge | MERGE; copy history; stage file lists |
| Time Travel bill shock | Long retention on huge tables | Lower retention; transient staging |
| OAuth/key auth fail | Rotated key not updated | Rotate service user keys safely |

---

## Best practices

- Transient tables for scratch staging when retention unnecessary.
- Storage integrations over embedded credentials in stages.
- Pair with `@dbt` tests (`unique`, `not_null`) on merge keys.
- Monitor `WAREHOUSE_METERING_HISTORY` and storage usage views.

---

## Limitations

- Region/edition feature gaps (dynamic tables, cross-cloud egress).
- External network policies require admin setup.
- Agents cannot see account-specific credit contracts—ask for limits.

---

## Related skills

- `@dbt` — model lifecycle
- `@airflow` / `@prefect` — orchestration
- `@great-expectations` — data quality

---

## Agent Operational Directive

> **MANDATORY**: Never recommend `ACCOUNTADMIN` for routine transforms. Every load pattern must state idempotency (MERGE keys or file tracking). Set warehouse auto-suspend and statement timeouts in examples. Do not commit secrets.

---

## Source anchors (research)

- [Snowflake COPY INTO](https://docs.snowflake.com/en/sql-reference/sql/copy-into-table)
- [Snowflake MERGE](https://docs.snowflake.com/en/sql-reference/sql/merge)
- [Understanding compute cost](https://docs.snowflake.com/en/user-guide/credits)
- [Time Travel data retention](https://docs.snowflake.com/en/user-guide/data-time-travel)
