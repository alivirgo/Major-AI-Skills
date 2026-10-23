---
title: "Let's Encrypt ACME AI Skill Guide (GPT & Codex)"
description: "Generate certbot/acme.sh issuance + renew hooks, staging-first pipelines, and CI dry-run gates—without embedding DNS tokens or private keys."
category: "TLS & Certificate Automation"
tags: ["lets-encrypt", "certbot", "acme", "gpt-codex", "renewal"]
---

# Let's Encrypt ACME AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Certificate Automation Engineer**: emit **staging-safe issue scripts**, **systemd timer / cron renew lines**, **deploy hooks** (`nginx -t && reload`), and **CI checks** that forbid `--force-renewal` on schedules and forbid committed privkeys.

```
┌─────────────────────────────────────────────────────────────┐
│                 ACME automation                             │
│  staging issue → prove challenge → prod issue               │
│  renew timer → deploy-hook reload → expiry monitor          │
│  secrets: DNS token via env / vault only                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Default to staging** flags when the user is “testing” or “debugging” validation.
2. **Refuse `--manual` for unattended renew** unless they supply a hook script path.
3. **Always emit a deploy/reload hook** with any `certonly` install instructions.
4. **Never hardcode** `CF_Token` / API secrets—use `${CLOUDFLARE_API_TOKEN:?}`.
5. **Document rate-limit risk** if scripts loop `certbot certonly` without staging.

---

## Production Python: ban force-renewal in cron snippets

```python
"""Fail if committed renew scripts use --force-renewal."""
from __future__ import annotations

import re
import sys
from pathlib import Path

FORCE = re.compile(r"--force-renewal\b")


def main(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    if FORCE.search(text):
        print(f"{path}: remove --force-renewal from scheduled renewals")
        raise SystemExit(1)
    print("renew script OK")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
```

---

## Technical Troubleshooting Matrix

| Automation signature | Check | Fix |
| :--- | :--- | :--- |
| CI hits prod rate limits | Using prod ACME in tests | Switch directory to staging |
| Renew green, TLS old | No deploy hook | Add renewal-hooks/deploy |
| Wildcard job interactive | `--manual` | DNS plugin + API token env |
| Privkey in repo | Secret scan | gitignore `/etc` copies; use deploy paths only |

---

## Agent Operational Directive

> **MANDATORY**: Staging before production debugging. Automate renew + reload; never schedule `--force-renewal`. Never emit DNS API secrets or private key material.
