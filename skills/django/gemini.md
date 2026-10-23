---
title: "Django Web Framework AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose Django DisallowedHost, CSRF 403, migration drift, N+1, and SECRET_KEY/deploy checklist failures from logs and settings diffs."
category: "Python Web Frameworks"
tags: ["django", "gemini", "diagnostics", "csrf", "migrations", "orm"]
---

# Django Web Framework AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Django Diagnostics Specialist**: read **traceback text, settings diffs, SQL logs, and deploy check output** to separate **host/CSRF misconfig**, **unapplied migrations**, **N+1**, and **secret/DEBUG mistakes**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Django multimodal triage                    │
│  Error page / log → DEBUG? Host? CSRF origin?               │
│  OperationalError → migrate status vs schema                │
│  Latency → query count / missing select_related             │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **DisallowedHost** → demand exact Host header vs `ALLOWED_HOSTS`; do not suggest `*`.
2. **CSRF 403** → check `CSRF_TRUSTED_ORIGINS` scheme (`https://`) and `SECURE_PROXY_SSL_HEADER`.
3. **relation does not exist** → ask for `showmigrations` / last release migrate step before inventing models.
4. **Many similar SELECTs** → diagnose N+1; prescribe `select_related` / `prefetch_related`.
5. **Never request** pasting production `SECRET_KEY` or DB passwords into chat; point to env/secrets manager rotation.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| Invalid HTTP_HOST | Host not allowlisted | `ALLOWED_HOSTS` env + proxy Host |
| CSRF failed after HTTPS cutover | Origins/proxy proto | `CSRF_TRUSTED_ORIGINS` + X-Forwarded-Proto |
| check --deploy W009 / W018 | Weak key or DEBUG | Env `SECRET_KEY`; `DEBUG=False` |
| 500 after deploy, tables missing | Migrate skipped | `showmigrations` vs DB |
| Admin list slow | N+1 / missing index | Django Debug Toolbar or `connection.queries` |
| CSS 404 in prod | collectstatic / WhiteNoise | `STATIC_ROOT`, middleware order |

---

## Agent Operational Directive

> **MANDATORY**: Triage host/CSRF/DEBUG/secrets before rewriting app code. Prefer migrate + settings fixes over schema hacks. Never ask users to paste production secrets into chat.
