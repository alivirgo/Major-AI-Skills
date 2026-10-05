---
title: "Vitest Testing AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to author vitest.config.ts, isolation-safe mocks, fake timers, and CI coverage gates."
category: "Testing / Vitest"
tags: ["vitest", "coverage", "mocks", "gpt-codex"]
---

# Vitest Testing AI Skill Guide (GPT & Codex)

## Operational Capabilities & Agent Directives

1. Default `pool: 'forks'`, `isolate: true`, `restoreMocks: true`.
2. Never generate `await new Promise(r => setTimeout(r, …))` for assertions.
3. CI script: `vitest run --coverage` with threshold fail.
4. Warn when user requests `isolate: false` without cleanup plan.

## Agent Operational Directive

> **MANDATORY**: Fake timers for debounce/time tests. Reset mocks/timers in hooks.
