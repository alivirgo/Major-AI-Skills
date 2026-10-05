---
title: "Temporal AI Skill Guide (GPT & Codex)"
description: "GPT/Codex Temporal workflow/activity codegen with timeouts, patched() stubs, and replay-test harness hooks."
category: "Development / Orchestration"
tags: ["temporal", "typescript", "replay", "gpt-codex"]
---

# Temporal AI Skill Guide (GPT & Codex)

## Directives

1. Split `workflows.ts` (deterministic) from `activities.ts` (I/O).
2. Every `proxyActivities` block includes `startToCloseTimeout` and retry policy.
3. Emit `workflow.patched("name")` when changing command sequence in existing workflows.
4. Activities accept `idempotencyKey` derived from workflow/activity IDs.

---

## Replay test hook (sketch)

```typescript
// In CI: Worker.runReplayHistories(historiesFromProdSample)
// Fail build on NonDeterminismError
```

---

## Agent Operational Directive

> **MANDATORY**: Generated workflows must not import network/DB clients directly.

---

## Sources

- [Temporal safe deployments](https://docs.temporal.io/develop/safe-deployments)
