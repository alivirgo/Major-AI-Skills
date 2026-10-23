---
name: graphql-apis
description: "Design production GraphQL schemas and resolvers with field-level authz, per-request DataLoader batching, cursor pagination, depth/complexity limits, and safe schema evolution."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["graphql", "schema", "resolvers", "dataloader", "authorization", "pagination", "persisted-queries"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# GraphQL APIs AI Skill Guide (Claude)

## Overview & Engine Architecture

GraphQL exposes a **typed schema** (types, queries, mutations, subscriptions) where clients select fields. The runtime **parses → validates → executes** resolvers. Naive per-field DB access causes **N+1** query fan-out. Agents design schemas for product use cases, enforce **authz in resolvers/fields**, batch with **per-request DataLoaders**, paginate lists, and harden public graphs with **depth/complexity limits** and optional **persisted/allowlisted operations**.

```
┌─────────────────────────────────────────────────────────────┐
│                 GraphQL request path                          │
│                                                             │
│  Client operation (+ variables, operation name)             │
│  ├── parse / validate (depth · complexity · auth directives)│
│  └── execute field resolvers                                │
│                                                             │
│  Context (per request)                                      │
│  ├── user / auth principal                                  │
│  ├── DataLoaders (request-scoped only)                      │
│  └── services / @prisma / DB                                │
│                                                             │
│  Hardening                                                  │
│  └── pagination · error masking · persisted queries (opt)   │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Designing or evolving GraphQL schemas; implementing resolvers without N+1.
- Adding authn/authz around sensitive types/fields; setting pagination and cost limits.
- Pairing GraphQL with `@express`, `@nodejs`, `@nextjs` (Route Handlers), or other HTTP hosts.

**Do not use when**

- A simple CRUD REST surface is enough and the team has no GraphQL clients → `@express` REST.
- The work is only ORM migrations/schema → `@prisma` / `@postgresql`.
- Someone asks to expose introspection + unlimited depth on a public internet API with no auth → refuse; add limits and authz first.

---

## Operational Capabilities & Agent Directives

1. **Schema as contract** (SDL-first or code-first with published schema)—clients depend on stable types; evolve additively; `@deprecated` before removal.
2. **Authz in resolvers/fields**—never trust client-provided IDs; check principal before return/mutate.
3. **Per-request DataLoaders**—create loaders on context; never share cache across requests; batch fn returns results **in key order**.
4. **Do not await loads in a serial for-loop** when batching is required—issue loads together (`Promise.all` / parallel field resolution).
5. **Paginate** growing lists (cursor/connection preferred); cap `first`/`last`.
6. **Limit depth/complexity** on public APIs; mask internal errors in prod; log **operation names**.
7. Test with **representative query documents** (integration), not only mocked unit resolvers; use codegen for typed documents when the stack supports it.

---

## Production Example: schema + DataLoader context

```graphql
type User {
  id: ID!
  email: String!
}

type Item {
  id: ID!
  sku: String!
  qty: Int!
  owner: User!
}

type ItemConnection {
  edges: [ItemEdge!]!
  pageInfo: PageInfo!
}

type ItemEdge {
  cursor: String!
  node: Item!
}

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}

type Query {
  item(id: ID!): Item
  items(first: Int = 20, after: String): ItemConnection!
}

type Mutation {
  createItem(sku: String!, qty: Int!): Item!
}
```

```ts
import DataLoader from "dataloader";

type User = { id: string; email: string };
type Item = { id: string; sku: string; qty: number; ownerId: string };

function createLoaders(db: Db) {
  return {
    userById: new DataLoader<string, User>(async (ids) => {
      const rows = await db.usersByIds([...ids]); // single WHERE id IN (…)
      const map = new Map(rows.map((u) => [u.id, u]));
      return ids.map((id) => map.get(id) ?? new Error(`User ${id} not found`));
    }),
  };
}

export function buildContext({ req, db }: { req: Req; db: Db }) {
  const user = requireUserFromAuthHeader(req); // throws/unauth → GraphQL error
  return { user, db, loaders: createLoaders(db) };
}

