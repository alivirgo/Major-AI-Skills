---
name: terraform-aws
description: "Operational skill for AWS-focused Terraform: module layout, providers, IAM least privilege, state backends, and safe applies (complementary to general Terraform)."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["terraform", "aws", "modules", "iam", "infrastructure", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Terraform on AWS AI Skill Guide

## Overview & Engine Architecture

This skill specializes `@terraform` for AWS: provider configuration, reusable modules (VPC, ECS, RDS, IAM), remote state on S3 + DynamoDB locks, and tag/IAM conventions. Agents write least-privilege policies, avoid giant monolithic root modules, and never commit access keys. Prefer plan review in CI before apply.

```
Root module (env)
   -> child modules (network, data, app, iam)
       -> AWS provider resources
State: S3 backend + DynamoDB lock
CI: fmt/validate/plan (apply gated)
```

## When to use this skill

- Creating AWS modules for VPC, compute, data stores, IAM
- Wiring remote state and workspace/env separation
- Reviewing IAM policies and security group sprawl
- Migrating click-ops AWS into Terraform

## Operational directives

1. Pin `aws` provider and module versions; upgrade deliberately.
2. One AWS account/env per state (or clear workspace strategy); never mix prod/dev state.
3. IAM: prefer roles + policies with least actions/resources; no `*` in production without review.
4. Tag all resources with `Environment`, `Owner`, `Service`.
5. Secrets stay in SSM/Secrets Manager data sources - not `.tfvars` committed to git.

## Backend sketch

```hcl
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket         = "acme-tf-state"
    key            = "app/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "acme-tf-locks"
    encrypt        = true
  }
}
```

## IAM module sketch

```hcl
data "aws_iam_policy_document" "task" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::acme-app-config/*"]
  }
}
```

## AWS-specific pitfalls

| Pitfall | Result | Fix |
| --- | --- | --- |
| Inline giant IAM `*` policies | Blast radius | Scoped actions + resource ARNs |
| Hard-coded AZs/AMI IDs | Breaks across regions | Data sources / variables |
| Security groups referencing by name only | Flaky deps | Use IDs / module outputs |
| Apply from laptops to prod | Drift / no audit | CI OIDC role + required plan |

## Best practices

- Prefer AWS OIDC roles for CI over long-lived access keys.
- Use `terraform plan -out` artifacts reviewed before apply.
- Split state by blast radius (network vs app) when teams and rates of change differ.
- Enable AWS Config / CloudTrail outside Terraform or as a dedicated security stack.

## Limitations

- Account organization (Control Tower, SCPs) may block resources Terraform expects.
- Some AWS services lag provider support - check registry docs.
- Import of click-ops resources needs careful `terraform import` and drift checks.

## Related skills

- `@terraform` - core workflow, state, and language patterns
- `@aws-cli` / cloud skills - imperative debugging beside IaC
- `@gpg-signing` / `@github-actions` - signed tags and apply pipelines
