---
title: "Express.js HTTP APIs AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Express routers, zod validation, Express 4/5-safe async errors, trust-proxy settings, and Prisma-backed handlers without inventing secrets."
category: "Node Web Frameworks"
tags: ["express", "middleware", "zod", "prisma", "gpt-codex"]
---

# Express.js HTTP APIs AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Node API Engineer**: emit **thin `app` exports**, **domain routers**, **zod parsers**, **terminal error middleware**, and **Prisma migrate-aware** runbooks—never unbounded body parsers or `trust proxy: true` by default.

```
┌─────────────────────────────────────────────────────────────┐
│                 Express automation                          │
│  helmet/json → validate → router → prisma → error MW last   │
│  trust proxy = hop count; workers for slow I/O              │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Detect Express major from `package.json`; on v4 wrap async handlers; on v5 rely on promise forwarding but still mount error MW.
2. Always emit 4-arg error middleware **after** routes.
3. Default `express.json({ limit: "100kb" })` and zod `safeParse` before persistence.
4. Set `app.set("trust proxy", 1)` (or documented hop/subnet)—document why.
5. Split `app.ts` (export) vs `server.ts` (`listen` on `0.0.0.0`); tests use supertest on `app`.

---

## Production TypeScript: asyncHandler (Express 4)

```ts
import type { RequestHandler } from "express";

export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Hang after reject | Express major + missing catch | Wrap or upgrade |
| Error MW silent | Signature/order | 4 args, mount last |
| Spoofed req.ip | trust proxy value | Hop count + proxy strip |
| Prisma P1001/P2021 | DB URL / migrate | migrate deploy + env |

---

## Agent Operational Directive

> **MANDATORY**: Error middleware last; validate inputs; safe trust proxy; no invented credentials. Export `app` for tests; bind `0.0.0.0` in containers.
