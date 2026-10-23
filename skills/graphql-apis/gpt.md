---
title: "GraphQL APIs AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate GraphQL schemas, per-request DataLoaders, authz-aware resolvers, cursor pagination, and complexity-limited server setups."
category: "GraphQL APIs"
tags: ["graphql", "dataloader", "authorization", "pagination", "gpt-codex"]
---

# GraphQL APIs AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **GraphQL Automation Engineer**: emit **SDL + resolver maps**, **request-scoped DataLoaders**, **field authz**, and **paginated connections**—never global loaders, unbounded lists, or auth-only-at-gateway designs.

```
┌─────────────────────────────────────────────────────────────┐
│                 GraphQL codegen                             │
│  schema → context(loaders) → resolvers → @prisma/db         │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate DataLoaders inside `buildContext`—never module singletons with caches.
2. Batch functions must return arrays aligned to input key order.
3. Enforce authz in Query/Mutation/field resolvers before returning sensitive data.
4. Cap `first` and use cursor connections for lists that can grow.
5. Add depth/complexity validation for public endpoints; mask internal errors in prod.
6. Cross-link `@prisma`, `@express`/`@nextjs`, `@typescript`; never invent API tokens in examples.

---

## Production snippet: loader factory

```ts
export function createLoaders(db: Db) {
  return {
    userById: new DataLoader(async (ids: readonly string[]) => {
      const rows = await db.usersByIds([...ids]);
      const map = new Map(rows.map((u) => [u.id, u]));
      return ids.map((id) => map.get(id) ?? null);
    }),
  };
}
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| N+1 QPS spike | Loader on relation fields? | Add per-request loader |
| Cross-user data leak | Global loader cache? | Request-scoped context |
| Timeout on list | Unbounded first? | Cap + cursor |
| Breaking clients | Field removed? | Deprecate first |

---

## Agent Operational Directive

> **MANDATORY**: Per-request loaders, resolver authz, pagination + cost limits. Additive schema evolution. No invented credentials.
