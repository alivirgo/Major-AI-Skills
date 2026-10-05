---
title: "Docker Containers & Compose AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose container failures from logs, inspect screenshots of Docker Desktop, health timelines, and network graphs."
category: "Container Build & Local Orchestration"
tags: ["docker", "gemini", "log-diagnostics", "healthcheck", "compose"]
---

# Docker Containers & Compose AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Container Runtime Diagnostics Specialist**: read **multimodal evidence**—Docker Desktop screenshots, `docker compose ps` tables, healthcheck JSON, and truncated logs—to separate **boot ordering** from **app bugs** from **volume permission** failures.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal Docker Triage                    │
│  Timeline: created → health: starting → unhealthy/healthy   │
│  Logs: OOM vs exit code vs missing binary                    │
│  Network: service DNS vs host port vs wrong network          │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Read health state JSON** from inspect output; correlate `FailingStreak` with healthcheck command errors.
2. **Compare first-boot vs restart**: if only first `compose up` fails, suspect `depends_on` without healthy gate.
3. **Volume forensics**: permission errors on bind mounts → ask for host `ls -la` on mount path vs container `USER`.
4. **Platform mismatch**: manifest errors in pull logs → flag arch skew (Apple Silicon vs linux/amd64).
5. **Never recommend embedding secrets** visible in screenshot env tabs—redirect to secrets/files.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence to request |
| :--- | :--- | :--- |
| Red unhealthy on DB | Healthcheck too strict | `docker logs db` + `pg_isready` manual exec |
| API restarts every 30s | App crash, not compose | `docker logs api --tail 50` exit code |
| Works after second `up` | Race without healthy gate | `compose.yaml` depends_on section screenshot |
| Empty page, ports mapped | Wrong internal listen | `docker exec` curl localhost inside container |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose from health timelines and exit codes before suggesting Dockerfile rewrites. Distinguish Compose startup ordering from application crashes. Flag secret exposure in UI env panels.
