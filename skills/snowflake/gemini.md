---
title: "Snowflake AI Skill Guide (Gemini)"
description: "Gemini Snowflake cost and privilege diagnostics from query history and warehouse metering."
category: "DevOps / Warehouse"
tags: ["snowflake", "credits", "gemini"]
---

# Snowflake AI Skill Guide (Gemini)

## Directives

1. Tie credit spikes to warehouse name, auto-suspend, and query tags.
2. Map authorization errors to missing USAGE grants on warehouse/database/schema.
3. Warn when duplicates imply missing MERGE idempotency.

---

## Agent Operational Directive

> **MANDATORY**: Separate **cost** issues from **access** issues before schema redesign.

---

## Sources

- [Snowflake credits](https://docs.snowflake.com/en/user-guide/credits)
