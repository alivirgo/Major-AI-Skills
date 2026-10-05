---
name: nextjs
description: "Build Next.js App Router apps with explicit server/client boundaries, caching (fetch, revalidate, Cache Components), Route Handlers, and pages-router migration pitfalls. Use for SSR, RSC, deployment prep, and Next 15–16 cache model changes."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["nextjs", "react", "app-router", "server-components", "caching", "route-handlers", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Next.js App Router AI Skill Guide (Claude)

## Overview & Engine Architecture

Next.js **App Router** (`app/`) uses file-based routes, **React Server Components (RSC)** by default, and **Client Components** only where browser interactivity is required. Data fetching on the server participates in a **caching model** that changed materially in Next.js 15–16: implicit static-by-default gave way to **dynamic-by-default** when **Cache Components** (`cacheComponents: true`, formerly `experimental.dynamicIO`) is enabled—opt-in caching via `"use cache"`, `cacheLife`, and `cacheTag`.

Claude operates as a Principal Full-Stack Architect: **server/client boundary**, **secrets isolation**, **Route Handlers vs pages/api**, **Suspense for dynamic segments**, and **webhook raw-body routes**.

```
app/
  layout.tsx          (Server Component default)
  page.tsx
  loading.tsx / error.tsx
  (route)/page.tsx    (dynamic segments)
  api/.../route.ts    (Route Handlers)
components/
  *.tsx + "use client" only when needed
```

**Pages Router (`pages/`)** still exists in brownfield apps—do not mix routing models in one tree without a deliberate migration plan.

---

## When to use / when not to

**Use when**

- Greenfield React apps needing SSR, streaming, and colocated data fetching.
- Refactoring `"use client"` sprawl and leaking server imports.
- Designing cache/revalidation contracts for product-facing freshness.

**Do not use when**

- The team requires only static export with zero server runtime (verify `output: 'export'` constraints).
- A simple SPA behind a separate BFF suffices and RSC complexity adds no value.

---

## Operational Capabilities & Agent Directives

1. **Default Server Components**; add `"use client"` only for state, effects, browser APIs, or event handlers.
2. **Secrets**: Never in `NEXT_PUBLIC_*` or modules imported by client components. Use `server-only` package on server modules.
3. **App vs Pages gotchas**:
   - `getServerSideProps` / `getStaticProps` → async Server Components or `"use cache"` helpers.
   - `_app.tsx` providers → client `providers.tsx` imported from root `layout.tsx`.
   - `pages/api/*` → `app/**/route.ts` with different body parsing rules.
4. **Dynamic APIs** (`cookies()`, `headers()`, `params`, `searchParams`) make routes dynamic—wrap in `<Suspense>` when using Cache Components or expect build/runtime validation errors.
5. **Do not** call `Date.now()`, `Math.random()`, or `crypto.randomUUID()` in prerendered Server Components—move to request-time Suspense or client.
6. **Route Handlers for webhooks**: Use raw body (`request.text()` / `arrayBuffer()`) before JSON parse—see `@stripe`.
7. **Confirm Next version** before recommending `dynamic`, `revalidate`, `fetchCache`—many are removed or error under Cache Components.

---

## Minimal patterns

Server page + client island:

```tsx
// app/items/page.tsx
import { Counter } from "@/components/counter";

export default async function ItemsPage() {
  const res = await fetch(`${process.env.API_URL}/items`, {
    next: { revalidate: 60 }, // verify against project's Next major
  });
  const data = await res.json();
  return (
    <main>
      <h1>Items ({data.length})</h1>
      <Counter />
    </main>
  );
}
```

Webhook Route Handler (raw body):

```ts
// app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const rawBody = await request.text();
  // verify signature on rawBody, then JSON.parse for logging only
}
```

---

## App Router vs Pages — migration traps

| Pages pattern | App Router equivalent | Gotcha |
| --- | --- | --- |
| `pages/index.tsx` | `app/page.tsx` | No default `_document` |
| `pages/api/x.ts` | `app/api/x/route.ts` | Export `GET`/`POST` functions |
| `useRouter()` from `next/router` | `next/navigation` | Different API |
| `_app` global CSS | `app/layout.tsx` | Metadata API replaces `Head` |
| `getStaticPaths` | `generateStaticParams` | Async in Server Components |
| Middleware `req.cookies` | `cookies()` in RSC | Dynamic boundary |

---

## Technical Troubleshooting Matrix

| Issue | Root cause | Fix |
| :--- | :--- | :--- |
| **Secret leaked to client bundle** | Server module imported by `"use client"` | Split modules; `server-only` |
| **Webhook signature fails** | `express.json()`-style parse before verify | Raw body route; parse after verify |
| **Stale data** | Aggressive caching / missing revalidate | Explicit `revalidate` or `"use cache"` + `cacheLife` |
| **Build error: missing Suspense** | Dynamic API in static shell (Cache Components) | Suspense boundary or `"use cache"` scope |
| **`cookies()` in cached function** | Illegal under Cache Components | Pass values as args into cached helper |
| **Hydration mismatch** | Server/client render diff | Fix conditional rendering; avoid random in RSC |

---

## Best practices

- Colocate `loading.tsx` / `error.tsx` per route segment.
- Metadata API for SEO per route.
- `next/image` with explicit dimensions.
- Pin Node version to host (Vercel, Docker, etc.).
- For Next 16+: read [Cache Components migration](https://nextjs.org/docs/app/building-your-application/upgrading/caching) before enabling `cacheComponents`.

---

## Limitations

- Caching semantics differ by host (serverless vs long-lived Node).
- Server Actions require CSRF/origin awareness and server-side authz.
- `"use cache"` default storage is in-memory per instance—use remote cache for cross-deploy persistence when needed.

---

## Related skills

- `@react` — hooks, effects, composition
- `@typescript` — typing server props and loaders
- `@stripe` — payment webhooks in Route Handlers
- `@supabase` — SSR auth cookie patterns
- `@vercel` — deployment-specific caching

---

## Agent Operational Directive

> **MANDATORY**: Keep secrets and DB clients on the server only. For webhooks, verify signatures on the raw body. Before changing caching flags, confirm the project's Next.js major version and whether Cache Components is enabled. Prefer explicit cache boundaries over implicit assumptions from older App Router tutorials.

---

## Sources

- [Next.js 16 / Cache Components](https://nextjs.org/blog/next-16)
- [Migrating to Cache Components](https://nextjs.org/docs/app/building-your-application/upgrading/caching)
- GitHub: [next-prerender-missing-suspense / dynamicIO](https://github.com/vercel/next.js/issues/80582)
