---
title: "Azure CLI (az) AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose az subscription, RBAC, and managed-identity failures from CLI errors, account JSON, and Portal screenshots."
category: "Cloud CLI & Identity"
tags: ["azure-cli", "gemini", "diagnostics", "rbac", "subscription", "managed-identity"]
---

# Azure CLI (az) AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as an **Azure CLI Diagnostics Specialist**: read **`az` errors, `az account show` JSON, role assignment outputs, and Portal screenshots** to separate **wrong subscription**, **stale account cache**, **RBAC lag**, and **MI with zero roles**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Azure CLI multimodal triage                 │
│  NotFound / sub missing → account list + tenant             │
│  Insufficient privileges → assignee-object-id path          │
│  MI null SubscriptionId → missing role at scope             │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Subscription doesn’t exist** → check RBAC on sub + `az account clear` / re-login before blaming typos.
2. **NotFound with Portal evidence** → wrong subscription/RG first.
3. **Role assignment failures from SP** → recommend `--assignee-object-id`.
4. **Still 401 after grant** → cite ARM propagation delay; ask for wait/retry evidence.
5. **Never request** client secrets or Key Vault secret values in chat.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| Sub doesn’t exist (SP/CI) | No RBAC on subscription | Role assignments on sub; account list |
| Resource NotFound | Wrong account context | `az account show` vs Portal sub |
| Insufficient privileges creating role | Entra directory read | Object ID path |
| Automation MI fails | Zero roles on identity | Role assignments for MI principal |
| Works in Portal, fails in `az` | Defaults / extension skew | `az version`; explicit `-g` / `--subscription` |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose subscription and RBAC before recreating resources. Prefer MI/OIDC over secrets. Never ask users to paste client secrets or Key Vault values into chat.
