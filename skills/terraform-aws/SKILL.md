---
name: terraform-aws
description: "Design AWS Terraform with pinned providers, S3 remote state (native lockfile), least-privilege IAM, and OIDC CI apply gates agents routinely get wrong."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["terraform", "aws", "s3-backend", "state-locking", "iam", "oidc", "modules", "vpc"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Terraform on AWS AI Skill Guide (Claude)

## Overview & Engine Architecture

This skill specializes `@terraform` for **AWS**: provider configuration, reusable modules (VPC, ECS/EKS, RDS, IAM), **remote state on S3**, and tag/IAM conventions. Prefer **S3 native state locking** (`use_lockfile = true`; DynamoDB locking is **deprecated**). Agents write least-privilege policies, keep one env per state (or a clear workspace strategy), never commit access keys, and gate **plan → human/CI review → apply**. Prefer **GitHub OIDC → IAM role** over long-lived CI keys.

```
┌─────────────────────────────────────────────────────────────┐
│                 Terraform AWS control plane                   │
│                                                             │
│  Root module (env: prod/staging)                            │
│  └── child modules: network · data · app · iam              │
│                                                             │
│  Provider                                                   │
│  ├── hashicorp/aws (version pinned)                         │
│  └── Creds: OIDC role / SSO profile / instance role         │
│                                                             │
│  State                                                      │
│  ├── S3 bucket (versioning + encrypt)                       │
│  ├── use_lockfile = true  (prefer; DynamoDB deprecated)     │
│  └── Optional dual-lock during migration                    │
│                                                             │
│  CI                                                         │
│  └── fmt → validate → plan -out → review → apply            │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Authoring AWS modules, backends, IAM, and security groups for multi-env stacks.
- Migrating click-ops AWS into Terraform; reviewing plans for replace/destroy risk.
- Wiring CI OIDC roles that can read/write state and apply scoped resources.

**Do not use when**

- Core HCL/state language questions only → `@terraform`.
- Imperative one-off debug → `@aws-cli`.
- Someone asks to put AWS keys in `.tf` / committed `.tfvars` → refuse; use OIDC, SSO, or `@vault` / SSM / Secrets Manager data sources.

---

## Operational Capabilities & Agent Directives

1. **Pin** `required_version`, `hashicorp/aws` provider, and module versions; upgrade deliberately.
2. **One AWS account/env per state** (or documented workspaces); never mix prod/dev state files.
3. **Backend**: S3 + versioning + encryption; enable `use_lockfile = true`; migrate off `dynamodb_table` when possible.
4. **IAM**: least actions/resources; no `*` in production without explicit review; prefer roles over users.
5. **Secrets**: SSM Parameter Store / Secrets Manager **data sources**—not plaintext in git.
6. **CI**: `terraform plan -out=tfplan` artifact reviewed before `apply`; OIDC role with S3 state perms including lock object delete.
7. Call out **ForceNew / destroy** in plan summaries (RDS, ASG replacements, SG rewrites).

---

## Production Example: S3 lockfile backend + OIDC-friendly IAM

```hcl
terraform {
  required_version = ">= 1.10.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket       = "acme-tf-state"
    key          = "app/prod/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
    # During migration from DynamoDB locks you may set dynamodb_table too;
    # remove it once all runners are on Terraform >= 1.10 with lockfile support.
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Environment = var.environment
      Owner       = var.owner
      Service     = var.service
      ManagedBy   = "terraform"
    }
  }
}

data "aws_iam_policy_document" "task" {
  statement {
    sid       = "ReadConfig"
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::acme-app-config/${var.environment}/*"]
  }
}

resource "aws_iam_role" "task" {
  name               = "${var.service}-${var.environment}-task"
  assume_role_policy = data.aws_iam_policy_document.task_assume.json
}

resource "aws_iam_role_policy" "task" {
  name   = "task-inline"
  role   = aws_iam_role.task.id
  policy = data.aws_iam_policy_document.task.json
}
```

Validation loop:

```bash
terraform fmt -check -recursive
terraform init
terraform validate
terraform plan -out=tfplan
terraform show -no-color tfplan | head -n 200
# Apply only after review:
# terraform apply tfplan
```

CI needs `id-token: write` + role trust on `token.actions.githubusercontent.com`. Backend IAM must allow lock cleanup (`s3:DeleteObject` on the `.tflock` object; DynamoDB `DeleteItem` if still dual-locking).

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `Error acquiring the state lock` | Concurrent apply; crashed runner left lock; missing delete perms | Confirm no other run; `terraform force-unlock <ID>` only if safe; grant lock delete IAM |
| Backend assume-role / OIDC fail | Trust policy `sub` mismatch; missing `id-token: write` | Fix GitHub OIDC trust; configure-aws-credentials before init |
| Plan wants replace on “harmless” change | ForceNew attr (name, AZ, engine) | Read plan carefully; use `lifecycle` / blue-green; accept downtime explicitly |
| AccessDenied on apply but plan OK | Apply role narrower than plan; SCP | Align roles; check Org SCPs with `@aws-cli` |
| Drift after Console click-ops | Out-of-band change | `terraform refresh` / plan; import or revert in Console |
| Hard-coded AMI / AZ breaks region | No data sources | `aws_ami` / `aws_availability_zones` data; variables |

---

## Best Practices

1. Split state by blast radius (network vs app) when teams and change rates differ.
2. Module outputs pass **IDs**, not names alone, for security groups and subnets.
3. Prefer AWS provider `default_tags`; enforce via policy in CI.
4. Pair image digests with `@docker`; EKS apps with `@kubernetes`.
5. CloudTrail / Config as a dedicated security stack—not buried in app modules.

---

## Limitations

- Control Tower / SCPs may block resources the module expects.
- Provider lag: new AWS features may need temporary `aws_cli` / CloudFormation escape hatches—document and retire.
- `force-unlock` can corrupt state if another apply is live—verify first.
- Stop and ask if account ID, backend bucket, or apply approval is missing.

---

## Related Skills

- `@terraform` — language, state, and workflow fundamentals
- `@aws-cli` — imperative verify beside plan/apply
- `@pulumi` — alternative AWS IaC
- `@kubernetes` — EKS workloads after cluster module
- `@docker` / `@github-actions` — image + OIDC apply pipelines
- `@vault` — dynamic secrets vs static tfvars

---

## Agent Operational Directive

> **MANDATORY**: Pin provider/module versions. Use S3 remote state with `use_lockfile = true` (treat DynamoDB locking as legacy). Prefer OIDC/SSO/roles over access keys. Never commit secrets in `.tf`/`.tfvars`. Summarize create/update/**replace**/delete before apply; require explicit approval for destroy/replace of stateful resources. If account or backend is unclear, stop and ask.

---

## Source anchors (research)

- [Terraform S3 backend (use_lockfile; DynamoDB deprecated)](https://developer.hashicorp.com/terraform/language/backend/s3)
- [AWS Prescriptive Guidance: Terraform backend best practices](https://docs.aws.amazon.com/prescriptive-guidance/latest/terraform-aws-provider-best-practices/backend.html)
- [State lock ConditionalCheckFailed / force-unlock](https://stackoverflow.com/questions/62189825/error-acquiring-the-state-lock-conditionalcheckfailedexception)
