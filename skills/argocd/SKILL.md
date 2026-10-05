---
name: argocd
description: "Operate Argo CD GitOps with AppProjects, safe automated sync/prune, and RespectIgnoreDifferences—debug OutOfSync/Degraded without kubectl drift that fights the controller."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["argocd", "gitops", "kubernetes", "sync", "helm", "kustomize", "app-of-apps"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Argo CD GitOps AI Skill Guide (Claude)

## Overview & Engine Architecture

Argo CD continuously reconciles cluster state to **Git-defined desired state** (plain YAML, Helm, Kustomize, Jsonnet). An **Application** binds repo path + revision to a cluster/namespace; **AppProject** enforces allowlists. The controller diff-computes live vs desired, sync applies patches, and health assesses resource readiness. Agents treat Git as source of truth—**no `kubectl edit` on managed objects**—and respect **prune/selfHeal blast radius**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Argo CD reconciliation                      │
│                                                             │
│  Git repo (main) → Application controller                   │
│       ↓ compare + hydrate (helm/kustomize)                  │
│  Cluster API ← sync (hooks, waves, replace options)         │
│  UI/CLI: Synced/OutOfSync, Healthy/Degraded/Progressing   │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Wiring CD so merged Git revisions deploy to Kubernetes automatically.
- Debugging `OutOfSync`, `Degraded`, sync hooks, or HPA/replica drift.
- Designing AppProject boundaries for multi-team/multi-cluster fleets.

**Do not use when**

- Building container images—CI updates tags/digests in Git (`@docker`, `@github-actions`).
- Cluster creation—`@terraform`; raw pod debug—`@kubernetes`.

---

## Operational Capabilities & Agent Directives

1. **Desired state lives in Git**; manual cluster edits are debt—revert or commit fix.
2. **Automated sync**: enable `prune` + `selfHeal` only after nonprod dry-runs; understand prune deletes resources removed from Git.
3. **`ignoreDifferences` alone does not skip fields at sync time**—add `syncOptions: [RespectIgnoreDifferences=true]` so ignored fields (e.g. `/spec/replicas` under HPA) are not overwritten during apply.
4. **AppProject** scopes: allowed repos, destinations, resource kinds; deny cluster-scoped surprises.
5. **Sync waves / hooks**: document ordering; failed PreSync hooks block release—check hook pod logs.
6. **Multi-source Applications**: document which source owns which path; avoid opaque overrides.
7. **Never embed** cluster admin tokens in Application manifests; use in-cluster `https://kubernetes.default.svc` or registered clusters with RBAC.
8. **Image updates**: CI opens PR bumping image digest in values/overlays—Argo watches Git, not CI kubectl.

---

## Production Example: Application + project constraints

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: platform
  namespace: argocd
spec:
  sourceRepos:
    - https://github.com/example/platform-gitops
  destinations:
    - namespace: apps-*
      server: https://kubernetes.default.svc
  clusterResourceWhitelist:
    - group: ""
      kind: Namespace
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: api
  namespace: argocd
spec:
  project: platform
  source:
    repoURL: https://github.com/example/platform-gitops
    targetRevision: main
    path: apps/api/overlays/prod
    helm:
      valueFiles: [values.yaml]
  destination:
    server: https://kubernetes.default.svc
    namespace: api
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers: [/spec/replicas]
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
      - RespectIgnoreDifferences=true
```

CLI diagnostics:

```bash
argocd app get api
argocd app diff api
argocd app sync api --dry-run
argocd app history api
argocd app rollback api <id>
```

---

## Technical Troubleshooting Matrix

| Status | Meaning | Next step |
| :--- | :--- | :--- |
| OutOfSync | Git ≠ live | `app diff`; commit fix or sync if Git intended |
| Degraded | Unhealthy resource | Pod events/logs; fix manifest health checks |
| Progressing | Rollout in flight | Wait; check RS; surge limits |
| SyncFailed hook | PreSync/PostSync job failed | Logs for hook Job |
| Repeated replica fights | HPA vs Git replicas | `ignoreDifferences` + `RespectIgnoreDifferences` |
| Prune deleted prod NS | prune+removed manifest | Restore from Git; use `Prune=confirm` for critical kinds |
| Mass pod restart after sync | Probe storm / resource surge | Stagger apps; `@kubernetes` probe tuning |

---

## Best Practices

1. One Application per deployable service; **ApplicationSet** for fleet generators.
2. Protect `main` with PR checks; Argo tracks reviewed SHAs only.
3. Separate envs by overlay path or branch strategy—document promotion.
4. Use `argocd.argoproj.io/compare-options`/`ignore-differences` annotation for resource-level rules when App spec locked down.
5. Observability: alert on sync failure and `Degraded` duration; link `@grafana` panels.

---

## Limitations

- Argo CD does not scan images—pair with `@trivy` in CI before tag bumps land in Git.
- Automated prune can delete quickly—test AppProjects and sync options in nonprod.
- `RespectIgnoreDifferences` applies only after resource exists; first create uses full desired manifest.
- Stop and ask if repo URL, cluster credential, or blast radius of prune is unclear.

---

## Related Skills

- `@kubernetes` — workload failure analysis
- `@helm` — chart rendering inside Application source
- `@fluxcd` — alternative GitOps engine comparison
- `@github-actions` — CI that commits image digest bumps
- `@docker` — image build and digest pinning

---

## Agent Operational Directive

> **MANDATORY**: Do not recommend kubectl edits for Argo-managed production objects—fix Git and sync. When using `ignoreDifferences` for controller-owned fields, always add `RespectIgnoreDifferences=true`. Treat automated prune as destructive capability requiring nonprod validation. For fork/untrusted flows, keep deploy credentials out of PR workflows (`@github-actions`).

---

## Source anchors (research)

- [Argo CD sync options](https://argo-cd.readthedocs.io/en/latest/user-guide/sync-options/)
- [RespectIgnoreDifferences behavior](https://github.com/argoproj/argo-cd/blob/master/docs/user-guide/sync-options.md)
- [automated.prune vs syncOptions.Prune](https://github.com/argoproj/argo-cd/issues/16999)
- [ignoreDifferences sync-stage behavior (issue)](https://github.com/argoproj/argo-cd/issues/17817)
