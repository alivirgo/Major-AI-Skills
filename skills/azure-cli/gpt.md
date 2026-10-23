---
title: "Azure CLI (az) AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate subscription-gated az scripts, managed-identity RBAC, OIDC CI login, and AKS/App Service runbooks without client secrets."
category: "Cloud CLI & Identity"
tags: ["azure-cli", "az", "rbac", "managed-identity", "oidc", "gpt-codex"]
---

# Azure CLI (az) AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as an **Azure Ops Automation Engineer**: emit **subscription gates**, **managed-identity RBAC** (`--assignee-object-id`), **federated OIDC CI**, and **what-if** deployments—never long-lived SP passwords in repos.

```
┌─────────────────────────────────────────────────────────────┐
│                 Azure CLI automation                        │
│  account show gate → RG/resource cmds → MI role assign      │
│  CI: azure/login (OIDC) → az with explicit --subscription   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Every script starts with `az account show` and asserts subscription ID.
2. Pass `--subscription` and `--resource-group` on writes; avoid ambient-only defaults in CI.
3. Emit RBAC with `--assignee-object-id` + `--assignee-principal-type` for SPs/MIs.
4. Prefer federated credentials / managed identity over client secrets.
5. Never echo Key Vault secret values; use references or redact.

---

## Production Bash: subscription gate

```bash
#!/usr/bin/env bash
set -euo pipefail
EXPECTED_SUB="${EXPECTED_SUB:?set EXPECTED_SUB}"
CUR="$(az account show --query id -o tsv)"
if [[ "$CUR" != "$EXPECTED_SUB" ]]; then
  echo "refusing: subscription $CUR != $EXPECTED_SUB" >&2
  exit 1
fi
az "$@"
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Subscription doesn’t exist | `az account list` missing ID | Grant Reader+; `az account clear && az login` |
| Insufficient privileges on role assign | Entra lookup | Switch to `--assignee-object-id` |
| 401 after role grant | Propagation | Retry with backoff; new shell |
| CI interactive prompt | User login in pipeline | OIDC federated credential |

---

## Agent Operational Directive

> **MANDATORY**: Gate on subscription ID. Prefer MI/OIDC. Use object-id RBAC. Never emit SP passwords or Key Vault secret values.
