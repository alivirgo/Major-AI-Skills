---
name: flask
description: "Ship Flask apps with application factories, blueprints, Alembic migrations, env-backed secrets, and gunicorn workers agents routinely miswire."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["flask", "python", "blueprints", "wsgi", "alembic", "gunicorn", "sqlalchemy"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Flask Python Web AI Skill Guide (Claude)

## Overview & Engine Architecture

Flask is a **WSGI microframework**: explicit **application factories**, **blueprints**, and a **request/app context** stack. Extensions (`db`, migrate, CSRF) are constructed once and bound with `init_app(app)`. Production traffic runs under **gunicorn** (or similar)—never `flask run` / `app.run()`. Agents fail closed on missing `SECRET_KEY` / `DATABASE_URL` in prod, push `app_context()` only when configuring, and keep Celery/RQ workers out of the request path.

```
┌─────────────────────────────────────────────────────────────┐
│                 Flask factory → WSGI workers                  │
│                                                             │
│  gunicorn "app:create_app()" / wsgi:app                     │
│       → create_app(config)                                  │
│            ├── config from env (SECRET_KEY, DATABASE_URL)   │
│            ├── extensions.init_app(app)                     │
│            ├── blueprints (api / web / admin)               │
│            └── errorhandlers / CLI                          │
│                                                             │
│  Request: app context + request context → view              │
│       ├── SQLAlchemy / Alembic → @postgresql                │
│       ├── sessions / rate limits → @redis (optional)        │
│       └── background jobs → Celery/RQ worker                │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Building small-to-medium Python HTTP APIs or Jinja apps with clear module boundaries.
- Structuring factories, blueprints, and Flask-SQLAlchemy + Alembic migrations.
- Debugging “Working outside of application context” and extension init order.

**Do not use when**

- You need async-first OpenAPI generation and Pydantic-native validation as defaults → `@fastapi`.
- You need a full admin/ORM batteries stack → `@django`.
- Someone asks to hardcode `SECRET_KEY` or ship the development server to prod → refuse.

---

## Operational Capabilities & Agent Directives

1. **Always use `create_app()`** so tests/CLI/gunicorn construct isolated apps; avoid import-time global `app` for anything non-trivial.
2. **Extensions pattern**: module-level `db = SQLAlchemy()` then `db.init_app(app)` inside the factory; register blueprints after config.
3. **Prod secrets fail closed**: `SECRET_KEY = os.environ["SECRET_KEY"]` in production config—no `"dev"` fallback.
4. **Migrations via Alembic** (Flask-Migrate): generate → review SQL → upgrade in release jobs; never “create_all” as the prod schema strategy.
5. **Context discipline**: access `current_app` / `g` only in request/CLI; during setup use `with app.app_context(): …`.
6. **Production server**: `gunicorn -w 2-4 -b 0.0.0.0:$PORT "app:create_app()"` (or `wsgi:app`); set proxy-fix headers when behind TLS LB.
7. **Async/workers**: long I/O → Celery/RQ with `@redis`; Flask async views exist but most extensions remain sync-first.

---

## Production Example: factory + Alembic + gunicorn

`app/extensions.py`:

```python
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_wtf import CSRFProtect
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
migrate = Migrate()
csrf = CSRFProtect()
```

`app/config.py`:

```python
import os

class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024

class ProductionConfig(Config):
    DEBUG = False
    SECRET_KEY = os.environ["SECRET_KEY"]
    SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]
    SESSION_COOKIE_SECURE = True
```

`app/__init__.py`:

```python
import os
from flask import Flask, jsonify
from .extensions import db, migrate, csrf
from .config import ProductionConfig, Config

def create_app(config_object: type[Config] | None = None) -> Flask:
    app = Flask(__name__)
    cfg = config_object or (
        ProductionConfig if os.environ.get("FLASK_ENV") == "production" else Config
    )
    app.config.from_object(cfg)

    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)

    from .blueprints.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.get("/health")
    def health():
        return jsonify(ok=True)

    return app
