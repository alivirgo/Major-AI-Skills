---
name: temporal
description: "Author deterministic Temporal workflows and idempotent activities; deploy with versioning/replay tests; configure mTLS auth; understand visibility backup limits and saga compensation—not in-memory orchestration."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-13"
tags: ["temporal", "workflow", "activities", "determinism", "sagas", "worker-versioning", "replay", "visibility", "backpressure"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Temporal Durable Execution & Workflow Orchestration AI Skill Guide

## Overview & Engine Architecture

Temporal provides **durable execution**: workflow state is event-sourced; workers replay history to recover. **Workflow code must be deterministic**; **Activities** hold all I/O (HTTP, DB, messaging). The server (Frontend/History/Matching) persists to a primary database; **Visibility** is a separate search index (eventually consistent).

```
Client -> Temporal Server (gRPC, auth/mTLS)
            -> History (event log) -> Persistence (Postgres/MySQL/Cassandra)
            -> Matching (task queues)
Workers (poll task queues)
    -> Workflow sandbox (replay)
    -> Activities (retries, timeouts, heartbeats)
```

---

## When to use / when not to

**Use when**

- Long-running processes (hours/days), sagas, human-in-the-loop, cron with strong reliability
- Need automatic retries, timers, signals, and audit-grade history

**Do not use when**

- Simple fire-and-forget cron without state (`@airflow` task)
- All logic fits a single DB transaction with no external calls
- Team refuses determinism constraints—workflows will break on deploy

---

## Operational Capabilities & Agent Directives

1. **Determinism**: No `Date.now()`, `Math.random()`, or undisciplined UUIDs in workflow code—use SDK `workflow.now()`, `workflow.uuid4()`, etc. All I/O in activities.
2. **Activity contracts**: Always set `start_to_close_timeout`; retries with backoff; **heartbeats** for long activities; activities must be **idempotent** (retries are normal).
3. **Versioning**: Use `workflow.patched()` or **Worker Versioning** before changing command order; run **replay tests** on representative histories before prod deploy ([safe deployments](https://docs.temporal.io/develop/safe-deployments)).
4. **Backpressure**: Scale workers per **task queue**; split activity vs workflow workers; monitor schedule-to-start latency; avoid unbounded local activity parallelism.
5. **Auth**: mTLS + namespace for Temporal Cloud; rotate client certs; never commit keys.
6. **Backup/restore**: Backup **persistence DB** for execution truth; **Visibility** (Elasticsearch/OpenSearch) does **not** rebuild from primary—backup visibility too if search history matters; closed workflows may stay stale after partial restore ([community thread](https://community.temporal.io/t/backup-restore-with-advanced-visibility/7423)).
7. **Exactly-once myth**: Activities run **at-least-once**; workflows replay; side effects require idempotency keys or compensations (sagas).

---

## Production examples

### Saga with compensation stack (TypeScript)

```typescript
import { proxyActivities, defineQuery, setHandler } from "@temporalio/workflow";
import type * as activities from "./activities";

const { chargePayment, reserveInventory, cancelPayment, releaseInventory } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: "30 seconds",
    retry: { initialInterval: "1s", backoffCoefficient: 2, maximumAttempts: 5 },
  });

export const orderStatusQuery = defineQuery<string>("orderStatus");

export async function processOrderWorkflow(input: OrderInput): Promise<string> {
  const compensations: Array<() => Promise<void>> = [];
  let status = "INITIALIZING";
  setHandler(orderStatusQuery, () => status);

  try {
    status = "CHARGING";
    await chargePayment(input.customerId, input.amount);
    compensations.push(() => cancelPayment(input.customerId, input.amount));

    status = "RESERVING";
    await reserveInventory(input.sku, 1);
    compensations.push(() => releaseInventory(input.sku, 1));

    status = "COMPLETED";
    return `Order ${input.orderId} processed`;
  } catch (err) {
    status = "ROLLING_BACK";
    for (const compensate of compensations.reverse()) {
      try { await compensate(); } catch { /* alert + manual runbook */ }
    }
    status = "FAILED";
    throw err;
  }
}
```

### Activity idempotency (sketch)

```typescript
export async function chargePayment(customerId: string, amount: number) {
  await payments.charge({ idempotencyKey: workflowInfo().workflowId, customerId, amount });
}
```

### CLI operations

```bash
temporal workflow start --task-queue order-processing-queue \
  --type processOrderWorkflow --workflow-id order-ord-9901 \
  --input '{"orderId":"ord-9901","customerId":"cust-42","amount":1500,"sku":"WIDGET-01"}'

temporal workflow query --workflow-id order-ord-9901 --name orderStatus
```

---

## Technical troubleshooting matrix

| Failure signature | Root cause | Diagnostic & fix |
| :--- | :--- | :--- |
| `NonDeterminismError` on deploy | Workflow code changed without patch | Roll back worker; add `patched()`; replay test |
| Activity schedule-to-start timeout | No workers / wrong queue | Verify task queue; scale workers |
| History size limit | Unbounded loop/events | `continueAsNew()`; batch signals |
| Duplicate charges | Non-idempotent activity | Idempotency keys; dedupe table |
| Visibility stale vs history | Async index | Use `DescribeWorkflowExecution` for truth |
| Restore search broken | ES not restored | Backup visibility store; accept stale closed WF |

---

## Best practices

- One workflow type per business process; keep workflows thin orchestrators.
- Use signals for human approval; queries for read-only status—**not** polling visibility from workflow code ([visibility guidance](https://docs.temporal.io/visibility)).
- Encrypt payloads at rest when PII present; redact in UI exports.
- Monitor `temporal_workflow_task_execution_failed`, task lag, and worker restarts.

---

## Limitations

- Workflow code changes are deployment events—plan versioning like schema migrations.
- High-cardinality child workflows can stress history service.
- This skill does not replace Temporal Cloud SLA/support contracts.

---

## Related skills

- `@postgresql` — common persistence backend
- `@kafka` — event ingestion triggering workflows
- `@ai-human-handoff-contract` — human steps via signals

---

## Agent Operational Directive

> **MANDATORY**: No non-deterministic APIs in workflow functions. Every activity has timeouts and idempotent side effects. Run replay validation before shipping workflow changes. Do not use Visibility queries as strongly consistent workflow state. Backup plan must include visibility if search-dependent ops exist.

---

## Source anchors (research)

- [Temporal — Workflow determinism](https://docs.temporal.io/workflow-definition)
- [Safe deployments & replay testing](https://docs.temporal.io/develop/safe-deployments)
- [Troubleshooting execution failures](https://docs.temporal.io/troubleshooting/execution-failures)
- [Visibility (eventually consistent)](https://docs.temporal.io/visibility)
- [Backup/restore with advanced visibility](https://community.temporal.io/t/backup-restore-with-advanced-visibility/7423)
