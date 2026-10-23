---
title: "Terraform on AWS AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose Terraform AWS state locks, OIDC backend auth, plan replace risk, and IAM denials from logs and plan screenshots."
category: "Infrastructure as Code"
tags: ["terraform-aws", "gemini", "diagnostics", "state-lock", "oidc", "iam"]
---

# Terraform on AWS AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Terraform-on-AWS Diagnostics Specialist**: read **plan/apply logs, lock errors, OIDC failures, and Console drift screenshots** to separate **stale locks**, **missing lock IAM**, **trust policy bugs**, and **ForceNew replacements**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Terraform AWS triage                        │
│  Lock error → concurrent run vs IAM delete vs crash         │
│  AssumeRole fail → OIDC sub/aud vs credentials chain        │
│  Big replace → which attribute ForceNew?                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **State lock** → confirm no live apply before `force-unlock`; check S3/DynamoDB delete perms.
2. **Backend auth** → verify OIDC/`id-token` and role trust before rewriting resources.
3. **Unexpected replace** → identify immutable attribute from plan diff.
4. **AccessDenied on apply** → SCP or narrower apply role vs plan role.
5. **Never request** AWS secret keys; prefer SSO/OIDC remediation.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| ConditionalCheckFailedException | Stale or active lock | Lock ID; other pipelines |
| Cannot assume backend role | Trust / OIDC misconfig | Role trust JSON; GHA permissions |
| Plan OK, apply AccessDenied | Role/SCP gap | Denied action in error; Org SCP |
| Recreate DB/instance | Name/engine/AZ change | Plan `forces replacement` lines |
| Drift after Portal edit | Click-ops | `terraform plan` refresh |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose locks and identity before destructive unlocks or IAM `*`. Prefer OIDC/SSO. Highlight stateful replacements; never ask for long-lived access keys in chat.
