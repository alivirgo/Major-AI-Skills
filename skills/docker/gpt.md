---
title: "Docker Containers & Compose AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate BuildKit Dockerfiles, Compose graphs, CI build matrices, and automated validation scripts with digest pinning and secret-safe patterns."
category: "Container Build & Local Orchestration"
tags: ["docker", "buildkit", "compose", "buildx", "gpt-codex", "ci-automation"]
---

# Docker Containers & Compose AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Container Platform Automation Engineer**: emit **parameterized Dockerfiles**, **compose generators**, **GitHub Actions buildx pipelines**, and **pre-flight validators** (`compose config`, `nginx -t`-style build checks).

```
┌─────────────────────────────────────────────────────────────┐
│                 Docker Automation Stack                     │
│  Dockerfile templates → buildx bake → registry (digest tag)   │
│  compose.yaml linter → healthcheck contract tests             │
│  CI: multi-arch matrix + Trivy gate + SBOM artifact           │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Generate `docker-bake.hcl` or buildx commands** with cache-to/from registry and immutable tags (`:${{ github.sha }}`).
2. **Script compose validation**: render env, assert every `depends_on` with DB/redis has `service_healthy`.
3. **Never emit `ENV SECRET=`**; use BuildKit `--secret` or CI secret mounts.
4. **Emit `.dockerignore` alongside every Dockerfile** in the same PR.
5. **Fail CI** if `latest` is the only tag on prod deploy paths.

---

## Production Python: compose healthcheck auditor

```python
"""Fail CI if stateful dependencies lack service_healthy gates."""
from __future__ import annotations

import sys
from pathlib import Path

import yaml

STATEFUL = {"postgres", "mysql", "mariadb", "redis", "mongodb", "rabbitmq", "kafka"}


def main(compose_path: Path) -> None:
    doc = yaml.safe_load(compose_path.read_text(encoding="utf-8")) or {}
    services = doc.get("services") or {}
    errors: list[str] = []
    for name, spec in services.items():
        depends = spec.get("depends_on") or {}
        if not isinstance(depends, dict):
            continue
        for dep, cfg in depends.items():
            dep_img = (services.get(dep) or {}).get("image", "")
            if not any(s in dep_img.lower() for s in STATEFUL) and dep not in STATEFUL:
                continue
            cond = cfg.get("condition") if isinstance(cfg, dict) else None
            if cond != "service_healthy":
                errors.append(f"{name} -> {dep}: missing condition: service_healthy")
            if not (services.get(dep) or {}).get("healthcheck"):
                errors.append(f"{dep}: missing healthcheck for dependency gate")
    if errors:
        print("\n".join(errors))
        raise SystemExit(1)
    print("compose dependency gates OK")


if __name__ == "__main__":
    main(Path(sys.argv[1] if len(sys.argv) > 1 else "compose.yaml"))
```

---

## Technical Troubleshooting Matrix

| CI/build signature | Automation check | Script fix |
| :--- | :--- | :--- |
| Intermittent `npm ci` auth fail | Secret not mounted in build | Add `--secret id=npmrc,src=$HOME/.npmrc` |
| amd64 deploy from arm64 laptop | Wrong default platform | `buildx build --platform linux/amd64` |
| Layer cache never hits | `COPY .` before lockfiles | Reorder Dockerfile COPY stages |
| Compose up flaky in CI | No start_period on DB | Patch healthcheck YAML in generator |

---

## Agent Operational Directive

> **MANDATORY**: Automate digest-pinned builds, compose config validation, and healthcheck dependency audits in CI. Never generate credential literals. Tag with git SHA and promote digest to deployment manifests.
