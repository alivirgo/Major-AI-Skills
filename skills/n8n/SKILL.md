---
name: n8n
description: "Design production n8n workflows with webhook auth, queue-mode scaling, expression mapping, idempotent side effects, and credential hygiene. Use for self-hosted or cloud automation, REST workflow CI, and debugging executions."
category: automation
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["n8n", "workflow-automation", "webhooks", "rest-api", "nodes", "idempotency", "queue-mode", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# n8n Workflow Automation AI Skill Guide (Claude)

## Overview & Engine Architecture

n8n is a workflow automation platform (self-hosted or n8n Cloud) where **workflows** are directed graphs of **nodes**. Data moves as **items** (JSON arrays). Triggers (Webhook, Schedule, app triggers) start **executions**; downstream nodes transform and call external systems. Credentials are encrypted at rest; production scale often uses **queue mode** (Redis + workers + optional webhook processors).

Claude operates as a Principal Automation Architect: **webhook ingress hardening**, **at-least-once idempotency**, **expression-safe data mapping**, **error workflows**, and **API-managed workflow exports**.

```
┌─────────────────────────────────────────────────────────────┐
│                 n8n Production Stack                        │
│                                                             │
│  Ingress                                                    │
│  ├── Webhook (Header/Basic/JWT auth, IP allowlist)          │
│  ├── Schedule / app triggers                                │
│  └── Respond to Webhook (sync) vs async queue handoff       │
│                                                             │
│  Execution                                                  │
│  ├── Item fan-out (1 trigger → N items)                     │
│  ├── SplitInBatches / rate limits                           │
│  └── Code / HTTP Request / native app nodes                 │
│                                                             │
│  Scale-out (optional)                                       │
│  ├── Redis queue + worker processes                         │
│  ├── Webhook processors + load balancer                     │
│  └── Shared N8N_ENCRYPTION_KEY across all nodes             │
│                                                             │
│  Control plane                                              │
│  ├── REST API /api/v1 + API keys                            │
│  ├── Workflow JSON in git                                   │
│  └── Credentials vault (never in exported JSON secrets)     │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Integrating SaaS APIs with visual branching, retries, and ops-friendly execution logs.
- Self-hosting automations where data residency or custom nodes matter.
- Webhook-driven pipelines that need quick iteration before a dedicated worker service.

**Do not use when**

- You need **exactly-once** side effects without your own idempotency store (n8n + upstream retries = at-least-once).
- Sub-100ms synchronous webhook SLAs with heavy transforms (prefer ack-fast + async worker).
- HIPAA/PCI scope without reviewing n8n deployment, logging, and credential access patterns.

---

## Operational Capabilities & Agent Directives

1. **Assume at-least-once delivery**: Stripe, Shopify, and custom clients retry on non-2xx or timeouts. Deduplicate **before** CRM charges, emails, or ledger writes.
2. **Credential hygiene**: Use n8n **Credentials** or env vars; never commit tokens in Code node source or workflow JSON. Rotate after exports leak.
3. **Webhook auth by default**: Header auth, Basic, or JWT on production URLs; IP allowlist when provider publishes egress IPs.
4. **Item semantics**: One input item can become many; use **SplitInBatches** for API rate limits; pin sample data when debugging `$json` paths.
5. **Queue mode parity**: Share `N8N_ENCRYPTION_KEY` on main, workers, and webhook processors or credentials decrypt fails on workers.
6. **Fast ack pattern**: Respond 202/200 immediately after idempotency reservation; run heavy steps in a child workflow or queue drain.
7. **Error visibility**: Wire **Error Trigger** workflows or node error outputs; silent failures are common when Zaps/workflows are inactive.

---

## Production patterns

### Idempotent webhook chain (conceptual)

```text
Webhook (POST, Header auth)
  → Set (normalize event_id from body.headers)
  → HTTP Request OR Redis/Postgres "claim" idempotency key (INSERT … ON CONFLICT / SET NX)
  → IF duplicate → Respond 200 "already processed"
  → ELSE side effects (CRM, email)
  → Respond to Webhook 200
```

Code node (normalize + validate):

```javascript
const items = $input.all().map((item) => {
  const j = item.json.body ?? item.json;
  const eventId = String(j.id ?? j.event_id ?? "").trim();
  if (!eventId) return null;
  return {
    json: {
      eventId,
      tenantId: j.tenant_id ?? "default",
      payload: j,
      receivedAt: new Date().toISOString(),
    },
  };
}).filter(Boolean);
return items;
```

### Management API (CI activate)

```bash
curl -X POST "https://n8n.example.com/api/v1/workflows/42/activate" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

---

## Technical Troubleshooting Matrix

| Issue & signature | Root cause | Fix |
| :--- | :--- | :--- |
| **Webhook 404** | Workflow inactive or wrong path/method | Activate; confirm Production URL vs Test URL |
| **401/403 on webhook** | Auth header/IP allowlist | Match credential; update allowlist |
| **Duplicate CRM rows** | Provider retries; no idempotency | Claim `event_id` before create; upsert by external ID |
| **Expression `undefined`** | Wrong path (`$json` vs `$node`) | Pin data; inspect item JSON mid-run |
| **Credential works in UI, fails on worker** | Missing shared encryption key in queue mode | Align `N8N_ENCRYPTION_KEY` on all processes |
| **Slow webhook response** | Heavy sync chain | Ack early; async sub-workflow |
| **HTML webhook response broken** | n8n 1.103+ sandbox iframe | Use absolute URLs; embed short-lived token in HTML |

---

## Best Practices

1. Version workflow JSON in git; document required credential types in README.
2. Prefix idempotency keys: `{tenantId}:evt:{stableId}` with TTL (24–72h typical).
3. Prefer native nodes over Code when maintainability matters; Code for small transforms only.
4. In queue mode, consider `endpoints.disableProductionWebhooksOnMainProcess` + dedicated webhook processors behind LB.
5. Log execution ID + external event ID; never log full PII payloads in production retention.

### Essential paths

- UI: Workflows / Credentials / Executions
- API: `/api/v1`
- Env: `N8N_ENCRYPTION_KEY`, `EXECUTIONS_MODE=queue`, Redis URL

---

## Limitations

- No built-in exactly-once semantics for external side effects.
- Binary/large payloads need explicit handling; relay offload requires n8n ≥ 2.34 on all mains.
- Complex multi-tenant RBAC is DIY (lookup tables + scoped credentials).

---

## Related skills

- `@zapier` — SaaS-first alternative when self-hosting is unnecessary
- `@stripe` — signed webhooks + idempotency patterns upstream of n8n
- `@nodejs` — custom webhook receivers when n8n is bypassed

---

## Agent Operational Directive

> **MANDATORY**: Treat all webhook triggers as at-least-once. Persist an idempotency key before irreversible side effects. Store secrets in Credentials/env only. Enable webhook authentication on production URLs. Never disable error alerting to “reduce noise.”

---

## Sources

- n8n docs: [Queue mode](https://docs.n8n.io/hosting/scaling/queue-mode/), [Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- Community: [r/n8n webhook retries / idempotency](https://www.reddit.com/r/n8n/comments/1rkuh6x/webhook_retries_can_cause_duplicate_executions_in/)
- Patterns: production webhook hardening (signature verify, Redis SET NX)
