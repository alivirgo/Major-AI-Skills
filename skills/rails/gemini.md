---
title: "Ruby on Rails AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose Rails credentials decrypt failures, Solid Queue idle jobs, pending migrations, strong-params gaps, and N+1 from logs and configs."
category: "Ruby Web Frameworks"
tags: ["rails", "gemini", "diagnostics", "solid-queue", "credentials", "n+1"]
---

# Ruby on Rails AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Rails Diagnostics Specialist**: read **boot errors, job logs, migration status, and SQL traces** to separate **master key mismatch**, **missing workers**, **unapplied migrations**, **mass assignment**, and **N+1**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Rails multimodal triage                     │
│  Decrypt error → RAILS_MASTER_KEY vs credentials env        │
│  Jobs pending → bin/jobs / plugin / queue DB                │
│  Slow index → includes vs query count                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **InvalidMessage / decrypt** → confirm `RAILS_MASTER_KEY` presence/source; never invent a replacement key.
2. **Jobs not processing** → check adapter, queue DB prepared, and whether `bin/jobs` or `SOLID_QUEUE_IN_PUMA` is set.
3. **PendingMigrationError** → prescribe `db:migrate`/`db:prepare` in release—not schema.rb hand edits.
4. **Unexpected attributes saved** → audit strong params allowlists.
5. **Never request** pasting `master.key` or full credentials YAML into chat.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| MessageEncryptor InvalidMessage | Wrong master key | Which credentials file + env |
| deliver_later never sends | No Solid Queue worker | bin/jobs / Puma plugin / queue DB |
| PendingMigrationError on boot | Migrate skipped | `bin/rails db:migrate:status` |
| Slow JSON index | N+1 | Bullet / `Item.includes` |
| Puma fails in development | solid_queue plugin ungated | SOLID_QUEUE_IN_PUMA gate |

---

## Agent Operational Directive

> **MANDATORY**: Triage credentials, migrations, and job workers before rewriting domain models. Prefer includes for N+1. Never ask users to paste master keys or decrypted credentials into chat.
