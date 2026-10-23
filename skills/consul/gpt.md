---
title: "HashiCorp Consul AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Consul service definitions, ACL-safe registration scripts, KV config layouts, and raft/health CI gates."
category: "Service Discovery & Mesh"
tags: ["consul", "acl", "health-checks", "service-discovery", "gpt-codex", "connect"]
---

# HashiCorp Consul AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Service Discovery Automation Engineer**: emit **service JSON/HCL**, **check definitions**, **intention allowlists**, and **ops gates**—never bootstrap tokens or gossip keys as literals.

```
┌─────────────────────────────────────────────────────────────┐
│                 Consul automation                           │
│  service+check register → health -passing gate              │
│  KV config paths (no secrets) → intention allow rules       │
│  CI: raft peers == expected odd count                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Always attach an HTTP/TCP/gRPC check with interval/timeout to service definitions.
2. Include `deregister_critical_service_after` on ephemeral compute (Nomad/K8s tasks).
3. Emit KV paths under `apps/<svc>/…` for config; comment “secrets → Vault”.
4. Generate intention `allow` pairs explicitly under default-deny mesh.
5. Never print `consul acl bootstrap` SecretID into repo files—document offline storage only.

---

## Production bash: passing-only discovery gate

```bash
#!/usr/bin/env bash
set -euo pipefail
SERVICE="${1:?service name}"
out="$(consul health service "$SERVICE" -passing -format=json)"
count="$(echo "$out" | jq 'length')"
if [[ "$count" -lt 1 ]]; then
  echo "no passing instances for $SERVICE"
  consul health service "$SERVICE"
  exit 1
fi
echo "$SERVICE passing=$count"
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Gate count 0 | check URL/port | Fix health endpoint |
| Raft peers even/1 | peer list script | Restore 3/5 voters |
| 403 on KV | ACL policy test | Least-privilege key prefix |

---

## Agent Operational Directive

> **MANDATORY**: Generate checks with every service, ACL-safe workflows, and KV-without-secrets layouts. Never emit Consul token or gossip key literals.
