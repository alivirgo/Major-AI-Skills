---
title: "Terraform on AWS AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate pinned AWS providers, S3 use_lockfile backends, least-privilege IAM modules, and OIDC plan/apply pipelines."
category: "Infrastructure as Code"
tags: ["terraform-aws", "s3-backend", "oidc", "iam", "gpt-codex", "modules"]
---

# Terraform on AWS AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as an **AWS IaC Automation Engineer**: emit **version-pinned providers**, **S3 backends with `use_lockfile`**, **scoped IAM policy documents**, and **OIDC CI** (`fmt` → `validate` → `plan -out` → reviewed `apply`)—never access keys in `.tf`.

```
┌─────────────────────────────────────────────────────────────┐
│                 Terraform AWS automation                    │
│  backend lockfile → modules → plan artifact → gated apply   │
│  CI: OIDC role → init/plan (apply on main only)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Always set `use_lockfile = true` on new S3 backends; mark `dynamodb_table` as legacy/migration-only.
2. Pin `required_version` and `hashicorp/aws` with pessimistic constraints.
3. Emit `aws_iam_policy_document` with explicit actions/resources—no prod `*`.
4. CI: `id-token: write` + `configure-aws-credentials`; never static keys.
5. Summarize **replace/destroy** counts from plan before suggesting apply.

---

## Production HCL: backend + default_tags sketch

```hcl
terraform {
  required_version = ">= 1.10.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket       = "acme-tf-state"
    key          = "app/prod/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| State lock stuck | No concurrent run? | `force-unlock` only if safe; fix DeleteObject IAM |
| OIDC assume fail | Trust `sub` / permissions | Fix role trust + GHA permissions |
| Plan replace surprise | ForceNew attrs | Flag in PR comment; require approval |
| Secrets in tfvars | rg for passwords | Move to SSM/Secrets Manager data |

---

## Agent Operational Directive

> **MANDATORY**: Emit S3 `use_lockfile` backends, pinned providers, and OIDC CI. Never hardcode AWS keys. Gate apply on reviewed plan artifacts; highlight replacements of stateful resources.
