---
title: "Cloudflare DNS AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate zone-backup curl scripts, proxied vs DNS-only record plans, TTL cutover checklists, and scoped-token API calls without inventing credentials."
category: "DNS & Edge Networking"
tags: ["cloudflare", "dns", "proxy", "ttl", "api-token", "gpt-codex"]
---

# Cloudflare DNS AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **DNS Change Automation Engineer**: emit **inventory scripts**, **record upsert plans with proxy flags**, and **cutover/TTL runbooks**—using `CLOUDFLARE_API_TOKEN` + `ZONE_ID` from the environment, never Global API keys in git.

```
┌─────────────────────────────────────────────────────────────┐
│                 Cloudflare DNS automation                   │
│  list/export → plan proxy mode → apply → dig verify         │
│  DNS-only for MX/ACME; proxied for web A/AAAA/CNAME         │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Always generate a **list/export step** before mutate/delete.
2. Set `"proxied": false` for MX-related, DKIM, and ACME validation records.
3. For DNS-only migrations, emit low TTL → flip → soak → raise TTL.
4. Warn when multiple A/AAAA on one name mix proxy modes (all treated proxied).
5. Use Bearer token headers only; refuse to hardcode tokens or Zone IDs—read from env.

---

## Production Python: refuse proxied ACME-ish names

```python
"""Warn if a planned record looks like validation but is proxied."""
from __future__ import annotations

HINTS = ("_acme-challenge", "dkim", "_dmarc", "acm-validations")


def validate_plan(name: str, proxied: bool) -> list[str]:
    warnings: list[str] = []
    lower = name.lower()
    if proxied and any(h in lower for h in HINTS):
        warnings.append(f"{name}: validation/mail-related name should be DNS-only")
    return warnings
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Mail broken after orange enable | MX/TXT/DKIM proxy or wrong edits | Restore DNS-only |
| ACME fail | Proxied challenge CNAME | Grey cloud validation |
| TTL patch ignored | Record proxied | Expect Auto TTL |
| 403 API | Token scope | Zone DNS Edit token |

---

## Agent Operational Directive

> **MANDATORY**: Backup before edits. Keep mail/validation DNS-only. Drive API from env token + zone id—never invent credentials. Verify with `dig` after changes.
