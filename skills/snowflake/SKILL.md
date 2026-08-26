---
name: snowflake
description: "Operational skill for Snowflake: warehouses, roles, stages, COPY, Time Travel, and cost-aware SQL analytics."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["snowflake", "warehouse", "sql", "copy", "rbac", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Snowflake Warehouse AI Skill Guide

## Overview & Engine Architecture

Snowflake separates storage and compute: virtual warehouses run SQL against micro-partitioned tables in cloud storage. Roles and grants gate access; stages + `COPY`/`Snowpipe` land files. Agents size warehouses to workload, design clustering for large filters, use Zero-Copy Clones/Time Travel carefully (cost), and keep secrets out of worksheets committed to git.

```
Stages / Snowpipe / connectors
        -> tables (micro-partitions)
        -> virtual warehouse compute
        -> result cache / services
```

## When to use this skill

- Cloud warehouse SQL, ELT with `@dbt`
- Loading Parquet/CSV from cloud stages
- Role-based access and environment isolation (DEV/PROD)

## Operational directives

1. Use least-privilege roles; never develop as `ACCOUNTADMIN` for daily work.
2. Suspend warehouses when idle; match size to query shape, not habit.
3. Prefer set-based `COPY INTO` / `MERGE` over row-by-row inserts.
4. Bound exploratory queries (`LIMIT`, sample, date filters) on large facts.
5. Treat Time Travel and Fail-safe retention as cost decisions.

## Load + merge sketch

```sql
CREATE FILE FORMAT IF NOT EXISTS json_parquet TYPE = PARQUET;

CREATE STAGE IF NOT EXISTS stg_orders
  URL='s3://bucket/orders/'
  STORAGE_INTEGRATION = si_prod;

COPY INTO raw.orders_ext
FROM @stg_orders
FILE_FORMAT = (FORMAT_NAME = json_parquet)
PATTERN = '.*\\.parquet';

MERGE INTO marts.fct_orders t
USING raw.orders_ext s
ON t.order_id = s.order_id
WHEN MATCHED THEN UPDATE SET amount = s.amount, updated_at = s.updated_at
WHEN NOT MATCHED THEN INSERT (order_id, amount, updated_at)
  VALUES (s.order_id, s.amount, s.updated_at);
```

## Session hygiene

```sql
USE ROLE TRANSFORMER;
USE WAREHOUSE ETL_WH;
USE DATABASE ANALYTICS;
ALTER SESSION SET STATEMENT_TIMEOUT_IN_SECONDS = 600;
```

## Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Credits spike | large WH left running | auto-suspend; right-size |
| Slow prune | poor clustering / casting filters | cluster keys; avoid wrapping columns |
| Privilege error | wrong role/secondary roles | `SHOW GRANTS`; grant usage |
| Duplicate loads | non-idempotent COPY | force/purge strategy; load history |

## Best practices

- Separate loader vs transformer vs reporter roles.
- Use transient/temp tables for staging when retention is unnecessary.
- Monitor `QUERY_HISTORY` and warehouse metering views.
- Pair with `@dbt` for versioned models and tests.

## Limitations

- Account params, editions, and region features differ by contract.
- External network/secrets integrations need admin setup.
- Unload costs and cross-cloud egress are easy to underestimate.

## Related skills

- `@dbt` - model lifecycle on Snowflake
- `@airflow` / `@prefect` - orchestration of loads
- `@great-expectations` - data quality suites
