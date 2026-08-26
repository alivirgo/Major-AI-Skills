---
name: graphql-client
description: "Operational skill for GraphQL clients: Apollo Client and urql patterns for queries, mutations, cache, error policies, and auth headers."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["graphql", "apollo", "urql", "client", "cache", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# GraphQL Client (Apollo / urql) AI Skill Guide

## Overview & Engine Architecture

GraphQL clients (Apollo Client, urql) send typed operations to a GraphQL HTTP (or WS) endpoint, normalize/cache results, and integrate with UI frameworks. Agents write precise operations (no accidental over-fetch), configure auth links/exchanges, pick sane cache policies, and handle partial errors (`errors` + `data`) explicitly.

```
UI hooks/components
   -> Apollo Client / urql client
       -> links/exchanges (auth, retry, HTTP, WS)
           -> GraphQL API
Cache (normalized / document) <- results
```

## When to use this skill

- Wiring React/Vue apps to a GraphQL API
- Choosing Apollo vs urql trade-offs for a codebase
- Fixing cache staleness after mutations
- Adding auth headers and upload/retry behavior

## Operational directives

1. Co-locate operations with features; avoid one mega-`queries.ts` dumping ground.
2. Request only fields the UI needs; update when UI changes.
3. After mutations, update cache (Apollo `update`/`cache.modify` or urql cache exchanges) or invalidate deliberately.
4. Put tokens in headers via links/exchanges - never in query variables logged server-side by mistake.
5. Decide error policy: many apps must handle GraphQL errors even when HTTP is 200.

## Apollo sketch

```ts
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network", errorPolicy: "all" },
  },
});
```

## urql sketch

```ts
const client = createClient({
  url: "/graphql",
  exchanges: [cacheExchange, authExchange, fetchExchange],
  fetchOptions: () => ({
    headers: { Authorization: `Bearer ${getToken()}` },
  }),
});
```

## Cache pitfalls

| Pitfall | Result | Fix |
| --- | --- | --- |
| Mutation returns partial object without `id` | Cache cannot merge | Return `id` + changed fields; type policies |
| `no-cache` everywhere | Slow UI, extra load | Use network-only only where required |
| Ignoring `errors` array | Silent failed mutations | Surface GraphQL errors to users/logs |
| Huge fragments reused blindly | Over-fetch | Split fragments per view |

## Best practices

- Prefer codegen (`graphql-codegen`) for typed documents when the schema is stable.
- Use persisted queries or GET allowlists only when the server supports them safely.
- Subscriptions: authenticate WS connections; reconnect with backoff.
- For schema exploration hygiene, pair with `@graphql-introspection-trimmer` on public schemas.

## Limitations

- Server schema design (N+1, authz) cannot be fixed solely in the client.
- Normalized cache edge cases differ between Apollo and urql - test mutation UX.
- Relay-style clients use different conventions not covered here.

## Related skills

- `@shopify-app` - Admin GraphQL usage in Shopify apps
- `@postman` - ad-hoc GraphQL operation debugging
- `@react` - UI integration patterns
