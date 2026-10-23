---
name: fluxcd
description: "Operate Flux GitOps with GitRepository, Kustomization, and HelmRelease pipelines; trace Ready conditions, suspend for incidents, and debug reconcile stalls agents routinely miss."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["flux", "fluxcd", "gitops", "kubernetes", "helmrelease", "kustomization", "image-automation", "reconcile"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Flux CD GitOps AI Skill Guide (Claude)

## Overview & Engine Architecture

Flux reconciles Kubernetes from Git (or OCI) using composable controllers: **source-controller** (GitRepository, OCIRepository, HelmRepository, HelmChart), **kustomize-controller**, **helm-controller**, and optional **image-reflector / image-automation**. Unlike a single Application CR, Flux models **sources** and **appliers** as separate objects—debug by walking **Ready** conditions down the chain. Prefer digests in prod overlays; suspend before manual surgery on managed resources.

```
┌─────────────────────────────────────────────────────────────┐
│                 Flux GitOps reconcile path                  │
│                                                             │
│  GitRepository / OCIRepository / HelmRepository             │
│  └── artifact fetch (auth Secret, ref, interval)            │
│                                                             │
│  Kustomization  ──SSA apply──► cluster inventory + prune    │
│  HelmRelease    ──helm-ctrl──► HelmChart → release + wait   │
│                                                             │
│  Optional image automation                                  │
│  ImageRepository → ImagePolicy → ImageUpdateAutomation→Git  │
│                                                             │
│  Debug: source Ready → applier Ready → workload health      │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Bootstrapping Flux (`flux bootstrap`) and owning Git → cluster continuous delivery.
- Authoring GitRepository + Kustomization or HelmRelease pipelines with prune and health checks.
- Debugging stalled reconciles, chart render errors, or image-automation tag bumps.

**Do not use when**

- The team wants a single Application UX with rich UI sync → `@argocd` may fit better (same GitOps idea, different model).
- The task is building/pushing images → CI (`@github-actions`); Flux consumes artifacts.
- Someone asks to force-overwrite live cluster state without Git (and without suspend) → refuse; suspend → fix Git → resume.

---

## Operational Capabilities & Agent Directives

1. **Trace Ready down the chain**: Source → Kustomization/HelmRelease → HelmChart → workload events.
2. **Prefer digests** in production overlays; use image automation deliberately with semver policies.
3. **Separate bootstrap vs tenant paths**; restrict impersonation / SA privileges for multi-tenancy.
4. **`flux reconcile … --with-source`** after Git pushes when intervals are long; do not spam without cause.
5. **Suspend before manual kubectl edits** on Flux-managed objects; resume after Git is fixed.
6. **FQDN CRDs** when debugging charts: `kubectl get helmcharts.source.toolkit.fluxcd.io` (avoid CRD name collisions on k3s).
7. **Enable prune carefully**; review inventory before first automated prune on a legacy namespace.
8. **Never invent** Git deploy keys, cloud tokens, or registry credentials—reference existing Secrets.

---

## Production Example: GitRepository + Kustomization + HelmRelease

### Bootstrap (GitHub)

```bash
flux bootstrap github \
  --owner=example \
  --repository=fleet-gitops \
  --branch=main \
  --path=clusters/prod \
  --personal
```

### GitRepository + Kustomization

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: platform
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/example/fleet-gitops
  ref:
    branch: main
  secretRef:
    name: flux-system   # created by bootstrap; do not invent tokens
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: api
  namespace: flux-system
spec:
  interval: 5m
  path: ./apps/api/prod
  prune: true
  timeout: 3m
  sourceRef:
    kind: GitRepository
    name: platform
  targetNamespace: api
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: api
      namespace: api
```

### HelmRelease (pin chart version)

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: redis
  namespace: data
spec:
  interval: 10m
  timeout: 10m
  chart:
    spec:
      chart: redis
      version: "19.6.4"   # pin; avoid unbounded "19.x" in prod
      sourceRef:
        kind: HelmRepository
        name: bitnami
        namespace: flux-system
  values:
    auth:
      enabled: true
  install:
    remediation:
      retries: 3
  upgrade:
    remediation:
      retries: 3
```

### CLI debug chain

```bash
flux check
flux get all -A --status-selector ready=false
flux get sources all -A
flux get kustomizations -A
flux get helmreleases -A
flux get sources chart -A
flux logs --all-namespaces --level=error
flux reconcile source git platform
flux reconcile kustomization api --with-source
flux suspend kustomization api
# … fix Git …
flux resume kustomization api
kubectl get events -n flux-system --field-selector type=Warning
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Changes never apply | Source not Ready / Suspend=True | `flux get sources all -A`; unsuspend; fix auth Secret |
| Kustomization build error | Bad kustomization.yaml / missing file / patch target | `flux logs --kind=Kustomization --name=…`; fix Git path |
| HealthCheckFailed | Workload never Ready; timeout too low | Inspect Deployment events; raise `.spec.timeout` |
| HelmChart not ready | Bad chart name/version or HelmRepository 404 | `flux get sources helm` then `flux get sources chart` |
| install retries exhausted | Resources never healthy (CrashLoop, pull error) | `kubectl describe helmrelease`; temporarily `disableWait` only to inspect |
| Ready: Unknown stuck | Long Helm action / failed app health wait | Controller logs; fix app; reconcile; check remediation retries |
| `webhook does not support dry run` | Admission webhook `sideEffects` | Set `sideEffects: None` / `NoneOnDryRun` on webhook |
| Drift event spam | Manifest empty/`null` optional fields | Remove null/`{}`/`[]` fluff from YAML |
| Helm `Request entity too large` | Oversized release Secret | Fix chart `.helmignore`; shrink umbrella charts |
| Wrong HelmChart via kubectl | CRD name collision (e.g. k3s) | Use fully qualified CRDs or `flux get source chart` |

---

## Best Practices

1. Directory-per-cluster under `clusters/` with clear promotion (dev → staging → prod).
2. Pin chart versions and image digests; document image-automation policies.
3. Use OCI artifacts for air-gapped or signed delivery when required.
4. Document suspend/resume runbook for incident freezes.
5. Validate locally with `kustomize build` / `helm template` before push (`@helm`, `@makefile-automation`).
6. Pair with `@trivy` before image-automation bumps tags.

---

## Limitations

- Flux does not replace CI builds—it consumes Git/OCI artifacts and manifests.
- Multi-tenancy needs careful RBAC, namespace isolation, and impersonation design.
- HelmRelease debugging is opaque without local helm rendering and release events.
- Stop and ask if bootstrap credentials, cluster context, or tenant boundaries are missing.

---

## Related Skills

- `@argocd` — alternative GitOps Application model / UI
- `@kubernetes` — workload-level failure diagnosis after Flux applies
- `@helm` — local chart render and values debugging
- `@trivy` — scan images before automation bumps tags
- `@docker` — build artifacts Flux eventually deploys

---

## Agent Operational Directive

> **MANDATORY**: Debug by Ready-condition chain (source → applier → workload). Prefer digests and pinned chart versions. Suspend before manual edits to managed resources. Never invent Git or registry credentials. Use fully qualified Flux CRDs when `kubectl get helmcharts` is ambiguous.

---

## Source anchors (research)

- [Flux troubleshooting cheatsheet](https://fluxcd.io/flux/cheatsheets/troubleshooting/)
- [HelmRelease conditions](https://fluxcd.io/flux/components/helm/helmreleases/)
- [Flux agent-skills troubleshooting reference](https://github.com/fluxcd/agent-skills/blob/HEAD/skills/gitops-cluster-debug/references/troubleshooting.md)
- [HelmRelease Ready Unknown / stuck reconcile discussions](https://github.com/fluxcd/flux2/issues/5636)
