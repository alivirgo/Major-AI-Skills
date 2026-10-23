---
title: "WireGuard VPN AI Skill Guide (GPT & Codex)"
description: "Generate wg-quick configs, keygen hygiene scripts, and CI validators for AllowedIPs symmetry—without emitting private keys."
category: "VPN & Cryptokey Routing"
tags: ["wireguard", "wg-quick", "allowedips", "gpt-codex", "automation"]
---

# WireGuard VPN AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **VPN Automation Engineer**: emit **`wg-quick` templates**, **systemd units**, **firewall UDP allow snippets**, and **validators** that catch AllowedIPs asymmetry. Private keys are generated on-box via scripts—templates use `<PLACEHOLDER>` only.

```
┌─────────────────────────────────────────────────────────────┐
│                 WireGuard automation                        │
│  keygen (umask 077) → conf templates → wg-quick@            │
│  lint AllowedIPs ↔ peer Address                             │
│  optional PostUp forward (flag-gated)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Always include PersistentKeepalive=25** on NAT client templates unless operator opts out.
2. **Gate MASQUERADE** behind an explicit `ENABLE_NAT=1`—never default full-tunnel NAT.
3. **Generate peer blocks** with `/32` tunnel IPs; add LAN CIDRs only when requested.
4. **CI lint**: peer PublicKey fields must not look like PrivateKey file contents pasted wrongly (length/format checks only—no inventing keys).
5. **Emit `wg show` / handshake checks** in smoke scripts.

---

## Production Python: AllowedIPs must include peer tunnel IP

```python
"""Warn if peer Address /32 missing from opposite AllowedIPs (static conf parse)."""
from __future__ import annotations

import configparser
import sys
from pathlib import Path


def addresses(path: Path) -> tuple[str | None, list[str]]:
    raw = path.read_text(encoding="utf-8")
    # configparser needs section headers; strip inline comments lightly
    cp = configparser.ConfigParser(strict=False)
    cp.read_string(raw)
    iface_addr = None
    if cp.has_section("Interface"):
        iface_addr = cp["Interface"].get("Address", "").split(",")[0].strip()
    allowed: list[str] = []
    for section in cp.sections():
        if section.startswith("Peer"):
            allowed.extend(
                a.strip() for a in cp[section].get("AllowedIPs", "").split(",") if a.strip()
            )
    return iface_addr, allowed


def main(server: Path, client: Path) -> None:
    s_addr, _ = addresses(server)
    c_addr, s_allowed_from_client_view = addresses(client)
    # Client peer AllowedIPs should include server tunnel; server peer should include client /32
    errors: list[str] = []
    _, client_allowed = addresses(client)
    _, server_allowed = addresses(server)
    if s_addr and not any(s_addr.split("/")[0] in a or s_addr in a for a in client_allowed):
        errors.append("client AllowedIPs may omit server Address")
    if c_addr and not any(c_addr.split("/")[0] in a or c_addr in a for a in server_allowed):
        errors.append("server AllowedIPs may omit client Address")
    if errors:
        print("\n".join(errors))
        raise SystemExit(1)
    print("basic AllowedIPs symmetry checks OK")


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
```

---

## Technical Troubleshooting Matrix

| Automation signature | Check | Fix |
| :--- | :--- | :--- |
| Template ships `0.0.0.0/0` everywhere | Review request | Split-tunnel unless full-tunnel flagged |
| No keepalive on laptop conf | NAT assumption | Add PersistentKeepalive=25 |
| PostUp always NAT | Safety | Require ENABLE_NAT |
| Keys in git diff | Secret scan | Refuse; use gen on host |

---

## Agent Operational Directive

> **MANDATORY**: Emit placeholders for private keys only. Default to split-tunnel AllowedIPs. Require keepalive for NAT clients. Do not enable forwarding/MASQUERADE unless the design says gateway.
