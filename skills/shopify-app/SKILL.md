---
name: shopify-app
description: "Ship Shopify apps with session-token auth, HMAC-verified webhooks, cost-aware Admin GraphQL, least-privilege scopes, and uninstall-safe token lifecycle—patterns agents routinely get wrong."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["shopify", "app", "graphql", "webhooks", "oauth", "session-tokens", "billing", "hmac"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Shopify App Development AI Skill Guide (Claude)

## Overview & Engine Architecture

Shopify apps extend merchant admin and storefronts. **Embedded apps** authenticate with **session tokens** (App Bridge); backends call **Admin GraphQL** with shop-scoped **offline access tokens** (`X-Shopify-Access-Token`). Shopify pushes events over **webhooks** that must be HMAC-verified on the **raw body**. Agents treat shop query params as untrusted until token/HMAC validation succeeds, pin Admin API versions, budget GraphQL **query cost**, and purge tokens on `app/uninstalled`.

```
┌─────────────────────────────────────────────────────────────┐
│                 Shopify app request paths                     │
│                                                             │
│  Merchant Admin (embedded)                                  │
│  ├── App Bridge → session token (JWT)                       │
│  └── Your backend validates token → shop session record     │
│                                                             │
│  Admin GraphQL                                              │
│  ├── Header: X-Shopify-Access-Token (offline/online)        │
│  ├── Cost leaky bucket (extensions.cost.throttleStatus)     │
│  └── Pin API version; least-privilege scopes                │
│                                                             │
│  Webhooks (HTTPS / PubSub / EventBridge)                    │
│  ├── Verify X-Shopify-Hmac-SHA256 on raw body               │
│  ├── Dedupe X-Shopify-Webhook-Id; 200 fast → async work     │
│  └── app/uninstalled → delete tokens + scheduled jobs       │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Scaffolding public, custom, or embedded Shopify apps (CLI + `shopify.app.toml`).
- Implementing OAuth / session-token auth, webhook handlers, Admin GraphQL, or app billing.
- Hardening HMAC verification, scope minimization, and uninstall cleanup.

**Do not use when**

- The merchant only needs a no-code automation → `@zapier` (or Shopify Flow).
- You only need a generic GraphQL client tutorial with no Shopify auth → `@graphql-client`.
- Someone asks to trust `?shop=` without session/HMAC validation, bake API secrets into the storefront, or invent Partner Dashboard credentials → refuse.

---

## Operational Capabilities & Agent Directives

1. **Prefer official templates / `@shopify/shopify-app-*` libraries** for OAuth, session tokens, and webhook validation—hand-rolled auth is the usual breach path.
2. **Validate session / ID tokens fully**: signature, expiry, audience, destination; never trust client-reported `shop` alone. Anchor shop-domain regex at both ends (block `shop.myshopify.com.attacker.net`).
3. **Webhook HMAC on raw body** before JSON parse; reject mismatches with 401. Prefer `crypto.timingSafeEqual` on decoded digests. Admin-created webhook subscriptions often fail HMAC—subscribe via app config / Admin API with the app secret.
4. **Idempotent webhooks**: persist `X-Shopify-Webhook-Id`; respond 200 quickly; heavy work async. Treat topic/shop headers as untrusted until HMAC verifies.
5. **Least-privilege scopes**; document why each exists. Protected customer data needs Partner Dashboard approval for public apps.
6. **Pin Admin API version**; watch deprecation timelines. Prefer GraphQL over legacy REST for new work.
7. **Budget GraphQL cost**: read `extensions.cost.throttleStatus`; backoff when `currentlyAvailable` is low; use bulk operations for large exports. Single query max ~1000 cost points.
8. **Expiring offline tokens**: public apps should use expiring offline tokens + secure refresh-token storage (non-expiring offline rejected for GraphQL Admin starting 2027 per Shopify guidance).
9. **Uninstall path**: handle `app/uninstalled`—delete access/refresh tokens, cancel jobs, stop webhook side effects.
10. **Never invent** API keys, client secrets, or shop access tokens; use env / secret stores (`SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, session storage).

---

## Production Example: webhook HMAC + Admin GraphQL with cost awareness

Webhook route (raw body first):

