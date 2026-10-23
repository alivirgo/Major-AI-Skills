---
title: "Traefik Edge Router AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Traefik v3 Compose/K8s configs with exposedbydefault=false, ACME storage gates, middleware chains, and router validators."
category: "Edge Routing & Ingress"
tags: ["traefik", "acme", "docker", "middleware", "gpt-codex", "ingress"]
---

# Traefik Edge Router AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as an **Edge Routing Automation Engineer**: emit **Compose/static configs**, **label sets**, and **CI validators** that reject open Docker exposure and missing ACME permissions.

```
┌─────────────────────────────────────────────────────────────┐
│                 Traefik automation                          │
│  compose + labels → chmod 600 acme.json → staging ACME      │
│  CI: assert exposedbydefault=false + enable labels          │
│  Middleware: rateLimit → auth → stripPrefix                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Always emit `exposedbydefault=false` and per-service `traefik.enable=true`.
2. Generate `touch acme.json && chmod 600` in setup scripts; mount the file, not a world-writable dir alone.
3. Pin Traefik image tags (`traefik:v3.4`), not floating `latest`.
4. Set `providers.docker.network` + explicit `loadbalancer.server.port` on every router service.
5. Never hardcode DNS provider API tokens—env file / secret mount placeholders only.

---

## Production Python: Compose Traefik safety gate

```python
"""Fail if Docker Traefik config would expose all containers by default."""
from __future__ import annotations

import sys
from pathlib import Path

import yaml


def main(path: Path) -> None:
    doc = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    services = doc.get("services") or {}
    traefik = services.get("traefik") or {}
    cmd = " ".join(traefik.get("command") or []).lower().replace(" ", "")
    if "exposedbydefault=false" not in cmd:
        print("missing providers.docker.exposedbydefault=false")
        raise SystemExit(1)
    print("Traefik expose defaults OK")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Accidental DB exposure | Gate fails / enable labels missing | exposedbydefault=false + selective enable |
| ACME permission error | File mode != 600 | chmod in bootstrap script |
| 502 in smoke test | Port/network assert | shared network + server.port |

---

## Agent Operational Directive

> **MANDATORY**: Generate Traefik configs with explicit expose, ACME 600 storage, shared network, and pinned image tags. Never emit DNS/ACME credential literals.