```

`wsgi.py`:

```python
from app import create_app
app = create_app()
```

Commands:

```bash
export FLASK_APP="app:create_app"
flask db migrate -m "add items"
flask db upgrade
pytest -q
gunicorn -w 3 -b 0.0.0.0:${PORT:-8000} --timeout 60 wsgi:app
# or: gunicorn -w 3 -b 0.0.0.0:8000 "app:create_app()"
```

Blueprint validation sketch:

```python
from flask import Blueprint, jsonify, request
from .extensions import db
from .models import Item

bp = Blueprint("api", __name__)

@bp.post("/items")
def create_item():
    body = request.get_json(silent=True) or {}
    sku = body.get("sku")
    if not isinstance(sku, str) or not sku:
        return jsonify(error="sku required"), 400
    item = Item(sku=sku)
    db.session.add(item)
    db.session.commit()
    return jsonify(id=item.id, sku=item.sku), 201
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `Working outside of application context` | Used `current_app`/db outside request/CLI | Move into view/CLI or `with app.app_context()` |
| Circular import on startup | Blueprint imports app/models at module top incorrectly | Late-import blueprints inside factory; extensions module |
| gunicorn can't find app with factory | Wrong callable string | `wsgi:app` or quoted `"pkg:create_app()"` |
| CSRF / session failures behind HTTPS proxy | Cookie Secure + missing proxy headers | `SESSION_COOKIE_SECURE`; ProxyFix / X-Forwarded-Proto |
| Schema drift / missing tables | Relying on `db.create_all()` in prod | Alembic `upgrade` in release pipeline |
| `SECRET_KEY` weak or default in prod | Dev fallback left on | Fail closed with `os.environ["SECRET_KEY"]` |
| SQLite locks under gunicorn workers | File DB + multiple writers | Move to `@postgresql`; tune workers |
| Tests leak state between cases | Shared global app | `create_app(TestingConfig)` per test + fresh DB |

---

## Best Practices

1. Config classes: `Development` / `Testing` / `Production`; tests use in-memory SQLite or disposable Postgres.
2. JSON APIs: consistent error JSON + status codes; validate body before persistence.
3. Enable CSRF for cookie-session form posts; disable only in explicit test config.
4. Central exception logging once; avoid duplicate handlers that swallow stack traces.
5. Health endpoint for Compose/K8s probes (`@docker`); readiness may check DB ping separately.
6. Document required env vars; refuse inventing credentials in samples.

---

## Limitations

- Async views in modern Flask do not make the ecosystem async-native; prefer workers for heavy I/O.
- Large OpenAPI-centric services may fit `@fastapi` better.
- Multi-app factories need careful extension lifecycle—do not share one bound `db` across conflicting configs without design.
- Stop and ask if broker topology, migration ownership, or prod secret source is unclear.

---

## Related Skills

- `@fastapi` — async-first alternative for OpenAPI-heavy APIs
- `@postgresql` — production database behind SQLAlchemy
- `@redis` — cache, sessions, Celery/RQ broker
- `@docker` — gunicorn image + Compose healthchecks
- `@django` — batteries-included alternative when admin/ORM conventions dominate

---

## Agent Operational Directive

> **MANDATORY**: Use application factories + `init_app`. Never hardcode production `SECRET_KEY` or DB URLs. Schema changes go through Alembic in release jobs. Serve with gunicorn on `0.0.0.0`, not the Flask dev server. Fix context errors with proper request/CLI boundaries—not global app hacks.

---

## Source anchors (research)

- [Flask application factories](https://flask.palletsprojects.com/en/stable/patterns/appfactories/)
- [Flask application context](https://flask.palletsprojects.com/en/stable/appcontext/)
- Gunicorn factory entry: `gunicorn "pkg:create_app()"` or `wsgi:app`
