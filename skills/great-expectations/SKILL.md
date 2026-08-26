---
name: great-expectations
description: "Operational skill for Great Expectations: Expectation Suites, Checkpoints, Datasources, and data quality gates in pipelines."
category: scientific
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["great-expectations", "data-quality", "validation", "etl", "testing", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Great Expectations Data Quality AI Skill Guide

## Overview & Engine Architecture

Great Expectations (GX) validates batches of data against Expectation Suites. Datasources/connectors describe how to read data; Checkpoints run validation and emit Data Docs / action notifications. Agents encode measurable contracts (null rates, ranges, set membership, row counts), fail pipelines on critical expectations, and keep suites versioned with code.

```
Datasource -> Batch -> Expectation Suite
                         -> Checkpoint / Validation Result
                         -> Data Docs / actions (Slack, store)
```

## When to use this skill

- Blocking bad data before warehouse loads or model training
- Documenting statistical contracts for analytics tables
- CI checks on sample fixtures plus scheduled prod validations

## Operational directives

1. Start with critical expectations only (nulls, uniqueness, ranges) - grow suites deliberately.
2. Bind suites to stable batch definitions (table + time partition), not one-off CSVs.
3. Fail the job on `success=False` for producer pipelines; warn-only for exploratory.
4. Keep expectation thresholds grounded in measured baselines, not vibes.
5. Commit suites/checkpoints; treat Data Docs as build artifacts.

## Fluent GX sketch (modern API)

```python
import great_expectations as gx

context = gx.get_context()
datasource = context.data_sources.add_pandas(name="orders_df")
# Or connect SQL / filesystem per project docs for your GX version

batch = datasource.read_dataframe(df, asset_name="orders")
suite = context.suites.add(gx.ExpectationSuite(name="orders.critical"))

suite.add_expectation(gx.expectations.ExpectColumnValuesToNotBeNull(column="order_id"))
suite.add_expectation(gx.expectations.ExpectColumnValuesToBeUnique(column="order_id"))
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeBetween(column="amount", min_value=0, max_value=1_000_000)
)

result = batch.validate(suite)
assert result.success, result
```

## CLI-oriented workflow

```bash
great_expectations --version
# Project scaffold and checkpoint run commands vary by GX major;
# prefer documented fluent API for new projects and pin the package.
```

## Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Suite never fails | thresholds too loose | tighten from metrics history |
| Flaky CI | non-deterministic samples | fixed fixtures; partition filters |
| Slow validation | full table scans hourly | sample + critical cols; pushdown SQL |
| API confusion | GX v0 vs fluent v1 | pin version; follow matching docs |

## Best practices

- Separate "critical" vs "diagnostic" suites.
- Validate at ingest boundaries and again at mart publish.
- Store validation results for trend charts (null rate creep).
- Pair with `@dbt` tests for warehouse-native uniqueness/relationships.

## Limitations

- Exact Python API shifted across GX majors - pin and read release notes.
- Not a streaming anomaly detector by itself.
- Profiling helpers suggest expectations; humans still own business rules.

## Related skills

- `@dbt` - SQL tests beside models
- `@airflow` / `@prefect` - run checkpoints on schedule
- `@pandas` / `@spark` - batch sources under test
