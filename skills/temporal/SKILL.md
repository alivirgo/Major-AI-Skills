---
name: temporal
description: "Author and orchestrate Temporal workflows and activities; implement saga compensation, deterministic execution, retries, signals, and queries."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-13"
tags: ["temporal", "orchestration", "workflow", "activities", "sagas", "microservices", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Temporal Durable Execution & Workflow Orchestration AI Skill Guide

## Overview & Engine Architecture

Temporal is a distributed durable execution platform that preserves application state and execution history across server crashes, network partitions, and prolonged outages. In Temporal, **Workflows** are deterministic orchestrators that maintain state through event-sourcing replay, while **Activities** encapsulate non-deterministic side effects such as API calls, database writes, and external messaging.

Claude operates as a Principal Distributed Systems Engineer, specializing in **deterministic workflow construction**, **saga pattern compensation**, **activity retry policies**, **signal and query handling**, and **Temporal Worker topology deployment**.

### Temporal Cluster & Worker Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    Temporal Architecture                    │
│                                                             │
│  Temporal Server Cluster (History, Matching, Frontend)      │
│  ├── Frontend Service (gRPC API, Authentication, Rate Limit)│
│  ├── History Service (Event Sourcing State Store, Replay)   │
│  ├── Matching Service (Task Queues, Worker Polling Dispatch)│
│  └── Persistence DB (PostgreSQL / MySQL / Cassandra)        │
│                                                             │
│  Worker Processes (Hosting Workflows & Activities)          │
│  ├── Workflow Worker (Deterministic Replay Sandboxes)       │
│  ├── Activity Worker (Idempotent Remote Execution)          │
│  └── Long Polling Task Queue (`order-processing-queue`)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Enforce Absolute Workflow Determinism**: Never use non-deterministic functions (e.g., standard `Date.now()`, `Math.random()`, or random UUIDs) inside Workflow definitions. Always use Temporal SDK deterministic equivalents (`workflow.now()`, `workflow.uuid4()`).
2. **Strict Activity Isolation**: All I/O operations, network requests, disk reads/writes, and external mutations must reside inside Activities, never directly inside Workflow functions.
3. **Mandatory Activity Timeouts**: Never register an Activity without at least `start_to_close_timeout`. Always specify explicit retry policies with exponential backoff and maximum attempts.
4. **Implement Resilient Saga Compensations**: When coordinating multi-step transactions across external services (e.g., charge card $\rightarrow$ reserve inventory $\rightarrow$ book shipment), register reverse compensation activities in a LIFO stack to rollback cleanly if subsequent steps fail.

---

## Production TypeScript Automation: Saga Workflow & Compensations

### 1. Workflow Definition with Sagas (`src/workflows.ts`)

```typescript
import { proxyActivities, defineSignal, defineQuery, setHandler } from "@temporalio/workflow";
import type * as activities from "./activities";

const { chargePayment, reserveInventory, cancelPayment, releaseInventory } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: "30 seconds",
    retry: {
      initialInterval: "1 second",
      backoffCoefficient: 2,
      maximumAttempts: 5,
    },
  });

export const cancelOrderSignal = defineSignal("cancelOrder");
export const orderStatusQuery = defineQuery<string>("orderStatus");

export interface OrderInput {
  orderId: string;
  customerId: string;
  amount: number;
  sku: string;
}

export async function processOrderWorkflow(input: OrderInput): Promise<string> {
  const compensations: Array<() => Promise<void>> = [];
  let status = "INITIALIZING";

  setHandler(orderStatusQuery, () => status);

  try {
    status = "CHARGING_PAYMENT";
    await chargePayment(input.customerId, input.amount);
    compensations.push(() => cancelPayment(input.customerId, input.amount));

    status = "RESERVING_INVENTORY";
    await reserveInventory(input.sku, 1);
    compensations.push(() => releaseInventory(input.sku, 1));

    status = "COMPLETED";
    return `Order ${input.orderId} successfully processed.`;
  } catch (err) {
    status = "ROLLING_BACK";
    // Execute registered compensations in reverse order
    for (const compensate of compensations.reverse()) {
      try {
        await compensate();
      } catch (compensationError) {
        console.error("Failed compensation activity:", compensationError);
      }
    }
    status = "FAILED";
    throw new Error(`Order processing failed and was compensated: ${(err as Error).message}`);
  }
}
```

### 2. Temporal Worker Registration (`src/worker.ts`)

```typescript
import { Worker } from "@temporalio/worker";
import * as activities from "./activities";

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve("./workflows"),
    activities,
    taskQueue: "order-processing-queue",
  });

  console.log("Temporal Worker started on queue: order-processing-queue");
  await worker.run();
}

run().catch((err) => {
  console.error("Fatal Worker crash:", err);
  process.exit(1);
});
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`Workflow Non-Deterministic Error` during replay** | Workflow code was modified in production without using versioning APIs (`patched()`), or a non-deterministic call changed history. | 1. Use `workflow.patched("fix-v2")` to branch logic based on execution history.<br>2. Eliminate non-deterministic timers, native random generators, or external API calls inside workflow code.<br>3. Inspect diff using `temporal workflow replay`. |
| **`Activity Task Scheduled to Start Timeout`** | Worker pool is offline, saturated, or polling a mismatched task queue name. | 1. Check worker logs to confirm worker is running and listening on the exact `taskQueue`.<br>2. Scale out activity worker processes to process queued backlogs.<br>3. Review Matching service metrics in Prometheus. |
| **`Workflow history size exceeds safety limit (>50K events / >50MB)`** | Long-running workflow or infinite loop accumulating unbound event history. | 1. Implement `continueAsNew()` to atomically rollover state to a fresh workflow run.<br>2. Batch external activity polling instead of tight continuous polling loops. |
| **Worker fails to initialize: TLS Handshake Error** | Client certificates missing or expired when connecting to Temporal Cloud or mTLS cluster. | Verify client certificate, private key, and root CA bundle; confirm cluster hostname matches SAN in certificate. |

---

## Command Line Syntax & Operational Recipes

```bash
# 1. Start local development server with Web UI on port 8233
temporal server start-dev

# 2. Launch workflow instance from command line
temporal workflow start \
  --task-queue order-processing-queue \
  --type processOrderWorkflow \
  --workflow-id order-ord-9901 \
  --input '{"orderId":"ord-9901","customerId":"cust-42","amount":1500,"sku":"WIDGET-01"}'

# 3. Query workflow state in real-time
temporal workflow query \
  --workflow-id order-ord-9901 \
  --name orderStatus

# 4. Inspect full event history of a completed or failed workflow
temporal workflow show --workflow-id order-ord-9901
```

---

## Agent Operational Directive

> **MANDATORY**: Never introduce in-memory global state across workflow executions. Always rely strictly on Temporal workflow parameters, signals, and activity return payloads to ensure perfect replay fidelity across distributed restarts.
