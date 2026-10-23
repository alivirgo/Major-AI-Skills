---
name: nomad
description: "Author Nomad jobspecs with resource limits, canary/auto-revert updates, and Consul/Vault integrations; always nomad job plan before run and debug blocked evaluations agents miss."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["nomad", "hashicorp", "scheduler", "jobs", "hcl", "canary", "allocations", "docker-driver"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# HashiCorp Nomad Scheduler AI Skill Guide (Claude)

## Overview & Engine Architecture

Nomad schedules **jobs** → **task groups** → **tasks** onto a client fleet using drivers (Docker, exec, Java, etc.). Servers evaluate and place **allocations**; clients start tasks. Compared to Kubernetes, jobspecs are compact HCL and commonly pair with `@consul` (discovery/checks) and `@vault` (secrets). Prefer **`nomad job plan`** then **`run -check-index`**, digest-pinned images, and **canary + auto_revert** over surprise in-place restarts.

```
┌─────────────────────────────────────────────────────────────┐
│                 Nomad schedule path                         │
│                                                             │
│  jobspec.hcl ──plan──► dry-run diff + modify index          │
│       │                                                     │
│       └── run -check-index ──► servers evaluate             │
│                │                                            │
│                ├── place allocs on feasible clients         │
│                └── blocked eval if resources/constraints    │
│                                                             │
│  Client drivers (docker/exec/…) start tasks                 │
│  ├── Consul service + check (optional)                      │
│  └── Vault template / workload identity (optional)          │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Deploying service or batch jobs on Nomad clusters with HCL jobspecs.
- Debugging failed/blocked allocations, driver pull errors, or canary rollouts.
- Integrating Consul registration and Vault secrets from the jobspec.

**Do not use when**

- The platform standard is Kubernetes controllers, CRDs, and Helm → `@kubernetes` / `@helm`.
- You only need a single-host Compose stack → `@docker`.
- Someone asks for `:latest` images and no resources in prod jobspecs → refuse; require digests + CPU/memory.

---

## Operational Capabilities & Agent Directives

1. **Always `nomad job plan`** before `nomad job run` on shared clusters; use `-check-index` from the plan.
2. **Set `resources.cpu` and `resources.memory`** on every task—no unbounded tasks.
3. **Distinct job IDs per environment** (`api-prod`, `api-dev`); use namespaces + ACLs on multi-team clusters.
4. **Pin images by digest**; set `image_pull_timeout` when registries are slow.
5. **Update strategy**: `canary`, `auto_revert`, realistic `healthy_deadline` / `progress_deadline`.
6. **Non-secret config** in Nomad variables; **secrets via Vault** when available.
7. Debug placement with `nomad eval status`—completed eval + **blocked** follow-up is normal when infeasible.
8. Never invent Nomad management tokens, Vault roles, or registry passwords—reference env/`NOMAD_TOKEN` patterns only.

---

## Production Example: service job with canary + Consul check

```hcl
job "api" {
  datacenters = ["dc1"]
  type        = "service"
  namespace   = "default"

  meta {
    git_sha = "REPLACE_WITH_CI_SHA"
  }

  group "api" {
    count = 2

    network {
      port "http" {
        to = 8080
      }
    }

    update {
      max_parallel      = 1
      canary            = 1
      auto_revert       = true
      auto_promote      = false
      health_check      = "checks"
      min_healthy_time  = "30s"
      healthy_deadline  = "5m"
      progress_deadline = "10m"
    }

    task "api" {
      driver = "docker"

      config {
        image              = "ghcr.io/example/api@sha256:REPLACE_DIGEST"
        ports              = ["http"]
        image_pull_timeout = "10m"
      }

      resources {
        cpu    = 200
        memory = 256
      }

      service {
        name = "api"
        port = "http"
        tags = ["prod"]

        check {
          type     = "http"
          path     = "/healthz"
          interval = "10s"
          timeout  = "2s"
        }
      }

      # Optional: Vault-backed env — role name only, no secret literals
      # vault { policies = ["api-read"] }
    }
  }
}
```

### CLI workflow

```bash
nomad job plan api.hcl
# Note Job Modify Index from plan output, then:
nomad job run -check-index <modify-index> api.hcl
nomad status api
nomad deployment status -monitor <deployment-id>
nomad alloc status <alloc-id>
nomad alloc logs <alloc-id>
nomad eval status <eval-id>    # placement failures / blocked evals
nomad job scale api api 4
# nomad job stop -purge api   # only with explicit approval
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| queued / exhausted / blocked eval | Insufficient CPU/memory or constraint miss | `eval status`; scale clients or lower asks; fix constraints |
| driver failure / pull error | Image missing, auth, or pull timeout | Client logs; registry creds; raise `image_pull_timeout` |
| unhealthy canary / deploy failed | Check failing or progress deadline | `alloc logs`; fix health; `auto_revert` should roll back |
| constraint mismatch | node class/unique unmet | Label nodes or relax constraints |
| placement “complete” but job pending | Follow-on **blocked** evaluation | `nomad eval status` chain; wait for capacity |
| Vault template errors | Policy/role misbind | Fix Vault policy; do not embed secrets in HCL |
| Version skew errors | Servers/clients outside support skew | Upgrade clients/servers within HashiCorp policy |

---

## Best Practices

1. Annotate jobs with Git SHA in `meta`; promote digests from CI.
2. Prefer canary + manual or auto promote with clear runbooks; keep `auto_revert=true` for prod services.
3. Document host volumes / CSI data lifecycle before stateful jobs.
4. Keep Nomad version skew between servers and clients within support policy.
5. Pair with `@consul` for discovery and `@vault` for secrets; `@packer` for golden client images.
6. Require ACL tokens scoped per namespace on shared clusters.

---

## Limitations

- Ecosystem differs from Kubernetes—Controllers/CRDs do not map 1:1.
- Advanced CNI/bridge networking is cluster-specific; do not invent CNI configs.
- Without Consul/Vault, discovery and secrets become DIY.
- Stop and ask if namespace, ACL token source, image digest, or data-volume ownership is missing.

---

## Related Skills

- `@consul` — service registration and checks from Nomad tasks
- `@vault` — secret injection / workload identity patterns
- `@docker` — build and publish task images
- `@terraform` — provision Nomad server/client fleet
- `@kubernetes` — alternative orchestrator when the platform standard is K8s

---

## Agent Operational Directive

> **MANDATORY**: Run `nomad job plan` (and prefer `-check-index`) before applying on shared clusters. Set CPU/memory on every task; pin image digests; use canary + `auto_revert` for prod services. Debug blocked evaluations explicitly. Never embed registry, Vault, or Nomad tokens in jobspecs.

---

## Source anchors (research)

- [nomad job plan](https://developer.hashicorp.com/nomad/commands/job/plan)
- [Allocation placement & blocked evals](https://developer.hashicorp.com/nomad/docs/concepts/scheduling/placement)
- [update block (canary, auto_revert, deadlines)](https://developer.hashicorp.com/nomad/docs/job-specification/update)
- [deployment status -monitor](https://developer.hashicorp.com/nomad/commands/deployment/status)
