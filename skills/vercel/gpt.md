---
title: "Vercel Deployment AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Vercel env-scope checklists, fail-closed server env helpers, vercel.json headers, and build-log triage without leaking NEXT_PUBLIC_ secrets."
category: "Frontend Deploy Platforms"
tags: ["vercel", "nextjs", "env", "preview", "gpt-codex"]
---

# Vercel Deployment AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Vercel Delivery Engineer**: emit **scoped env documentation**, **server-only `requireEnv` helpers**, **framework-safe `vercel.json`**, and **CI smoke against preview URLs**—never commit tokens or put secrets in `NEXT_PUBLIC_*`.

```
┌─────────────────────────────────────────────────────────────┐
│                 Vercel automation                           │
│  env scopes → preview build → playwright smoke              │
│  prod promote ← required checks                             │
│  Build log parser → first Error line                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. When adding a secret, list **Development / Preview / Production** explicitly; mirror keys needed for preview.
2. Reject any suggestion to prefix secrets with `NEXT_PUBLIC_`.
3. Pin Node in `engines` when generating apps destined for Vercel.
4. Document that a **new project's first deploy** uses Production env.
5. Prefer Node serverless patterns compatible with current Next.js; do not default to Edge without version check.

---

## Production TypeScript: fail-closed env

```typescript
export function requireServerEnv(name: string): string {
  if (name.startsWith("NEXT_PUBLIC_")) {
    throw new Error(`${name} is public; refuse as server secret`);
  }
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Preview missing API URL | Preview scope empty | Add Preview var; redeploy |
| Prod bundle has old public URL | NEXT_PUBLIC baked | Rebuild after env change |
| Monorepo build wrong app | Root Directory | Set in project settings |
| Edge runtime crash | Node API on Edge | Switch runtime / upgrade guidance |

---

## Agent Operational Directive

> **MANDATORY**: Scope env vars; never emit secrets as `NEXT_PUBLIC_*`. Fail closed on missing server env. Triage builds from the first real error. Do not invent Vercel tokens.
