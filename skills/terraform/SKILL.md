---
name: terraform
description: "Operational skill for writing and reviewing Terraform HCL: providers, modules, remote state, plans, applies, and destructive-change safety."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["terraform", "iac", "hcl", "modules", "state", "cloud", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Terraform Infrastructure as Code AI Skill Guide

## Overview & Engine Architecture

Terraform declares cloud and SaaS resources in HCL and reconciles desired state through providers against **remote state**. A `plan` shows create/update/destroy; `apply` mutates the world. Agents write clear modules, treat state as sensitive, and refuse blind applies when the plan shows unexpected destroys.

```
*.tf / modules
    |
    v
terraform init  ->  providers + backend
    |
    v
terraform plan  ->  graph diff vs state
    |
    v
terraform apply ->  provider APIs (AWS/GCP/Azure/...)
    |
    v
remote state + lock (S3/Dynamo, GCS, Azure Blob, Terraform Cloud)
```

## When to use this skill

- Creating root modules or reusable child modules
- Reviewing PRs that change infrastructure
- Migrating resources, refactoring state addresses, or adding backends
- Catching destructive blast radius before apply

## Operational directives

1. Run `fmt` + `validate` before every plan in CI.
2. Require a human-readable plan artifact for production applies.
3. Mark secrets with `sensitive = true`; never commit `.tfstate` or credential files.
4. Prefer small modules with explicit variables/outputs over giant monoliths.
5. Use `prevent_destroy` lifecycle only with a documented escape hatch.

## Module sketch

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

variable "vpc_cidr" {
  type = string
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  tags = { Name = "main" }
}

output "vpc_id" {
  value = aws_vpc.main.id
}
```

## Safe command loop

```bash
terraform init -input=false
terraform fmt -check
terraform validate
terraform plan -out=tfplan
terraform show -no-color tfplan
# only after review:
terraform apply tfplan
```

## Plan review checklist

| Signal in plan | Action |
| --- | --- |
| `-/+` replace on DB / stateful store | Stop; confirm backup and maintenance window |
| Unexpected `destroy` count | Diff address moves; check `moved` blocks / refactor |
| Force-new on security group used broadly | Assess blast radius for connected ENIs |
| Provider version jump | Read changelog; re-plan in staging first |

## Best practices

- One state per environment (or Terraform Cloud workspace) - do not share prod/dev state.
- Pin provider major versions with pessimistic constraints.
- Prefer `for_each` over `count` when resources have stable keys.
- Document required IAM permissions for the runner role.

## Limitations

- Provider bugs and eventual consistency still require cloud console verification.
- Import and state surgery (`state mv/rm`) are high risk - snapshot state first.
- Policy-as-code (Sentinel/OPA) may reject plans this skill cannot override.

## Related skills

- `@kubernetes` - workloads once clusters exist
- `@ansible` - configuration after machines exist
- `@aws-cli` - imperative debugging alongside IaC
