---
name: helm
description: "Package Kubernetes apps as Helm charts with lint/template gates, pinned dependencies, and hook-safe upgrades—avoid lookup traps and silent resource deletion on render."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["helm", "charts", "kubernetes", "values", "hooks", "oci", "releases"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Helm Chart Packaging AI Skill Guide (Claude)

## Overview & Engine Architecture

Helm packages Kubernetes manifests as **charts**: `Chart.yaml`, `values.yaml`, and **Go templates** in `templates/`. A **release** is an installed instance with revision history; `helm upgrade --install` renders templates and applies via the Kubernetes API. Agents enforce **local render before cluster**, **secrets outside values.yaml**, and **understanding Helm’s render-time `lookup`** semantics— a common production footgun.

```
┌─────────────────────────────────────────────────────────────┐
│                 Helm release lifecycle                    │
│                                                             │
│  Chart + values (+ values.prod.yaml)                        │
│       ↓ helm lint / template / schema                       │
│  Rendered manifest batch → API server                       │
│  Hooks (pre/post install/upgrade) run weighted jobs         │
│  Revision N stored → rollback to N-1                        │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Templating repeated K8s YAML; promoting same chart across envs with value files.
- Debugging failed hooks, schema validation, or subchart dependency drift.
- Publishing charts to OCI registries or vendoring dependencies.

**Do not use when**

- GitOps sync semantics and drift—pair with `@argocd` (Helm is render engine, not policy loop).
- Secret management—use External Secrets / Vault (`@vault`), not committed prod passwords in `values.yaml`.

---

## Operational Capabilities & Agent Directives

1. **`helm lint` + `helm template` on every change** before install/upgrade; pipe to `kubeconform` in CI.
2. **Pin dependency versions** in `Chart.yaml`; commit `Chart.lock`; run `helm dependency build` in CI.
3. **Secrets**: `--set-file`, SOPS, or external operators—defaults in `values.yaml` are public.
4. **`lookup` caution**: all templates render **before** anything is applied—`lookup` cannot see resources created earlier in the **same** chart on fresh install; conditional templates vanish on upgrade → **Helm deletes resources**. Split charts or use operators/CRDs instead of install-time lookup gates.
5. **Hooks**: set weights; debug with hook pod logs; understand `helm.sh/hook-delete-policy`.
6. **Idempotent upgrades**: explicit `--namespace`; `--atomic` for auto-rollback on failure when appropriate.
7. **Post-renderers**: must fail closed (`set -euo pipefail`)—empty stdout deletes resources (known incident class).

---

## Production Example: chart layout + command loop

```text
api/
  Chart.yaml
  values.yaml
  values.schema.json
  templates/
    _helpers.tpl
    deployment.yaml
    service.yaml
    ingress.yaml
  charts/
  Chart.lock
```

`Chart.yaml` dependencies:

```yaml
apiVersion: v2
name: api
version: 0.4.0
appVersion: "1.5.0"
dependencies:
  - name: redis
    version: 19.0.2
    repository: oci://registry.example.com/charts
    condition: redis.enabled
```

```bash
helm dependency update ./api
helm lint ./api
helm template api ./api -f values.prod.yaml > /tmp/render.yaml
helm upgrade --install api ./api -n apps --create-namespace -f values.prod.yaml --atomic --timeout 10m
helm history api -n apps
helm rollback api 3 -n apps
```

Deployment template excerpt (labels/helpers):

```yaml
metadata:
  labels:
    {{- include "api.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
```

---

## Technical Troubleshooting Matrix

| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| YAML parse error at line N | Template indent | `helm template` and inspect line |
| Hook job never completes | Failed migration job | `kubectl logs` hook pod; fix command |
| Values “ignored” | Wrong `-f` or typo in key | `helm get values`; schema validate |
| Subchart missing | Skipped `dependency build` | CI must run `helm dependency build` |
| Resources deleted on upgrade | `lookup` conditional dropped manifest | Remove lookup pattern; split chart |
| All resources deleted | Post-renderer returned empty | `set -euo pipefail` in renderer |
| `upgrade --install` hook on first install | Misread `.Release.IsUpgrade` | Test revision; upgrade Helm if bug on old patch |

---

## Best Practices

1. `values.schema.json` for required keys in large teams.
2. Library charts for shared labels (`_helpers.tpl`)—no copy-paste label blocks.
3. Keep CRD/operator installs as separate release when ordering matters.
4. Document non-obvious values in comments or VALUES.md.
5. OCI: pin chart version digest in GitOps repo consumed by `@argocd`.

---

## Limitations

- Helm does not build container images—CI updates tags/digests in values.
- `lookup` makes charts cluster-dependent and hard to test offline.
- Stop and ask if target cluster version, namespace policy, or CRD ownership is unclear.

---

## Related Skills

- `@kubernetes` — raw manifests and pod debugging
- `@argocd` — GitOps delivery of Helm releases
- `@docker` — image build and digest promotion
- `@github-actions` — lint/template in CI

---

## Agent Operational Directive

> **MANDATORY**: Never ship chart changes without `helm lint` and `helm template` output reviewed. Do not use `lookup` to conditionally omit resources unless ownership and upgrade behavior are explicitly designed—prefer two-chart sequential install. Keep production secrets out of Git values. Fail CI if post-render scripts can emit empty manifests.

---

## Source anchors (research)

- [Helm chart hooks](https://helm.sh/docs/topics/charts_hooks/)
- [Helm lookup function](https://helm.sh/docs/chart_template_guide/functions_and_pipelines/#using-the-lookup-function)
- [Issue: lookup same-chart install limitation](https://github.com/helm/helm/issues/13038)
- [Issue: lookup conditional deletes resources on upgrade](https://github.com/helm/helm/issues/10281)
- [Issue: post-renderer empty output deletes release](https://github.com/helm/helm/issues/13091)
