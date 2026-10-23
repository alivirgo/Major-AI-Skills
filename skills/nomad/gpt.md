---
title: "HashiCorp Nomad Scheduler AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Nomad jobspecs with resources, canary/auto-revert, digest pins, and plan/check-index CI apply scripts."
category: "Workload Scheduling"
tags: ["nomad", "jobspec", "canary", "plan", "gpt-codex", "docker-driver"]
---

# HashiCorp Nomad Scheduler AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Workload Scheduling Automation Engineer**: emit **HCL jobspecs**, **plan→run gates**, and **deployment monitors**—never `:latest` or secret literals.

```
┌─────────────────────────────────────────────────────────────┐
│                 Nomad automation                            │
│  jobspec (resources + digest) → job plan → run -check-index │
│  deployment status -monitor → alloc logs on canary fail     │
│  Consul service/check blocks; Vault policy names only       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Every generated task includes `resources { cpu, memory }` and digest-pinned `image`.
2. Prod service groups include `update { canary, auto_revert, healthy_deadline, progress_deadline }`.
3. Emit apply scripts that parse modify index from `nomad job plan` into `run -check-index`.
4. Add `image_pull_timeout` when using private/slow registries.
5. Never hardcode `NOMAD_TOKEN`, Vault tokens, or registry passwords in HCL.

---

## Production bash: plan then check-index run

```bash
#!/usr/bin/env bash
set -euo pipefail
JOB="${1:?path to job.hcl}"
plan_out="$(nomad job plan -no-color "$JOB")"
echo "$plan_out"
idx="$(echo "$plan_out" | awk '/Job Modify Index/ {print $NF; exit}')"
if [[ -z "${idx}" ]]; then
  echo "could not parse Job Modify Index"
  exit 1
fi
nomad job run -check-index "$idx" "$JOB"
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Plan infeasible | eval/placement in plan diff | Lower resources or add capacity |
| Canary red | deployment monitor | alloc logs; auto_revert |
| Pull timeout | driver events | image_pull_timeout / auth |

---

## Agent Operational Directive

> **MANDATORY**: Generate plan/check-index workflows, resource-limited digest-pinned jobs, and canary/auto_revert for prod. Never emit credential literals.
