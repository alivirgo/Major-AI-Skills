---
name: django
description: "Ship Django apps with env-backed secrets, safe migrations, ORM N+1 hygiene, Celery/Redis workers, and gunicorn/ASGI deploy settings agents routinely misconfigure."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["django", "orm", "python", "migrations", "celery", "gunicorn", "postgresql", "security"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Django Web Framework AI Skill Guide (Claude)

## Overview & Engine Architecture

Django is a batteries-included Python web framework: **ORM + migrations**, **URLconf**, **middleware**, **forms/admin**, and optional **ASGI** for async. Requests enter via WSGI/ASGI (gunicorn / uvicorn), pass middleware, resolve to views, and hit the ORM or cache. Agents treat `SECRET_KEY` / DB URLs as **runtime secrets**, review every migration for locks, kill N+1 with `select_related`/`prefetch_related`, and never leave `DEBUG=True` or `runserver` in production.

```
┌─────────────────────────────────────────────────────────────┐
│                 Django request → response                     │
│                                                             │
│  Client → reverse proxy (@nginx / LB)                       │
│       → gunicorn (WSGI) or uvicorn (ASGI)                   │
│       → middleware (Security / CSRF / Auth / Session)       │
│       → URLconf → view / DRF viewset                        │
│            ├── ORM → @postgresql (conn pool / indexes)      │
│            ├── cache / sessions → @redis (optional)         │
│            └── templates / JSON serializers                 │
│                                                             │
│  Side paths                                                 │
│  ├── manage.py migrate / collectstatic / check --deploy     │
│  └── Celery / RQ workers → broker (@redis) + result backend │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Building server-rendered or API-backed Django apps (admin, forms, ORM-first domains).
- Designing models, migrations, and query performance fixes.
- Hardening deploy settings (`check --deploy`, HTTPS/proxy headers, static files).

**Do not use when**

- You need an async-native OpenAPI-first microservice with minimal batteries → `@fastapi`.
- The task is only raw SQL / indexing with no Django app → `@postgresql`.
- Someone asks to commit `SECRET_KEY`, DB passwords, or leave `DEBUG=True` in prod → refuse; use env / `@vault`.

---

## Operational Capabilities & Agent Directives

1. **Secrets from env**: `SECRET_KEY = os.environ["SECRET_KEY"]` (fail closed in prod). Use `SECRET_KEY_FALLBACKS` only during planned rotation; never invent or commit keys.
2. **Deploy gate**: run `python manage.py check --deploy` against the production settings module before calling a deploy “done”.
3. **Hosts & CSRF**: explicit `ALLOWED_HOSTS`; set `CSRF_TRUSTED_ORIGINS` to full HTTPS origins (`https://app.example.com`). Behind TLS terminators set `SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")`.
4. **Migrations are code**: `makemigrations` → review SQL (`sqlmigrate`) for long locks → `migrate`. Prefer expand/contract for zero-downtime; never hand-edit prod schema.
5. **ORM hygiene**: default to `select_related` / `prefetch_related`; add `Meta.indexes` for filter/sort columns; use `iterator()` for huge scans.
6. **Workers off-request**: email, webhooks, PDF, and bulk work go to Celery/RQ (`@redis` broker)—do not block the request thread.
7. **Static & media**: `collectstatic` in CI/image build; WhiteNoise or CDN for static; object storage for uploads (ephemeral containers lose local media).

---

## Production Example: settings + model + gunicorn + Celery

`config/settings/prod.py` (excerpt — no secrets in git):

```python
import os
import dj_database_url

DEBUG = False
SECRET_KEY = os.environ["SECRET_KEY"]
ALLOWED_HOSTS = [h for h in os.environ.get("ALLOWED_HOSTS", "").split(",") if h]
CSRF_TRUSTED_ORIGINS = [o for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",") if o]

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

DATABASES = {
    "default": dj_database_url.config(
        conn_max_age=600,
        conn_health_checks=True,
        ssl_require=os.environ.get("DB_SSL", "true").lower() == "true",
    )
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": os.environ["REDIS_URL"],
    }
}

CELERY_BROKER_URL = os.environ["REDIS_URL"]
CELERY_RESULT_BACKEND = os.environ["REDIS_URL"]
```

Model + query pattern:

```python
from django.db import models

class Order(models.Model):
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.PROTECT, related_name="orders"
    )
    status = models.CharField(max_length=32, db_index=True)
    total_cents = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["customer", "-created_at"])]

# N+1 fix
orders = Order.objects.select_related("customer").filter(status="open")
```

Celery task (worker process):

```python
from celery import shared_task

@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def send_order_receipt(self, order_id: int) -> None:
    # load Order, render email, send — never invent SMTP credentials in code
    ...
```

Validation / run loop:

```bash
export DJANGO_SETTINGS_MODULE=config.settings.prod
python manage.py check --deploy
python manage.py makemigrations --check --dry-run
python manage.py migrate --noinput
python manage.py collectstatic --noinput
gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 60
# separate process: celery -A config worker -l info
```

Compose with readiness (pair `@docker` + `@postgresql`):

```yaml
# excerpt — secrets via env/files, never baked into image
services:
  web:
    command: gunicorn config.wsgi:application -b 0.0.0.0:8000
    environment:
      DATABASE_URL: postgres://app@db:5432/app
      REDIS_URL: redis://redis:6379/0
    depends_on:
      db: { condition: service_healthy }
  worker:
    command: celery -A config worker -l info
    depends_on: [web, redis]
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `DisallowedHost` / Invalid HTTP_HOST | Host not in `ALLOWED_HOSTS` | Add exact hostname; fix proxy Host header |
| `403 CSRF verification failed` on HTTPS forms | Missing `CSRF_TRUSTED_ORIGINS` or wrong scheme | Add `https://…` origins; set proxy SSL header |
| `django-insecure-` / `check --deploy` W009 | Default or short `SECRET_KEY` | Generate long random key from secrets manager / env |
| `relation "…" does not exist` | Migrations not applied | `migrate --noinput` in release job before traffic |
| Pages without CSS/JS | `collectstatic` skipped or WhiteNoise/CDN miswired | Run collectstatic in build; verify `STATIC_ROOT` / middleware order |
| Slow list endpoints / many queries | N+1 ORM access | `select_related` / `prefetch_related`; `assertNumQueries` in tests |
| Uploads vanish after redeploy | Local disk in ephemeral container | S3/GCS (or volume) for `MEDIA`; not container FS |
| gunicorn binds but platform never healthy | Bound to `127.0.0.1` | Bind `0.0.0.0:$PORT` |
| Build `KeyError: SECRET_KEY` on collectstatic | Settings require secret at import during build | Placeholder build-time env or lazy settings for static-only |

---

## Best Practices

1. Split settings (`base` / `dev` / `prod` / `test`); prod fails closed on missing env.
2. Prefer `TestCase` + factories; use `TransactionTestCase` only when transactions must commit.
3. Constrain Django admin to staff; audit dangerous admin actions; MFA at the IdP edge when possible.
4. Use `CONN_MAX_AGE` / PgBouncer thoughtfully with serverless or many workers (`@postgresql`).
5. Pin deps in lockfiles; run migrations as an explicit release step, not “hope on boot” across many replicas.
6. Log structured request IDs; never log passwords, tokens, or full `Authorization` headers.

---

## Limitations

- Async views/ORM coverage depends on Django version and DB driver; many apps stay sync WSGI + Celery.
- Django REST Framework is a large adjacent surface—treat serializers/permissions as first-class, not an afterthought.
- Multi-tenant (schema vs row) designs need explicit strategy; Django does not provide one out of the box.
- Stop and ask if prod `SECRET_KEY`, migration blast radius, or worker/broker topology is unclear.

---

## Related Skills

- `@postgresql` — indexes, locks, connection pooling behind the ORM
- `@redis` — cache, sessions, Celery/RQ broker
- `@docker` — multi-stage images, Compose healthchecks for web/db/worker
- `@fastapi` — lighter async API alternative when Django batteries are excess
- `@nginx` — TLS termination and static/ upstream in front of gunicorn

---

## Agent Operational Directive

> **MANDATORY**: Never invent or commit `SECRET_KEY` / DB credentials. Production means `DEBUG=False`, explicit `ALLOWED_HOSTS`, HTTPS CSRF origins, and `check --deploy`. Review migration SQL for locks; fix N+1 before merging list endpoints. Offload slow work to workers (`@redis`). Validate with migrate + collectstatic + gunicorn bind checks—not `runserver`.

---

## Source anchors (research)

- [Django deployment checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/)
- [OWASP Django Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Django_Security_Cheat_Sheet.html)
- Common deploy failures: `DisallowedHost`, CSRF 403 without `CSRF_TRUSTED_ORIGINS`, missing migrate, `127.0.0.1` bind, ephemeral media
