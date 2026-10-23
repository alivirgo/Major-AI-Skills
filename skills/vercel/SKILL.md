---
name: vercel
description: "Configure Vercel projects with scoped env vars, preview vs production deploys, Node/framework build settings, and log-driven failure triage—avoid NEXT_PUBLIC_ secret leaks and runtime mismatches."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["vercel", "nextjs", "deploy", "edge", "preview", "environment-variables", "serverless"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Vercel Deployment AI Skill Guide (Claude)

## Overview & Engine Architecture

Vercel turns Git pushes into **immutable deployments**. **Preview** covers non-production branches/PRs; **Production** tracks the production branch (or `vercel --prod`). Builds produce static assets, **Node serverless** functions, and optional **Middleware**—not long-lived custom servers. Agents keep secrets in **Project Environment** scopes (Development / Preview / Production), treat `NEXT_PUBLIC_*` as **browser-exposed**, pin Node versions, and debug from **Build Logs** (first real error, not the final `exited with 1`).

```
┌─────────────────────────────────────────────────────────────┐
│                 Vercel git → deploy loop                      │
│                                                             │
│  Git push / vercel CLI                                      │
│  ├── First deploy of a new project → Production env         │
│  ├── Later: prod branch / --prod → Production               │
│  └── Other branches / vercel → Preview                      │
│                                                             │
│  Build                                                      │
│  ├── Install + framework build (Next.js preset common)      │
│  ├── Env inlined at build for NEXT_PUBLIC_*                 │
│  └── Fail → read Build Logs (root cause above final line)   │
│                                                             │
│  Runtime                                                    │
│  ├── Static / Serverless Node / Middleware                  │
│  └── Domains ← successful Production deployment             │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Deploying Next.js or compatible frontends to Vercel; configuring env scopes and regions.
- Debugging failed builds, missing prod env, or preview/prod drift.
- Setting up preview URLs for PR review and promotion discipline.

**Do not use when**

- You need multi-node Kubernetes scheduling or stateful cluster workloads → `@kubernetes`.
- Long-running background workers / queues are the core need → external workers, not request functions.
- Someone asks to commit production secrets, put private keys in `NEXT_PUBLIC_*`, or invent Vercel tokens → refuse.

---

## Operational Capabilities & Agent Directives

1. **Secrets only in Vercel env** (or linked secret store)—never in git. Scope Production / Preview / Development correctly.
2. **`NEXT_PUBLIC_*` is public** (build-time inlined for Next.js)—no API secrets, DB URLs with passwords, or private keys.
3. **Preview vs Production values differ**; branch-specific Preview overrides apply. Mirror required keys across scopes so previews do not crash.
4. **First deployment** of a new project is always treated as Production (even without `--prod`) and uses Production env—plan env accordingly.
5. **Pin Node** via `engines` / Project settings to match local and CI.
6. Prefer framework presets; override install/build/output only when monorepo roots require it (`Root Directory`, ignored build step carefully).
7. **Edge Runtime**: Vercel recommends migrating toward Node for many cases; Next.js 16.3+ drops `runtime = 'edge'` support—verify framework version before prescribing Edge.
8. **Diagnose builds** from Deployment → Build Logs; fix the first substantive error, not only the last exit line. Reproduce `npm run build` locally first.
9. Protect production with Git branch protection + required checks; prefer promote/preview workflow over hot-editing prod.
10. Never invent `VERCEL_TOKEN` or team IDs; use `vercel link` / dashboard / CI OIDC patterns the user already has.

---

## Production Example: scoped env + safe Next headers

`vercel.json` (optional overrides—prefer dashboard/framework defaults when enough):

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

`package.json` engines pin:

```json
{
  "engines": { "node": "20.x" }
}
```

Env helper (server-only—fail closed):

```typescript
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

// Server route / server component only:
const databaseUrl = requireEnv("DATABASE_URL");
// Browser-safe example only:
const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL; // must be non-secret
```

CLI loop:

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local          # Development scope
vercel build                        # local parity when available
vercel                              # Preview
vercel --prod                       # Production (explicit)
vercel logs <deployment-url>
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Runtime crash only on Production | Missing Production env var | Add/mirror Production scope; redeploy |
| Preview works, prod wrong public URL | `NEXT_PUBLIC_*` baked at build | Set correct Production value; rebuild |
| First CLI deploy used prod secrets unexpectedly | New project first deploy = Production | Document; set Production env before first deploy |
| Build `exited with 1` | Type/lint/module error earlier in log | Scroll to first Error; reproduce locally |
| Edge / Middleware runtime error | Node API used on Edge; or Edge deprecated on Next version | Move to Node runtime; check Next version docs |
| Monorepo app not found | Wrong Root Directory | Set project root / turbo filter |
| Stale output after dependency bump | Cache oddity | Redeploy without cache |
| Absolute localhost links in preview | Hardcoded local URLs | Relative URLs or env-based base (`VERCEL_URL` careful with scheme) |

---

## Best Practices

1. Use Preview deployments for QA; gate production with reviews.
2. Document monorepo `Root Directory` and install command in README.
3. Watch function duration, payload size, and Core Web Vitals after launch.
4. Keep `vercel.json` redirects/headers reviewed in PR like app code.
5. Pair smoke tests on preview URLs with `@playwright-ci`.
6. Prefer App Router server-side reads for secret env over public inlining.

---

## Limitations

- Request functions are not general-purpose daemons; use queues/workers elsewhere.
- Plan limits (regions, concurrency, timeouts) differ Hobby vs Pro.
- Arbitrary long-lived Express servers are not the Vercel model.
- Stop and ask if project link, env values, or domain DNS ownership are unclear.

---

## Related Skills

- `@nextjs` — App Router apps Vercel deploys well
- `@nodejs` — serverless function runtime constraints
- `@playwright-ci` — smoke-testing preview deployments
- `@github-actions` — CI that gates merges before production promote
- `@cloudflare-dns` — DNS for custom domains when not using Vercel nameservers alone

---

## Agent Operational Directive

> **MANDATORY**: Never put secrets in git or `NEXT_PUBLIC_*`. Scope env vars to Development/Preview/Production and remember the first deploy of a new project uses Production env. Debug builds from the first real error in Build Logs. Do not invent Vercel tokens or prescribe Edge without checking the Next.js version.

---

## Source anchors (research)

- [Environment variables & scopes](https://vercel.com/docs/environment-variables)
- [Deployments & environments (first deploy = Production)](https://vercel.com/docs/deployments/environments)
- [Troubleshoot a build](https://vercel.com/docs/deployments/troubleshoot-a-build)
- [Edge Runtime notes / migration](https://vercel.com/docs/functions/runtimes/edge)
- [Next.js environment variables](https://nextjs.org/docs/pages/guides/environment-variables)
