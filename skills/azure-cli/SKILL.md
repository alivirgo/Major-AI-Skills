---
name: azure-cli
description: "Operate Azure CLI (az) with subscription-scoped ARM, managed identities, AKS/App Service/Key Vault workflows, and RBAC patterns agents mis-scope."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["azure", "az", "azure-cli", "arm", "rbac", "managed-identity", "aks", "key-vault", "oidc"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Azure CLI (az) AI Skill Guide (Claude)

## Overview & Engine Architecture

The **Azure CLI** (`az`) calls **Azure Resource Manager (ARM)**. Work is scoped by **tenant → subscription → resource group → resource**. Auth is interactive login, service principal, managed identity, or **federated OIDC** (GitHub Actions). Agents always resolve **tenant, subscription, and location** before mutating—Azure often returns `NotFound` / “subscription doesn’t exist” when the real issue is **wrong context or missing RBAC**, not a missing resource name.

```
┌─────────────────────────────────────────────────────────────┐
│                 Azure CLI → ARM path                          │
│                                                             │
│  Identity                                                   │
│  ├── az login (user / device code)                          │
│  ├── SP / federated credential (OIDC CI)                    │
│  └── Managed identity (compute / Automation)                │
│                                                             │
│  Scope                                                      │
│  ├── Tenant → Subscription (az account set)                 │
│  ├── Resource group + location defaults                     │
│  └── RBAC assignments (role + scope + principal)            │
│                                                             │
│  Workloads                                                  │
│  └── AKS · App Service · ACR · Storage · Key Vault · …      │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Creating/managing resource groups, App Services, AKS, ACR, storage, and role assignments.
- Fetching AKS kubeconfig, App Service logs, or Key Vault metadata (not dumping secrets to chat).
- Debugging “wrong subscription” / RBAC timing after permission grants.

**Do not use when**

- Shared multi-env infra should be declarative → `@terraform` / `@pulumi` (Bicep OK for Azure-native).
- Day-2 cluster workloads after credentials → `@kubernetes`.
- Someone asks to paste client secrets or Key Vault secret **values** into chat/logs → refuse; use managed identity / Key Vault references / `@vault`.

---

## Operational Capabilities & Agent Directives

1. **Context first**: `az account show` and `az account list -o table` before every write session.
2. **Pass `--subscription` / `--resource-group` explicitly** on mutates; do not trust ambient defaults in scripts.
3. **Prefer managed identity / federated credentials** over client secrets for apps and CI.
4. **RBAC creates**: use `--assignee-object-id` + `--assignee-principal-type` to skip Entra lookups that fail for SPs (`Insufficient privileges`).
5. **Output**: `--output json` + JMESPath `--query` for automation; never scrape human tables.
6. **Never print** Key Vault secret values, SP passwords, or federated credential secrets into chat/CI logs.
7. After new RBAC grants, **refresh account cache** (`az account clear` + `az login`, or new shell)—ARM/RBAC can lag (~minutes).

---

## Production Example: subscription gate + App Service + MI RBAC

```bash
# Login + subscription gate (use device code in remote shells)
az login
# az login --use-device-code
az account list -o table
az account set --subscription "00000000-0000-0000-0000-000000000000"
az account show --query "{name:name, id:id, tenant:tenantId}" -o json

az configure --defaults group=rg-prod-api location=eastus

az group create -n rg-prod-api -l eastus
az appservice plan create -g rg-prod-api -n plan-api --sku P1v3 --is-linux
az webapp create -g rg-prod-api -p plan-api -n app-api-prod --runtime "NODE:20-lts"

# User-assigned identity + ACR pull (no client secret)
az identity create -g rg-prod-api -n id-api
PRINCIPAL=$(az identity show -g rg-prod-api -n id-api --query principalId -o tsv)
az webapp identity assign -g rg-prod-api -n app-api-prod --identities \
  "$(az identity show -g rg-prod-api -n id-api --query id -o tsv)"

az role assignment create \
  --assignee-object-id "$PRINCIPAL" \
  --assignee-principal-type ServicePrincipal \
  --role "AcrPull" \
  --scope "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-prod-api/providers/Microsoft.ContainerRegistry/registries/acrprod"

# AKS kubeconfig → hand off to @kubernetes
az aks get-credentials -g rg-prod-api -n aks-prod --overwrite-existing
az aks show -g rg-prod-api -n aks-prod --query "powerState.code" -o tsv
```

CI (federated identity / OIDC — prefer over SP password):

```bash
# After azure/login action with client-id + tenant-id + subscription-id
az account show
az group list --query "[].name" -o tsv
```

What-if for large ARM/Bicep (prefer over blind `az deployment group create`):

```bash
az deployment group what-if -g rg-prod-api -f main.bicep
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `The subscription of '…' doesn't exist in cloud 'AzureCloud'` | No RBAC on sub; stale account cache; wrong tenant | Grant ≥ Reader on sub; `az account clear && az login`; verify tenant |
| Resource `NotFound` but Portal shows it | Wrong subscription/RG context | `az account show`; pass `--subscription` / `-g` |
| `Insufficient privileges` on `role assignment create` | SP cannot read Entra directory | Use `--assignee-object-id`; or grant Directory Readers carefully |
| RBAC “done” but still 401 | ARM cache / propagation delay | Wait up to ~10 min; new shell; retry |
| MI / Automation: `SubscriptionId cannot be null` | Identity has **zero** role assignments | Assign Reader/Contributor (least privilege) at needed scope |
| Extension command missing | Extension not installed / version skew | `az extension add --name <n>`; pin versions in README/CI |
| Interactive login fails in CI | No browser / device flow | Use OIDC federated credential or MI—not user login |

---

## Best Practices

1. Naming: `rg-<env>-<app>`, `aks-<env>`, `id-<app>`; tag with `env`, `owner`, `service`.
2. Lock production RGs (`CanNotDelete`) when policy allows.
3. App settings: Key Vault references over plaintext secrets; pair with `@vault` when org-standard.
4. Document required `az` version + extensions in the repo README.
5. Graduate shared infra from imperative `az` scripts to `@terraform` / `@pulumi` / Bicep.

---

## Limitations

- Imperative `az` scripts drift; IaC owns long-lived topology.
- Cross-tenant and Entra consent flows may require a human.
- Preview extensions can break pinned pipelines—treat as deliberate upgrades.
- Stop and ask if subscription ID, tenant, or delete approval is missing.

---

## Related Skills

- `@kubernetes` — AKS workload ops after `get-credentials`
- `@terraform` / `@pulumi` — declarative Azure infrastructure
- `@vault` — org secret workflows vs Key Vault
- `@docker` — images for ACR / App Service containers
- `@aws-cli` / `@gcloud-cli` — analogous multi-cloud CLI patterns
- `@github-actions` — OIDC login to Azure

---

## Agent Operational Directive

> **MANDATORY**: Resolve tenant/subscription with `az account show` before mutating. Prefer managed identity and federated OIDC over client secrets. Use `--assignee-object-id` for RBAC from SPs. Never print Key Vault secret values or SP passwords. Refresh login cache after new grants. If subscription or blast radius is unclear, stop and ask.

---

## Source anchors (research)

- [Manage Azure subscriptions with the CLI](https://learn.microsoft.com/en-us/cli/azure/manage-azure-subscriptions-azure-cli)
- [Troubleshoot Azure RBAC](https://learn.microsoft.com/en-us/azure/role-based-access-control/troubleshooting)
- [Subscription doesn’t exist (SP needs RBAC)](https://github.com/Azure/azure-cli/issues/28329)
- [Managed identity subscription null](https://learn.microsoft.com/en-us/azure/automation/troubleshoot/managed-identity)
