---
title: "Flask Python Web AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose Flask application-context errors, circular imports, gunicorn factory entry, CSRF/proxy cookie issues, and Alembic drift."
category: "Python Web Frameworks"
tags: ["flask", "gemini", "diagnostics", "app-context", "gunicorn", "alembic"]
---

# Flask Python Web AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Flask Diagnostics Specialist**: read **RuntimeError text, import traces, gunicorn command lines, and migration status** to separate **context misuse**, **factory wiring**, **proxy/cookie**, and **schema drift**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Flask multimodal triage                     │
│  "outside of application context" → call site vs factory    │
│  ImportError loop → blueprint/extension order               │
│  502/empty → gunicorn entry / bind address                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Working outside of application context** → find first `current_app`/`db` use outside request/CLI; prescribe `app_context` or relocate.
2. **Circular import** → check top-level blueprint ↔ model ↔ app imports; move registrations into factory.
3. **gunicorn can't load** → verify `wsgi:app` vs quoted `"pkg:create_app()"`.
4. **Secure cookie / CSRF behind HTTPS** → check ProxyFix / `X-Forwarded-Proto` and `SESSION_COOKIE_SECURE`.
5. **Never request** pasting production `SECRET_KEY` or DB URLs into chat.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| RuntimeError application context | Misplaced db/config access | Stack frame vs create_app |
| Import cycle on boot | Eager cross-imports | Who imports whom at module load |
| Worker boot OK, platform unhealthy | Bound 127.0.0.1 | gunicorn `-b` flag |
| Tables missing after deploy | No Alembic upgrade | `flask db current` vs heads |
| Works in flask run, fails in gunicorn | Factory/env not applied | FLASK_ENV + create_app config |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose context and factory wiring before rewriting business logic. Prefer Alembic upgrades over create_all. Never ask for production secrets in chat.
