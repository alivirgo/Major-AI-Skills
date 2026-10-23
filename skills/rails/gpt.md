---
title: "Ruby on Rails AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Rails migrations, strong params controllers, credentials/ENV wiring, and Solid Queue worker runbooks without inventing master keys."
category: "Ruby Web Frameworks"
tags: ["rails", "solid-queue", "activerecord", "credentials", "gpt-codex"]
---

# Ruby on Rails AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Rails Application Engineer**: emit **strong-params controllers**, **reviewed migrations**, **Solid Queue DB config**, and **Puma/`bin/jobs` entrypoints**—never committed `master.key` or plaintext credentials.

```
┌─────────────────────────────────────────────────────────────┐
│                 Rails automation                            │
│  strong params → AR → deliver_later                         │
│  queue DB + bin/jobs (or SOLID_QUEUE_IN_PUMA)               │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Always generate `permit` allowlists for create/update actions.
2. Emit migrations via generators; annotate lock risk for Postgres indexes.
3. Wire `config.active_job.queue_adapter = :solid_queue` + `connects_to` queue DB for Rails 8 prod.
4. Document `RAILS_MASTER_KEY` from secrets manager—placeholder comments only, no fake keys.
5. Prefer `includes` on index/show association payloads; put mailers on `deliver_later`.

---

## Production Bash: release + workers

```bash
#!/usr/bin/env bash
set -euo pipefail
: "${RAILS_MASTER_KEY:?RAILS_MASTER_KEY required}"
: "${DATABASE_URL:?DATABASE_URL required}"
export RAILS_ENV=production
bin/rails db:prepare
bin/rails assets:precompile
# web: bundle exec puma -C config/puma.rb
# worker (if not SOLID_QUEUE_IN_PUMA): bin/jobs
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| InvalidMessage decrypt | Master key mismatch | Fix RAILS_MASTER_KEY source |
| Jobs stuck | Worker process | Start bin/jobs or enable plugin |
| PendingMigrationError | Release skipped migrate | db:prepare before boot |
| N+1 in logs | Association access | includes/preload |

---

## Agent Operational Directive

> **MANDATORY**: Strong params; migration-only schema; no invented master keys. Ensure Solid Queue workers run in production. Fix N+1 on list endpoints.
