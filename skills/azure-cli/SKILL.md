---
name: azure-cli
description: "Operational skill for agents to manage Microsoft Azure via az CLI - subscriptions, resource groups, AKS, App Service, Key Vault, and RBAC hygiene."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["azure", "az", "azure-cli", "aks", "rbac", "arm", "cli"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Azure CLI (az) AI Skill Guide

## Overview

The Azure CLI (`az`) talks to Azure Resource Manager (ARM). Work is scoped by **subscription** and usually grouped under a **resource group**. Agents should always resolve tenant, subscription, and default location before mutating resources - Azure errors often look like "NotFound" when the real issue is the wrong subscription context.

```
az login / identity
        |
        v
+-------------------+     +--------------------+
| Subscription      | --> | Resource groups    |
| Tenant / RBAC     |     | AKS / App Service  |
+-------------------+     | Storage / Key Vault|
                          +--------------------+
```

## When to use

- Creating resource groups, App Services, AKS clusters, or storage accounts
- Wiring managed identities and role assignments
- Fetching AKS kubeconfig or App Service logs
- Scripting ARM-friendly deployments without full Bicep/Terraform yet

## Operational directives

1. Start every session with `az account show` and `az account list -o table`.
2. Prefer explicit `--resource-group` / `--subscription` on write commands.
3. Use managed identities over client secrets when the platform supports it.
4. Prefer `--output json` for scripting; use JMESPath `--query` instead of fragile greps.
5. Never print Key Vault secret values into chat or CI logs unless the user explicitly needs them redacted.

## Concrete examples

### Account and defaults

```bash
az login
az account set --subscription "Prod Engineering"
az configure --defaults group=rg-prod-api location=eastus
az account show --query "{name:name, id:id, tenant:tenantId}" -o json
```

### Resource group + App Service

```bash
az group create -n rg-prod-api -l eastus
az appservice plan create -g rg-prod-api -n plan-api --sku P1v3 --is-linux
az webapp create -g rg-prod-api -p plan-api -n app-api-prod --runtime "NODE:20-lts"
az webapp config appsettings set -g rg-prod-api -n app-api-prod \
  --settings WEBSITE_NODE_DEFAULT_VERSION=20
```

### AKS credentials

```bash
az aks get-credentials -g rg-prod-api -n aks-prod --overwrite-existing
az aks show -g rg-prod-api -n aks-prod --query "powerState.code" -o tsv
```

### RBAC with managed identity

```bash
PRINCIPAL=$(az identity show -g rg-prod-api -n id-api --query principalId -o tsv)
az role assignment create \
  --assignee-object-id "$PRINCIPAL" \
  --assignee-principal-type ServicePrincipal \
  --role "AcrPull" \
  --scope /subscriptions/<sub>/resourceGroups/rg-prod-api/providers/Microsoft.ContainerRegistry/registries/acrprod
```

## Extension and query tips

| Goal | Pattern |
| :--- | :--- |
| Filter list | `az webapp list -g rg --query "[].{name:name, state:state}" -o table` |
| Wait for ready | `az webapp show ... --query state -o tsv` in a retry loop |
| Install extension | `az extension add --name <name>` then pin in docs |
| What-if deploy | Prefer Bicep/ARM what-if for large templates |

## Best practices

1. Name resources with a consistent scheme (`rg-<env>-<app>`, `aks-<env>`).
2. Lock production resource groups against accidental delete when policy allows.
3. Prefer Key Vault references for App Service secrets over plain app settings.
4. Document required CLI version and extensions in the repo README.

## Limitations

- `az` imperative scripts drift; graduate shared infra to Bicep/Terraform/Pulumi.
- Cross-tenant and Azure AD permission prompts may need interactive login (hard in headless CI).
- Some preview features require extension versions that break older pipelines.

## Related skills

- `kubernetes` - AKS workload operations after `get-credentials`
- `vault` - compare with Key Vault secret workflows
- `docker` - images for ACR / App Service containers
- `gcloud-cli` - analogous multi-cloud CLI patterns
