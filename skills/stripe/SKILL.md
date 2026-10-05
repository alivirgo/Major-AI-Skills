---
name: stripe
description: "Integrate Stripe Checkout, PaymentIntents, Billing, and webhooks with signature verification on raw bodies, event.id idempotency, Idempotency-Key on POSTs, and test-mode safety. Use for payments, subscriptions, and fulfillment debugging."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["stripe", "payments", "webhooks", "subscriptions", "checkout", "idempotency", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Stripe Payments Integration AI Skill Guide (Claude)

## Overview & Engine Architecture

Stripe moves money via **PaymentIntents**, **Checkout Sessions**, and **Billing** objects. **Secret keys** stay server-side; browsers receive publishable keys and client secrets only as Stripe.js/Checkout requires. **Fulfillment authority** is the **signed webhook**, not the success redirect.

Claude operates as a Principal Payments Engineer: **raw-body signature verify**, **event.id deduplication**, **Idempotency-Key** on creates, and **test/live key separation**.

```
Client → Your API (secret key) → Stripe API
Stripe → POST webhook (signed) → Your API → DB fulfill (idempotent)
```

---

## When to use / when not to

**Use when**

- One-time Checkout or custom PaymentIntent flows.
- Subscriptions, Customer Portal, invoice events.
- Debugging test-mode with CLI `stripe listen`.

**Do not use when**

- Marketplace payouts need Connect onboarding—add Connect-specific flows.
- Legal/tax compliance is unresolved—Stripe Tax/legal review first.

---

## Operational Capabilities & Agent Directives

1. **Test mode until go-live**; separate `.env` files; never commit `sk_live_`.
2. **Verify `Stripe-Signature`** on every webhook with endpoint secret; reject on failure (400).
3. **Raw body only**—no JSON middleware reordering whitespace before verify.
4. **Idempotency**:
   - HTTP: `Idempotency-Key` header on critical POSTs to Stripe.
   - Webhooks: `INSERT event.id` with UNIQUE; duplicate → 200 no-op; handler error → 500 for retry.
5. **Fulfill on webhook**, not on `success_url` alone.
6. **AuthZ**: Map Stripe `customer` to your user via server session—customer ID ≠ logged-in proof.
7. **Amounts/prices** defined server-side (`price_` IDs)—never trust client-submitted amounts.

---

## Checkout Session (server)

```js
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [{ price: "price_123", quantity: 1 }],
  success_url: "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
  cancel_url: "https://example.com/cancel",
  customer: stripeCustomerId,
});
```

Webhook handler (conceptual):

```js
const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
if (await alreadyProcessed(event.id)) return res.sendStatus(200);
try {
  await fulfillInTransaction(event);
  await markProcessed(event.id);
} catch {
  return res.sendStatus(500); // Stripe retries
}
return res.sendStatus(200);
```

---

## Technical Troubleshooting Matrix

| Pitfall | Result | Fix |
| --- | --- | --- |
| Parsed JSON before verify | Invalid signature | Raw body route first |
| Fulfill on redirect only | Missing/fraudulent access | Webhook-driven state |
| No event.id store | Double ship/charge side effects | UNIQUE + txn |
| Wrong webhook secret | All events fail | Rotate per endpoint URL |
| Timestamp tolerance | Replay concerns | Use SDK default; reject old `t` |
| Mixed test/live keys | Catastrophic mischarge | Key prefix checks in CI |

---

## Best practices

- Order states: `pending` → `paid` → `fulfilled` with monotonic transitions.
- Log `event.type` + `event.id` only—no PAN data with proper Checkout/Elements.
- Use Customer Portal for self-serve plan changes when fit.
- Review Radar before high-risk launches.
- Stripe CLI: `stripe listen --forward-to localhost:3000/webhooks/stripe`

---

## Limitations

- Tax/VAT varies—Stripe Tax or external calculation.
- Connect/marketplaces need separate onboarding and payout logic.
- Account API version pinned—read changelog on upgrade.

---

## Related skills

- `@nextjs` / `@fastapi` / `@nodejs` — webhook route raw body
- `@postgresql` — transactional fulfillment + idempotency table
- `@playwright` — Checkout UI smoke in test mode
- `@n8n` / `@zapier` — never replace server verify with no-code alone for money

---

## Agent Operational Directive

> **MANDATORY**: Verify webhook signatures on unmodified raw bytes. Persist and deduplicate on `event.id` before irreversible fulfillment. Keep secret keys server-only. Use test keys in dev/CI. Never fulfill solely from client redirect.

---

## Sources

- [Stripe webhooks](https://docs.stripe.com/webhooks)
- [Signature verification](https://docs.stripe.com/webhooks/signature)
- Idempotency patterns (Next.js/FastAPI + UNIQUE event_id)