export const resolvers = {
  Query: {
    item: async (_: unknown, { id }: { id: string }, ctx: Ctx) => {
      const item = await ctx.db.itemById(id);
      if (!item) return null;
      await assertCanReadItem(ctx.user, item);
      return item;
    },
    items: async (_: unknown, args: { first?: number; after?: string }, ctx: Ctx) => {
      const first = Math.min(args.first ?? 20, 100);
      return ctx.db.listItemsConnection({ first, after: args.after, viewer: ctx.user });
    },
  },
  Item: {
    owner: (item: Item, _: unknown, ctx: Ctx) => ctx.loaders.userById.load(item.ownerId),
  },
  Mutation: {
    createItem: async (_: unknown, args: { sku: string; qty: number }, ctx: Ctx) => {
      ctx.requireUser();
      if (args.qty < 0) throw new UserInputError("qty must be >= 0");
      return ctx.db.createItem({ ...args, ownerId: ctx.user.id });
    },
  },
};
```

Host examples: Yoga/Apollo on `@express`/`@nodejs`; App Router handlers on `@nextjs`. Persist data with `@prisma`. Validate schema changes in CI (GraphQL Code Generator, Apollo Rover `graph check`, or equivalent).

```bash
npm run codegen
# schema registry (when used):
npx rover graph check my-graph@current --schema ./schema.graphql
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| DB QPS explodes on one GraphQL op | N+1 field resolvers | Per-request DataLoader; join/batch in service |
| Loader cache leaks auth data | Global/singleton DataLoader | Create loaders inside context per request |
| Batch mis-aligned nulls/errors | Batch fn not keyed-order | Map results back to `ids` order |
| Auth only at gateway; field leaks | Missing resolver checks | Field/type authz; test nested selections |
| Huge payloads / timeouts | Unbounded lists | Cursor pagination + max page size |
| Depth/cost rejects valid ops | Estimator counts fragments/nesting aggressively | Tune limits; align with planner/fragments (esp. federation) |
| Breaking client after deploy | Removed/renamed fields | Additive evolution + `@deprecated` |
| Internal stack traces to clients | Unmasked errors in prod | Error masking; log server-side with operation name |

---

## Best Practices

1. Require operation names in production traffic for supportability.
2. Colocate input validation with mutation args; return typed user errors where the schema supports them.
3. Prefer opaque IDs in public graphs when enumeration is a risk.
4. Subscriptions: auth on connection init; send minimal payloads.
5. Federation/subgraph graphs: ownership and composition checks in CI; do not assume planner query shape is stable forever when setting subgraph cost limits.
6. Pair list resolvers with `@prisma` `select`/`take`—GraphQL does not magically limit SQL.

---

## Limitations

- File uploads and subscriptions need transport-specific setup (multipart, WS/SSE).
- Federated graphs add ownership, composition, and auth directive complexity.
- CDN caching differs from REST—persisted queries / APQ strategies are deliberate choices (APQ ≠ safelist).
- Depth/complexity heuristics are approximate; measure real resolver cost with tracing.

---

## Related Skills

- `@express` / `@nodejs` / `@nextjs` — HTTP hosts for GraphQL servers
- `@prisma` — typed DB access behind resolvers
- `@postgresql` — database performance and indexes under resolver load
- `@typescript` — resolver/context typing and codegen
- `@docker` — local API + DB compose stacks

---

## Agent Operational Directive

> **MANDATORY**: Authz on sensitive resolvers. Per-request DataLoaders with key-ordered batches. Paginate and cost-limit public graphs. Evolve schemas additively. Never invent credentials or ship unrestricted public introspection without an explicit threat model.

---

## Source anchors (research)

- [WunderGraph: GraphQL N+1 and DataLoader rules](https://wundergraph.com/blog/graphql-n-plus-1-problem)
- [Apollo GraphOS: authorization in the router](https://www.apollographql.com/docs/graphos/routing/security/authorization)
- [Apollo Router: persisted queries vs APQ](https://www.apollographql.com/docs/router/configuration/persisted-queries)
- [Apollo Router issue: depth/cost vs generated fragments](https://github.com/apollographql/router/issues/7203)
