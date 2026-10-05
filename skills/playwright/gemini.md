---
title: "Playwright E2E AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to analyze trace viewer screenshots, strict-mode violations, and parallel collision patterns."
category: "Testing / Playwright"
tags: ["playwright", "trace", "diagnostics", "gemini"]
---

# Playwright E2E AI Skill Guide (Gemini)

## Operational Capabilities & Agent Directives

1. **Trace waterfall**: Identify last successful action before timeout.
2. **Strict mode**: Screenshot showing multiple matching elements → locator too broad.
3. **Worker collisions**: Failures only on sharded CI → shared DB user conflict.

## Agent Operational Directive

> **MANDATORY**: Recommend locator narrowing and worker-scoped data before increasing retries.
