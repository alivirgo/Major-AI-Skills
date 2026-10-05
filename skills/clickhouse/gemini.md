---
title: "ClickHouse AI Skill Guide (Gemini)"
description: "Gemini ClickHouse diagnostics: system.query_log, parts count, and merge backlog interpretation."
category: "DevOps / OLAP"
tags: ["clickhouse", "query_log", "gemini"]
---

# ClickHouse AI Skill Guide (Gemini)

## Directives

1. Inspect `system.parts` / `system.merges` when users report ingest stalls.
2. Compare estimated rows read in EXPLAIN vs actual in query_log.
3. Flag `FINAL` overuse before schema changes.

---

## Agent Operational Directive

> **MANDATORY**: Classify issues as ingest batching, sort key mismatch, or mutation load before recommending hardware scale-up.

---

## Sources

- [ClickHouse MergeTree](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree)
