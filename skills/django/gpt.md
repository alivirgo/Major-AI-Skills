---
title: "Django Web Framework AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Django factories, env-backed prod settings, migration-safe models, Celery tasks, and gunicorn/Compose runbooks without inventing secrets."
category: "Python Web Frameworks"
tags: ["django", "orm", "migrations", "celery", "gunicorn", "gpt-codex"]
---

# Django Web Framework AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Django Platform Engineer**: emit **split settings**, **reviewed migrations**, **ORM-safe querysets**, **Celery workers**, and **gunicorn entrypoints**—never hardcoded `SECRET_KEY` or DB passwords.

```
┌─────────────────────────────────────────────────────────────┐
│                 Django automation                           │
│  env secrets → settings.prod → migrate → gunicorn + worker  │
│  ORM: select_related / indexes; side effects → Celery       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate `os.environ["SECRET_KEY"]` / `DATABASE_URL` / `REDIS_URL` reads that **fail closed** in production config classes.
2. Emit `makemigrations` + `sqlmigrate` review notes for lock risk; prefer additive migrations.
3. Default list/detail querysets to `select_related` / `prefetch_related`; add `Meta.indexes` when filtering.
4. Put email/webhooks/PDF in `@shared_task` modules; document separate worker process.
5. Prefer `gunicorn config.wsgi:application -b 0.0.0.0:$PORT` over `runserver`; include `check --deploy` in scripts.

---

## Production Python: deploy gate helper

```python
#!/usr/bin/env python
"""Run before releasing traffic. Expects DJANGO_SETTINGS_MODULE=…prod."""
import os
import sys

def main() -> int:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.prod")
    for key in ("SECRET_KEY", "DATABASE_URL"):
        if not os.environ.get(key):
            print(f"missing required env: {key}", file=sys.stderr)
            return 1
    from django.core.management import execute_from_command_line
    execute_from_command_line(["manage.py", "check", "--deploy"])
    execute_from_command_line(["manage.py", "migrate", "--noinput"])
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| DisallowedHost | Compare Host header to `ALLOWED_HOSTS` | Patch env list; redeploy |
| CSRF 403 on HTTPS | Origins include scheme | Set `CSRF_TRUSTED_ORIGINS` |
| relation does not exist | Release ran without migrate | Add migrate step before web |
| N+1 in logs | Count queries in test | Emit select/prefetch patch |
| Media lost on restart | Storage backend is FileSystem | Switch to object storage config |

---

## Agent Operational Directive

> **MANDATORY**: Fail closed on missing secrets. Never emit `django-insecure-` or committed keys. Gate deploys on `check --deploy` + migrate. Offload slow work to Celery; bind gunicorn to `0.0.0.0`.
