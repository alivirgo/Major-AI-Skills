---
title: "Snowflake AI Skill Guide (GPT & Codex)"
description: "GPT/Codex Snowflake SQL: MERGE templates, COPY pipelines, QUERY_TAG instrumentation, and role/session headers."
category: "DevOps / Warehouse"
tags: ["snowflake", "merge", "copy", "gpt-codex"]
---

# Snowflake AI Skill Guide (GPT & Codex)

## Directives

1. Prefix scripts with `USE ROLE`, `USE WAREHOUSE`, `QUERY_TAG`, `STATEMENT_TIMEOUT`.
2. Loads must include MERGE or explicit dedupe strategy.
3. Parameterize stage URLs and integration names; no inline secrets.

---

## Agent Operational Directive

> **MANDATORY**: Generated ELT must document merge key and handle re-runnable COPY.

---

## Sources

- [COPY INTO](https://docs.snowflake.com/en/sql-reference/sql/copy-into-table)
