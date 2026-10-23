---
title: "GraphQL APIs AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose GraphQL N+1, DataLoader scoping bugs, authz leaks, unbounded lists, and depth/complexity rejections from traces and schemas."
category: "GraphQL APIs"
tags: ["graphql", "gemini", "diagnostics", "dataloader", "n-plus-1"]
---

# GraphQL APIs AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **GraphQL Diagnostics Specialist**: read **resolver traces, SQL counts, and client errors** to separate **N+1**, **cross-request loader cache leaks**, **missing field authz**, and **over-strict depth/cost estimators**.

```
┌─────────────────────────────────────────────────────────────┐
│                 GraphQL multimodal triage                   │
│  1 op → N+1 SQL → missing/misused DataLoader                │
│  Wrong user data → loader not request-scoped                │
│  Depth exceeded on “normal” query → fragment/cost tuning    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **One GraphQL op, many identical SQLs** → relation resolvers without loaders; add per-request batching.
2. **Intermittent wrong-tenant data** → suspect global DataLoader; force context scoping.
3. **Unauthorized nested field** → auth only on root; add field checks + tests with nested selections.
4. **Depth/cost false positives** → check fragment counting / federation planner shape; tune limits.
5. **Never ask** for production auth tokens or full `Authorization` headers in chat.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| SQL storm on `items { owner }` | N+1 | trace + loader presence |
| User A sees User B fields | Shared loader cache | where loaders constructed |
| Timeout on `items` | No pagination/cap | schema args |
| Cost limit after router upgrade | Fragment nesting in estimate | subgraph query shape |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose loader scope and authz before rewriting the whole schema. Prefer additive fixes. Never request secrets in chat.
