---
name: express
description: "Ship Express.js APIs with ordered middleware, Express 5 async errors, zod validation, safe trust proxy, and Prisma/Postgres workers agents routinely misconfigure."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["express", "nodejs", "middleware", "http", "zod", "prisma", "trust-proxy"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Express.js HTTP APIs AI Skill Guide (Claude)

## Overview & Engine Architecture

Express is a minimal **Node HTTP framework** of **middleware chains** and **routers**. Requests flow top-to-bottom; handlers must end the cycle or call `next()`. **Express 5** forwards rejected promises from `async` handlers to error middleware automatically; **Express 4** needs an async wrapper or explicit `.catch(next)`. Agents validate input (zod/joi), mount **4-arg error middleware last**, set **`trust proxy` to hop count—not `true`**, and keep persistence in `@prisma` / `@postgresql` with workers for slow jobs (`@redis` queues).

```
┌─────────────────────────────────────────────────────────────┐
│                 Express middleware pipeline                   │
│                                                             │
│  Client → reverse proxy / LB (@nginx)                       │
│       → Node process (PM2 / systemd / container)            │
│       → helmet / cors / logger                              │
│       → express.json({ limit })                             │
│       → auth / rate-limit (uses req.ip ← trust proxy)       │
│       → Router("/api/…") → async handler                    │
│            ├── validate (zod) → service → @prisma           │
│            └── next(err) → error middleware → JSON          │
│                                                             │
│  Side paths: BullMQ/worker processes → @redis               │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Building REST/JSON APIs on Node with routers and middleware.
- Fixing hanging requests, misplaced error handlers, or spoofable `req.ip`.
- Wiring validation + Prisma/Postgres behind Express.

**Do not use when**

- The surface is GraphQL-first with its own server stack → `@graphql-apis` (may still mount on Express).
- You only need runtime/process hygiene with no HTTP framework → `@nodejs`.
- Someone asks to set `trust proxy` to `true` without a stripping edge proxy → refuse; use hop count / subnet.

---

## Operational Capabilities & Agent Directives

1. **Know the major**: Express 5 auto-forwards async rejections; Express 4 requires wrap/`catch(next)` or requests hang/crash.
2. **Middleware order**: parsers → auth → routers → **4-arg** `(err, req, res, next)` last. Missing 4th arg = not an error handler.
3. **Body limits**: `express.json({ limit: "100kb" })` (tune per upload path); never unbounded JSON parse on public routes.
4. **Validate before business logic**: zod/joi on `req.body` / `params` / `query`; return 400 with stable error shape.
5. **`trust proxy`**: prefer `app.set("trust proxy", 1)` (or subnet list) behind one LB; never blind `true` unless the edge strips client-supplied `X-Forwarded-*`.
6. **Export `app` for tests** (supertest); call `listen` only from `server.js` / bin entry.
7. **Workers**: email, webhooks, fan-out → BullMQ/Agenda with `@redis`; do not block the event loop on multi-second I/O.

---

## Production Example: typed router + zod + error handler

`src/app.ts` (Express 5-friendly; works on 4 with asyncHandler):

```ts
import express from "express";
import helmet from "helmet";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const app = express();

app.set("trust proxy", 1); // one reverse-proxy hop
app.use(helmet());
app.use(express.json({ limit: "100kb" }));

const createItem = z.object({
  sku: z.string().min(1).max(64),
  qty: z.number().int().min(0),
});

const items = express.Router();

items.get("/", async (_req, res) => {
  const rows = await prisma.item.findMany({ take: 100 });
  res.json(rows);
});

items.post("/", async (req, res) => {
  const parsed = createItem.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_failed", details: parsed.error.flatten() });
    return;
  }
  const row = await prisma.item.create({ data: parsed.data });
  res.status(201).json(row);
});

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/items", items);

app.use((err: any, _req, res, _next) => {
  const status = typeof err.status === "number" ? err.status : 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "internal_error" : err.message });
});
```

`src/server.ts`:

```ts
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`listening on ${port}`);
});
```

Commands:

```bash
npm ci
npx prisma migrate deploy   # release step — pair @prisma @postgresql
NODE_ENV=production node dist/server.js
# tests: node --test / vitest + supertest(app)
```

Express 4 async helper (if not on Express 5):

```js
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Request hangs after async throw | Express 4 unhandled rejection | Upgrade to 5 or wrap with `catch(next)` |
| Error middleware never runs | Mounted before routes or 3-arg signature | Move last; use `(err, req, res, next)` |
| Rate limit / audit IP always same or spoofable | `trust proxy` false or `true` | Set hop count / trusted subnets; harden proxy headers |
| `PayloadTooLargeError` | Body over `limit` | Raise limit only on upload routes; reject elsewhere |
| CORS preflight fails | Missing options handler / wrong origin | Configure `cors` with explicit origins in prod |
| Prisma client errors on cold start | Migrate not deployed / wrong `DATABASE_URL` | `prisma migrate deploy`; verify env (`@prisma`) |
| Process dies on uncaughtException | Error escaped middleware | Fix handler; use process manager restart—do not “swallow” with uncaughtException listeners |

---

## Best Practices

1. Consistent JSON errors (`error`, optional `details`); never leak stack traces to clients in prod.
2. Helmet + explicit CORS allowlists; disable verbose error pages in production.
3. Prefer TypeScript with `@types/express` matching Express major (`@typescript`).
4. Graceful shutdown: stop accepting connections, await in-flight, `prisma.$disconnect()`.
5. Structure: `routes/` + `services/` + thin `app.ts`; keep secrets in env only.
6. Pair CI migrate/deploy with `@github-actions` and image builds with `@docker`.

---

## Limitations

- Express 4 vs 5 path/async semantics differ—pin and document the major in package.json.
- WebSockets need `ws` / Socket.IO alongside Express; not built-in.
- Express is not an opinionated app kit—authz, jobs, and ORM are deliberate choices (`@prisma`, `@redis`).
- Stop and ask if proxy hop topology or production DB URL source is unclear.

---

## Related Skills

- `@nodejs` — runtime, ESM, process managers, signals
- `@typescript` — typing Express handlers and zod schemas
- `@prisma` — migrations and type-safe queries behind routes
- `@postgresql` — indexes and connection limits under Node pools
- `@redis` — queues/cache for background work
- `@docker` — containerize Node + healthchecks

---

## Agent Operational Directive

> **MANDATORY**: Match Express 4 vs 5 error behavior. Mount 4-arg error middleware last. Validate all inputs. Set `trust proxy` to real hop/subnet—not blind `true`. Never invent `DATABASE_URL` or API keys. Offload slow work to workers; export `app` for tests and bind `0.0.0.0` in containers.

---

## Source anchors (research)

- [Express 5 error handling (async)](https://expressjs.com/en/5x/guide/error-handling/)
- [Express behind proxies / trust proxy](https://expressjs.com/en/5x/guide/behind-proxies/)
- [Production performance & reliability](https://expressjs.com/en/advanced/best-practice-performance/)
