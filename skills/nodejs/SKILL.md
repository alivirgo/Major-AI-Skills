---
name: nodejs
description: "Build Node.js services with ESM/CJS clarity, non-blocking I/O, streams, webhook raw-body handling, graceful shutdown, and pinned engines. Use for HTTP servers, Stripe webhooks on Express/Fastify, and CLI tooling."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["nodejs", "javascript", "esm", "streams", "webhooks", "runtime", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Node.js Runtime AI Skill Guide (Claude)

## Overview & Engine Architecture

Node.js runs JavaScript on a **single-threaded event loop** with libuv thread pool for I/O. **Worker threads** and **child processes** handle CPU-bound work. Agents pin **engines**, choose **ESM vs CJS** deliberately, and never block the loop on sync filesystem or heavy JSON on hot paths.

Claude operates as a Principal Node Engineer: **raw webhook bodies**, **AbortController timeouts**, **structured logging**, and **process lifecycle**.

```
HTTP / CLI entry
      │
  event loop (timers, I/O, microtasks)
      │
  worker_threads / child_process (CPU)
```

---

## When to use / when not to

**Use when**

- Lightweight HTTP APIs, webhooks, and integration glue.
- Streaming uploads/downloads without loading full bodies into RAM.
- Tooling and build scripts in the same repo as frontend.

**Do not use when**

- CPU-heavy batch jobs should run in Python/Rust workers or a queue—not the API process.
- Team has standardized on Bun/Deno—verify API compatibility per runtime.

---

## Operational Capabilities & Agent Directives

1. Prefer `node:` built-ins (`node:fs/promises`, `node:http`, native `fetch`).
2. Set `"type": "module"` or explicit `.mjs`/`.cjs`—don't mix default imports blindly.
3. **Webhook routes**: Register **raw body parser before** `express.json()` for Stripe path only.
4. Handle `unhandledRejection` / `uncaughtException` with logging + controlled shutdown in production.
5. **Streams** for large payloads; backpressure awareness.
6. Pin `"engines": { "node": ">=20" }` and match CI.
7. **Idempotency** for payment webhooks at DB layer—see `@stripe`.

---

## Minimal ESM HTTP server

```js
import http from "node:http";

const port = Number(process.env.PORT ?? 3000);

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(port, () => console.log(`listening on ${port}`));
```

Express Stripe webhook ordering:

```js
app.post("/webhooks/stripe", express.raw({ type: "application/json" }), handler);
app.use(express.json()); // after webhook route
```

---

## Technical Troubleshooting Matrix

| Pitfall | Why it hurts | Fix |
| --- | --- | --- |
| Sync `fs.readFileSync` in handler | Event loop stall | Async + streams |
| JSON parser before Stripe verify | Signature failure | Raw route first |
| Missing `await` | Silent failures | Lint; global rejection handler |
| Memory spike | Buffer entire upload | Stream to disk/S3 |
| Version skew | Native API differences | Pin engines in CI |

---

## Best practices

- Validate env at boot (zod/envalid).
- Structured JSON logs + request IDs.
- `AbortController` for fetch timeouts.
- Graceful shutdown: stop accepting, drain connections, exit.

---

## Limitations

- Single-threaded JS—not for heavy parallel CPU without workers.
- Native addons complicate cross-platform CI.
- Bun/Deno APIs differ—don't assume Node-only snippets run everywhere.

---

## Related skills

- `@express` — middleware ordering for webhooks
- `@stripe` — constructEvent on Buffer
- `@typescript` — typed Node services
- `@docker` — container NODE_ENV and signals

---

## Agent Operational Directive

> **MANDATORY**: For signed webhooks, preserve exact raw body bytes through verification. Register body parsers so they cannot mutate webhook routes. Pin Node version in `engines` and CI. Never commit secrets.

---

## Sources

- [Node.js docs](https://nodejs.org/docs/latest/api/)
- [Stripe signature verification (Node)](https://docs.stripe.com/webhooks/signature?lang=node)
