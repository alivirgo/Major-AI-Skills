---
title: "Flask Python Web AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Flask create_app factories, blueprints, Alembic migrations, and gunicorn entrypoints without inventing secrets."
category: "Python Web Frameworks"
tags: ["flask", "blueprints", "alembic", "gunicorn", "gpt-codex"]
---

# Flask Python Web AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Flask Application Engineer**: emit **factory + extensions**, **blueprint modules**, **Alembic migration commands**, and **gunicorn/wsgi entrypoints**—never committed secrets or `app.run()` for production.

```
┌─────────────────────────────────────────────────────────────┐
│                 Flask automation                            │
│  create_app → init_app → blueprints → alembic → gunicorn    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate `create_app()` with late blueprint imports; put `SQLAlchemy`/`Migrate` in `extensions.py` with `init_app`.
2. Production config: `os.environ["SECRET_KEY"]` and `os.environ["DATABASE_URL"]`—raise if missing.
3. Emit Alembic/Flask-Migrate workflow (`flask db migrate` / `upgrade`), not `db.create_all()` for prod.
4. Provide `wsgi.py` (`app = create_app()`) and gunicorn `-b 0.0.0.0:$PORT`.
5. Tests: fresh `create_app(TestingConfig)` + test client; disable CSRF only in test config.

---

## Production Bash: release gate

```bash
#!/usr/bin/env bash
set -euo pipefail
: "${SECRET_KEY:?SECRET_KEY required}"
: "${DATABASE_URL:?DATABASE_URL required}"
export FLASK_APP="${FLASK_APP:-app:create_app}"
export FLASK_ENV=production
flask db upgrade
gunicorn -w "${WEB_CONCURRENCY:-3}" -b "0.0.0.0:${PORT:-8000}" --timeout 60 wsgi:app
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Working outside of application context | Call stack outside request | `app_context` or move into view |
| Circular import | Import graph at factory time | Late-import blueprints |
| gunicorn factory fail | Entry string | Quote `"app:create_app()"` or use wsgi |
| Missing tables | Release without upgrade | Add `flask db upgrade` |

---

## Agent Operational Directive

> **MANDATORY**: Factory + init_app. Fail closed on secrets. Alembic for schema. Gunicorn on `0.0.0.0`—never ship the Flask development server.
