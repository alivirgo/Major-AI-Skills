---
name: terraform
description: "Write reviewable Terraform with remote state locks, moved-block refactors, and plan-first applies; catch destructive replaces, drift, and state surgery mistakes before production."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["terraform", "iac", "hcl", "state", "modules", "drift", "opentofu"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Terraform Infrastructure as Code AI Skill Guide (Claude)

## Overview & Engine Architecture

Terraform (and compatible **OpenTofu**) declares infrastructure in HCL; providers reconcile API objects against **state**. A **plan** is the contract: it shows create/update/destroy. Agents treat state as **confidential**, locking as **mandatory**, and refactors as **`moved` blocks in Git**—not casual `state mv` on laptops.

```
┌─────────────────────────────────────────────────────────────┐
│                 Terraform execution graph                   │
│                                                             │
│  Config (*.tf, modules) + variables                         │
│       ↓ init (providers, backend)                           │
│  State (remote S3/GCS/Azure + lock) ←→ refresh              │
│       ↓ plan (graph diff) → saved plan artifact             │
│       ↓ apply (ordered API calls)                           │
│  Outputs → downstream modules / CI / @kubernetes            │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Authoring modules, backends, IAM, and environment-separated workspaces.
- Reviewing PR plans for unexpected destroys or `-/+` replacements on stateful resources.
- Refactoring addresses (`moved`), importing existing cloud objects, or documenting drift response.

**Do not use when**

- Day-2 OS configuration on already-created VMs → `@ansible`.
- Application deploys to an existing cluster → `@helm` / `@argocd`.
- One-off CLI debugging → cloud CLIs (`@aws-cli`, etc.) alongside IaC, not instead of it.

---

## Operational Capabilities & Agent Directives

1. **Remote state + lock always** for teams; never commit `.tfstate` or disable `-lock` routinely.
2. **Plan before apply**; store plan files in CI; prod applies only reviewed artifacts.
3. **Refactor with `moved` blocks** (Terraform ≥1.1); keep historical `moved` in shared modules for upgrade paths.
4. **Before `state rm/mv`**: `terraform state pull > backup.tfstate`; verify next plan is empty of surprise destroys.
5. **Drift**: `plan -refresh-only` **records** reality—it does not revert drift; normal `apply` reverts accidental manual changes when safe.
6. **Pin** `required_version` and provider versions (`~>` on major); read provider changelogs on bumps.
7. **Mark sensitive outputs**; never log secret values from `terraform output -json`.
8. **Separate refactors from attribute changes** in one PR when possible (tfautomv-style discipline).

---

## Production Example: backend + module + moved refactor

```hcl
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "org-tf-state"
    key            = "prod/network/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "org-tf-locks"
    encrypt        = true
  }
}

moved {
  from = aws_subnet.public_a
  to   = module.network.aws_subnet.public["a"]
}

module "network" {
  source   = "./modules/network"
  vpc_cidr = var.vpc_cidr
}
```

Safe CI loop:

```bash
terraform init -input=false
terraform fmt -check -recursive
terraform validate
terraform plan -input=false -out=tfplan
terraform show -no-color tfplan | tee plan.txt
# human review — then:
terraform apply -input=false tfplan
```

---

## Plan review matrix (stop the line)

| Plan signal | Risk | Action |
| :--- | :--- | :--- |
| `-/+` replace on RDS, EBS, stateful disk | Data loss / downtime | Stop; snapshot; maintenance window; maybe `create_before_destroy` |
| Large `destroy` count after refactor | Missing `moved` / wrong address | Add `moved`; never “apply through” |
| `forces replacement` on SG attached widely | Connection blips | Assess dependents; staged apply |
| Provider upgrade with many changes | Provider bug or schema shift | Staging plan first; pin if needed |
| Import + immediate destroy | Config ≠ reality | Fix HCL to match; re-plan |

---

## Technical Troubleshooting Matrix

| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| Error acquiring state lock | Stale CI job / crashed apply | Identify holder; `force-unlock` only after confirming no active apply |
| Perpetual diff on tags/defaults | Provider defaulting or `ignore_changes` gap | Explicit tags; lifecycle ignore documented |
| Resource exists in cloud, not in state | Created manually | `import` block / `terraform import`; match attributes |
| Two workspaces same resource | Duplicate state ownership | One state per env; split addresses |
| Apply OK but app broken | Wrong output wired downstream | Trace output → k8s/helm values |

---

## Best Practices

1. One state file (or TFC workspace) per environment—no shared prod/dev state.
2. Prefer `for_each` with stable keys over `count` index keys for resources that may reorder.
3. Document runner IAM permissions as code (`@github-actions` OIDC role).
4. Use `prevent_destroy` on critical data stores with documented break-glass removal process.
5. Run drift detection on schedule (`plan -refresh-only` in CI) and ticket non-empty diffs.

---

## Limitations

- Providers lie about eventual consistency; verify critical endpoints post-apply.
- Import/state surgery is high risk; snapshots and peer review required.
- Policy-as-code (Sentinel/OPA) may block applies—agents cannot override org policy.
- Stop and ask if backend credentials, workspace name, or blast radius is unknown.

---

## Related Skills

- `@kubernetes` — consume cluster outputs safely
- `@github-actions` — plan/apply pipelines with OIDC
- `@aws-cli` / `@gcloud-cli` / `@azure-cli` — imperative verification
- `@helm` — deploy apps after cluster exists
- `@vault` — dynamic secrets for providers where supported

---

## Agent Operational Directive

> **MANDATORY**: Never approve apply when the plan destroys or replaces stateful resources without explicit human intent. Use `moved` blocks for address changes. Backup state before manual surgery. Treat `-lock=false` and casual `force-unlock` as incident-level exceptions. Separate drift acceptance (`-refresh-only`) from drift reversion (normal apply).

---

## Source anchors (research)

- [HashiCorp: Refactor with moved blocks](https://developer.hashicorp.com/terraform/language/modules/develop/refactoring)
- [terraform-gotchas (community)](https://github.com/atryx/terraform-gotchas)
- [State operations: import, move, drift](https://ethernetdude.com/state-operations-import-move-refactor-drift/)
- [tfautomv: moved block generation](https://github.com/busser/tfautomv)