```javascript
import crypto from "node:crypto";
import express from "express";

const app = express();
const secret = process.env.SHOPIFY_API_SECRET; // from env — never hardcode

// Capture raw body only for webhooks; do not use express.json() before this route
app.post(
  "/webhooks",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const hmacHeader = req.get("x-shopify-hmac-sha256") || "";
    const digest = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("base64");
    const a = Buffer.from(digest, "base64");
    const b = Buffer.from(hmacHeader, "base64");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).send("invalid hmac");
    }

    const deliveryId = req.get("x-shopify-webhook-id");
    const topic = req.get("x-shopify-topic");
    const shop = req.get("x-shopify-shop-domain");
    // await dedupeInsert(deliveryId); if duplicate → 200 and return
    // enqueueAsync({ shop, topic, body: JSON.parse(req.body.toString("utf8")) })
    res.status(200).send("ok");
  }
);
```

Admin GraphQL call (token from server-side session store):

```javascript
async function adminGraphql(shop, accessToken, query, variables = {}) {
  const version = process.env.SHOPIFY_API_VERSION || "2025-10";
  const res = await fetch(
    `https://${shop}/admin/api/${version}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  const json = await res.json();
  const throttle = json?.extensions?.cost?.throttleStatus;
  if (throttle && throttle.currentlyAvailable < 50) {
    // backoff / queue before next expensive query
  }
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const ORDERS = `
  query Orders($cursor: String) {
    orders(first: 50, after: $cursor) {
      edges { cursor node { id name displayFulfillmentStatus } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;
```

Validation loop:

```bash
shopify app info
shopify app deploy --help   # review before releasing toml/webhooks
# Trigger test webhook via CLI or admin event; confirm 401 without secret, 200 with
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Webhook HMAC always fails | Body parsed (`express.json`) before verify; wrong secret; admin-UI subscription | Use `express.raw`; app secret from Partners; subscribe via `shopify.app.toml` / API |
| `401` / invalid session token | Clock skew, wrong audience, trusting `shop` param | Validate full JWT claims; sync NTP; use official auth helpers |
| GraphQL `THROTTLED` / low `currentlyAvailable` | Query too costly or bursty | Smaller `first`, fewer nested connections; respect restore rate; bulk ops |
| Field access denied despite scope | Protected customer data / staff online-token limits | Complete PCD approval; use offline token for background jobs |
| Works in tunnel, fails in prod | Callback / redirect URL mismatch | Exact redirect allowlist; no wildcards or prefix matching |
| Data after uninstall | Missing `app/uninstalled` cleanup | Delete tokens, cancel billing/jobs, stop processing |
| Billing charge declined | Test vs live charge flow | Handle declined/pending; use test stores for billing QA |
| Theme/checkout extension blocked | Plan / surface limits | Check Plus/checkout extensibility constraints before promising UX |

---

## Best Practices

1. Declare app-specific webhooks (including mandatory compliance topics for App Store apps) in `shopify.app.toml`.
2. Encrypt access/refresh tokens at rest; rotate client secret with HMAC cutover awareness (~1h).
3. Log `shop` + `topic` + delivery id—not full PII payloads.
4. Paginate with cursors; never assume a single page of orders/products.
5. Use Shopify CLI `app dev` tunneling for local embedded testing; keep prod URLs in Partner config in sync.
6. Separate staging app + development store from production listings.

---

## Limitations

- Rate limits are **per app × shop** and **cost-based**; REST intuition does not apply.
- Plus-only and checkout surfaces are unavailable on standard plans.
- Pub/Sub and EventBridge deliveries do not use HMAC the same way as HTTPS—follow delivery-method docs.
- Stop and ask if Partner app credentials, redirect URLs, or required scopes are missing—do not invent them.

---

## Related Skills

- `@graphql-client` — generic GraphQL client patterns for Admin/Storefront
- `@nodejs` — webhook HTTP servers and raw-body middleware order
- `@zapier` — lightweight merchant automations without a full app
- `@github-actions` — CI for app build/test before Partner deploy

---

## Agent Operational Directive

> **MANDATORY**: Never trust `shop` query params or webhook headers until session-token or HMAC verification succeeds on the raw body. Use least-privilege scopes, pin API versions, handle GraphQL cost throttling, and delete tokens on uninstall. Never hardcode or invent `SHOPIFY_API_SECRET` / access tokens.

---

## Source anchors (research)

- [About app authentication](https://shopify.dev/docs/apps/build/authentication-authorization)
- [Security best practices (expiring offline tokens, HMAC)](https://shopify.dev/docs/apps/build/security/following-security-best-practices)
- [Verify webhook deliveries](https://shopify.dev/docs/apps/build/webhooks/verify-deliveries)
- [GraphQL Admin API rate limits](https://shopify.dev/docs/apps/build/apis/graphql-admin/rate-limits)
- [Manage webhook subscriptions](https://shopify.dev/docs/apps/build/webhooks/subscribe)
