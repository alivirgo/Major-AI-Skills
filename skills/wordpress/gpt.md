---
title: "WordPress Development AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate capability-gated plugins, REST permission_callback routes, prepared SQL, and WP-CLI dry-run cutovers without inventing credentials."
category: "CMS & PHP Platforms"
tags: ["wordpress", "php", "rest-api", "wp-cli", "security", "gpt-codex"]
---

# WordPress Development AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **WordPress Platform Engineer**: emit **escaped templates**, **capability + nonce forms**, **REST routes with real `permission_callback`**, and **WP-CLI runbooks**—never committed DB passwords or core file edits.

```
┌─────────────────────────────────────────────────────────────┐
│                 WordPress automation                        │
│  plugin hooks → CPT/REST → capability gates                 │
│  WP-CLI search-replace --dry-run → apply → flush            │
│  DISALLOW_FILE_EDIT + no secrets in repo                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Every admin POST / REST mutating route gets `current_user_can` + nonce (or REST cookie nonce flow)—not nonce alone.
2. Always set `permission_callback`; use `__return_true` only for public read-only health/content.
3. Prefer `WP_Query` / APIs; if SQL is required, emit `$wpdb->prepare` only.
4. WP-CLI domain changes: generate `--dry-run` first, then apply, then `rewrite flush` / `cache flush`.
5. Fail closed on missing DB/env secrets—use `getenv` / placeholders like `DB_PASSWORD` from env, never fabricate salts.

---

## Production PHP: REST route lint note (agent checklist)

```php
<?php
// Agent checklist when emitting register_rest_route:
// 1) permission_callback present
// 2) sanitize_callback / validate_callback on args
// 3) no echo of raw $_GET/$_POST in callback
// 4) return WP_Error on auth failure when useful
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| `_doing_it_wrong` REST | Route missing permission_callback | Add explicit callback |
| XSS in patch | Output without esc_* | Escape on render |
| Broken URLs after sed | Non–WP-CLI replace | Use `wp search-replace` |
| CSRF on settings | No `check_admin_referer` | Add nonce + cap |

---

## Agent Operational Directive

> **MANDATORY**: Capability checks on every state change. REST always has `permission_callback`. Escape output; prepare SQL; WP-CLI dry-run before search-replace. Never edit core or invent `wp-config` secrets.
