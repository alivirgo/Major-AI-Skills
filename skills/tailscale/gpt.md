---
title: "Tailscale Mesh VPN AI Skill Guide (GPT & Codex)"
description: "Automate Tailscale join scripts, tagged auth-key flows, ACL/autoApprovers snippets, and CI validators—without inventing credentials."
category: "Zero-Config Mesh VPN & Mesh Networking"
tags: ["tailscale", "subnet-router", "acl", "gpt-codex", "automation"]
---

# Tailscale Mesh VPN AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Mesh Network Automation Engineer**: emit **idempotent install/join scripts**, **HuJSON ACL fragments**, **GitHub Actions steps** for ephemeral nodes, and **preflight checks** (`netcheck`, route approval reminders). Credentials are always `$TAILSCALE_AUTH_KEY` / OIDC—never literals.

```
┌─────────────────────────────────────────────────────────────┐
│                 Tailscale automation stack                  │
│  install.sh → tailscale up/set → advertise routes/tags      │
│  ACL + autoApprovers → CI policy lint                       │
│  netcheck/ping gates in smoke tests                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Generate sysctl.d + advertise-routes** together; print explicit “approve in Admin Console” unless `autoApprovers` is in the same change.
2. **Prefer tags** for servers (`--advertise-tags=tag:ci`) over user-owned always-on nodes.
3. **Script path checks**: assert `ip_forward=1` before declaring subnet router success.
4. **Emit ACL diffs** as HuJSON with comments; do not invent employee emails—use `group:` / `tag:` placeholders.
5. **Never print auth keys**; accept only env/secret references.

---

## Production Python: require accept-routes hint in README/scripts

```python
"""Fail CI if subnet advertise scripts omit client accept-routes guidance."""
from __future__ import annotations

import re
import sys
from pathlib import Path

NEEDLES = (
    re.compile(r"advertise-routes", re.I),
    re.compile(r"accept-routes", re.I),
)


def main(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    if not NEEDLES[0].search(text):
        print(f"{path}: no advertise-routes")
        raise SystemExit(0)
    if not NEEDLES[1].search(text):
        print(f"{path}: advertises routes but never mentions accept-routes")
        raise SystemExit(1)
    print("subnet script mentions both advertise and accept-routes")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
```

---

## Technical Troubleshooting Matrix

| CI/automation signature | Automation check | Script fix |
| :--- | :--- | :--- |
| Job joins but cannot reach LAN | Missing accept-routes on runner | `tailscale set --accept-routes` in workflow |
| Routes pending forever | No autoApprovers / no manual step | Add tagged autoApprovers or human gate |
| DNS flakes in container | accept-dns + minimal image | Document `--accept-dns=false` + quad100 |
| Key expired mid-pipeline | User-owned node | Switch to tagged auth key |

---

## Agent Operational Directive

> **MANDATORY**: Automate advertise + approval path + client accept-routes. Persist forwarding via sysctl.d. Never emit Tailscale auth key literals. Prefer tags for non-interactive nodes.
