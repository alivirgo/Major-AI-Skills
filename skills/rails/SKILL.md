---
name: rails
description: "Ship Rails 8 apps with Active Record migrations, strong parameters, credentials/ENV secrets, Solid Queue workers, and Puma deploy patterns agents routinely miss."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["rails", "ruby", "activerecord", "solid-queue", "migrations", "puma", "credentials"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Ruby on Rails AI Skill Guide (Claude)

## Overview & Engine Architecture

Rails is **convention-over-configuration**: Router → Controller → Active Record → View/JSON. Schema changes ship only via **migrations**. Secrets live in **credentials** (`RAILS_MASTER_KEY`) or ENV—never plaintext in git. Rails 8 defaults production Active Job to **Solid Queue** (DB-backed); agents either run **`bin/jobs`** or enable the **Puma `solid_queue` plugin** with `SOLID_QUEUE_IN_PUMA`. Pair primary DB with `@postgresql` (or SQLite for small apps) and optional `@redis` only when you choose Redis adapters/cache deliberately.

```
┌─────────────────────────────────────────────────────────────┐
│                 Rails request + job topology                  │
│                                                             │
│  Client → reverse proxy / LB (@nginx)                       │
│       → Puma (web)                                          │
│       → Router → Controller (strong params)                 │
│            ├── Active Record → primary DB (@postgresql)     │
│            └── render JSON / HTML (Hotwire optional)        │
│                                                             │
│  Active Job                                                 │
│  ├── adapter: solid_queue (Rails 8 prod default)            │
│  ├── queue DB (database.yml :queue)                         │
│  └── bin/jobs  OR  Puma plugin (SOLID_QUEUE_IN_PUMA)        │
│                                                             │
│  Secrets: credentials.yml.enc + RAILS_MASTER_KEY / ENV      │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Building Rails APIs or full-stack apps with Active Record and migrations.
- Configuring Solid Queue / Active Job, credentials, and Puma production boots.
- Killing N+1 and mass-assignment bugs (strong params, `includes`).

**Do not use when**

- The service is a minimal Node/Java API with no Rails conventions → `@express` / `@spring-boot` / `@fastapi`.
- Someone asks to commit `config/master.key`, raw credentials YAML, or skip strong params → refuse.
- Ops-only Postgres tuning with no Rails app → `@postgresql`.

---

## Operational Capabilities & Agent Directives

1. **Stay on rails**: prefer generators (`bin/rails g model|migration|controller`) then edit; keep folder conventions.
2. **Strong parameters always**: `params.require(…).permit(…)`; never mass-assign raw `params`.
3. **Migrations only**: review for locks; use `disable_ddl_transaction!` + concurrent indexes on Postgres when needed; no hand-editing prod schema.
4. **Secrets**: `Rails.application.credentials` / ENV; set `RAILS_MASTER_KEY` in deploy—never invent or commit master keys.
5. **N+1**: `includes` / `preload` / `eager_load` on list endpoints; add Bullet or query assertions in tests.
6. **Jobs off-request**: Active Job for email, webhooks, fan-out; configure Solid Queue DB + `bin/jobs` (or Puma plugin) in prod.
7. **Boot checklist**: `bin/rails db:prepare`, assets/Propshaft/importmap as configured, `RAILS_ENV=production` with `SECRET_KEY_BASE` or credentials present.

---

## Production Example: API create + Solid Queue + credentials

Controller + model:

```ruby
# app/controllers/items_controller.rb
class ItemsController < ApplicationController
  def create
    item = Item.new(item_params)
    if item.save
      OrderMailer.receipt(item).deliver_later
      render json: item, status: :created
    else
      render json: { errors: item.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def item_params
    params.require(:item).permit(:sku, :qty)
  end
end

# app/models/item.rb
class Item < ApplicationRecord
  validates :sku, presence: true, length: { maximum: 64 }
  validates :qty, numericality: { greater_than_or_equal_to: 0 }
end
```

`config/database.yml` (Postgres + queue DB — passwords from ENV):

```yaml
production:
  primary: &primary_production
    adapter: postgresql
    encoding: unicode
    url: <%= ENV["DATABASE_URL"] %>
  queue:
    <<: *primary_production
    url: <%= ENV.fetch("QUEUE_DATABASE_URL", ENV["DATABASE_URL"]) %>
    migrations_paths: db/queue_migrate
```

`config/environments/production.rb` (Rails 8 style):

```ruby
config.active_job.queue_adapter = :solid_queue
config.solid_queue.connects_to = { database: { writing: :queue } }
```

`config/puma.rb` (small deploys):

```ruby
plugin :solid_queue if ENV["SOLID_QUEUE_IN_PUMA"]
```

Commands:

```bash
bin/rails db:migrate
bin/rails db:prepare          # ensures queue schema too
bin/rails credentials:edit    # needs local master.key — do not commit
RAILS_ENV=production bin/rails assets:precompile
RAILS_ENV=production bin/rails s   # or puma -C config/puma.rb
# dedicated worker: bin/jobs
# tests: bin/rails test
```

N+1 fix:

```ruby
# bad: Item.all.each { |i| i.account.name }
Item.includes(:account).limit(100)
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `ActiveSupport::MessageEncryptor::InvalidMessage` / can't decrypt | Wrong/missing `RAILS_MASTER_KEY` | Set key from secure store matching `credentials` env |
| Jobs enqueued but never run | No `bin/jobs` / Solid Queue plugin; queue DB missing | Start workers; `db:prepare` on queue DB |
| Puma boot fails with Solid Queue in dev | Plugin always on | Gate with `SOLID_QUEUE_IN_PUMA` |
| `ActiveRecord::PendingMigrationError` | Migrate not run | `db:migrate` / `db:prepare` in release |
| Mass-assignment / unexpected attrs | Skipped strong params | `permit` allowlist |
| Slow index actions | N+1 | `includes` / counter caches / indexes (`@postgresql`) |
| PG lock timeout on migrate | Long index in transaction | Concurrent index migration pattern |
| Credentials edit opens empty/fails | Missing `config/master.key` | Load key from secrets manager locally—never invent |

---

## Best Practices

1. Thin controllers; service objects / form objects for multi-model writes; callbacks sparingly.
2. Request/system specs for critical flows; factory_bot over fixtures when team-standard.
3. `belongs_to` required by default—set `optional: true` deliberately.
4. For Redis Sidekiq stacks (pre-Solid Queue), document adapter + `@redis` topology explicitly.
5. Kamal/`@docker` images: pass `RAILS_MASTER_KEY`, run migrations as a release step, separate worker process when jobs are heavy.
6. Never log params that include passwords/tokens; filter with `config.filter_parameters`.

---

## Limitations

- Hotwire/Turbo vs API-only modes change front-end assumptions—confirm mode before generating views.
- Solid Queue / Solid Cache / Solid Cable may mean **multiple databases** in Rails 8—provision each.
- Engines and packwerk-style modularization are team-specific.
- Stop and ask if `RAILS_MASTER_KEY`, queue DB URL, or worker topology is missing.

---

## Related Skills

- `@postgresql` — primary store, indexes, concurrent migrations
- `@redis` — optional cache/Sidekiq when not on Solid defaults
- `@docker` — Puma + jobs containers, persistent volumes for SQLite/storage
- `@nginx` — TLS and upstream to Puma
- `@graphql-apis` — GraphQL on Rails when REST is insufficient

---

## Agent Operational Directive

> **MANDATORY**: Strong params on every write. Migrations only for schema. Never invent or commit `RAILS_MASTER_KEY` / credentials plaintext. Configure Solid Queue (or documented adapter) with a running worker (`bin/jobs` or Puma plugin). Fix N+1 on list endpoints. Validate with `db:prepare` + boot under `RAILS_ENV=production` settings before declaring deploy success.

---

## Source anchors (research)

- [Active Job / Solid Queue (Rails Guides)](https://guides.rubyonrails.org/active_job_basics.html)
- [rails/solid_queue README](https://github.com/rails/solid_queue)
- Rails 8: queue DB in `database.yml` + `bin/jobs` or `SOLID_QUEUE_IN_PUMA`
