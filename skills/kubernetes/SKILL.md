---
name: kubernetes
description: "Author and debug Kubernetes workloads with correct probes, quotas, and rollout semantics; distinguish OOM, probe-kill loops, and scheduling failures before kubectl guessing."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["kubernetes", "kubectl", "deployments", "probes", "rbac", "pod-security", "rollouts"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Kubernetes Cluster Operations AI Skill Guide (Claude)

## Overview & Engine Architecture

Kubernetes reconciles **declared desired state** (API objects in etcd) against **live cluster state** via controllers. The kubelet runs containers; the scheduler binds Pods to nodes; Services/Ingress route traffic only to **Ready** endpoints. Agents must think in **failure domains**: scheduling, image pull, probe kills, OOM, config, and admission/RBAC—not “restart the pod” as a default.

```
┌─────────────────────────────────────────────────────────────┐
│                 Kubernetes control & data plane             │
│                                                             │
│  Control plane                                              │
│  API server ←→ etcd; scheduler; controllers (Deploy/RS)     │
│  Admission: PSA, Kyverno/Gatekeeper, validating webhooks    │
│                                                             │
│  Node                                                       │
│  kubelet → containerd/CRI → Pod(s)                          │
│  ├── requests/limits → cgroup OOM vs eviction               │
│  ├── startup / readiness / liveness probes                    │
│  └── ServiceAccount + projected tokens                        │
│                                                             │
│  Traffic                                                    │
│  Service Endpoints ← readiness │ Ingress/Gateway API        │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Writing or reviewing Deployment/Service/Ingress (or Gateway) manifests.
- Debugging `Pending`, `CrashLoopBackOff`, `ImagePullBackOff`, rollout stalls, or 503 ingress.
- Setting resource requests/limits, probes, PodDisruptionBudgets, and NetworkPolicy sketches.

**Do not use when**

- Packaging many templated manifests → `@helm` or GitOps (`@argocd`).
- Provisioning the cluster/VPC/node pools → `@terraform`.
- Building container images → `@docker`.

---

## Operational Capabilities & Agent Directives

1. **Always set requests and limits** for CPU/memory; BestEffort pods are eviction bait and hide capacity planning.
2. **Probe discipline**: readiness gates traffic; liveness restarts; **startupProbe** for slow boot—never put DB dependency checks in liveness (DB blip → fleet restart).
3. **Pin images** by digest or immutable tag; `latest` is an incident waiting for a rollback you cannot do.
4. **Apply safely**: `kubectl apply --server-side --dry-run=server` (or client dry-run) before prod; prefer declarative GitOps over ad-hoc `kubectl edit` on managed apps.
5. **Never paste** kubeconfig, Secret values, or service account tokens into chat.
6. **Rollouts**: use `maxUnavailable`/`maxSurge`; watch `kubectl rollout status`; undo with `kubectl rollout undo` when Git tag is wrong.
7. **Secrets**: mount as volumes or use External Secrets / CSI; do not commit base64 Secret manifests to Git.

---

## Production Example: Deployment + Service + probes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels: { app: api, app.kubernetes.io/name: api }
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      serviceAccountName: api
      securityContext:
        runAsNonRoot: true
        seccompProfile: { type: RuntimeDefault }
      containers:
        - name: api
          image: ghcr.io/example/api:1.4.2@sha256:<digest>
          ports: [{ containerPort: 8080, name: http }]
          resources:
            requests: { cpu: "100m", memory: "256Mi" }
            limits: { cpu: "500m", memory: "512Mi" }
          startupProbe:
            httpGet: { path: /healthz, port: http }
            periodSeconds: 5
            failureThreshold: 30
          readinessProbe:
            httpGet: { path: /readyz, port: http }
            periodSeconds: 10
          livenessProbe:
            httpGet: { path: /livez, port: http }
            periodSeconds: 20
          envFrom:
            - configMapRef: { name: api-config }
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector: { app: api }
  ports: [{ port: 80, targetPort: http, name: http }]
```

Debug runbook:

```bash
kubectl get pods -n <ns> -o wide
kubectl describe pod <pod> -n <ns>
kubectl logs <pod> -n <ns> -c api --previous
kubectl get events -n <ns> --sort-by=.lastTimestamp | tail -20
kubectl get ep -n <ns> api -o yaml
kubectl rollout status deployment/api -n <ns>
```

---

## Technical Troubleshooting Matrix

| Symptom | Likely cause | First checks |
| :--- | :--- | :--- |
| `CrashLoopBackOff`, exit **137**, `OOMKilled` | Memory limit / leak | `describe` Last State; `kubectl top pod`; tune app heap < limit |
| `CrashLoopBackOff`, clean logs, Events **Killing … liveness** | Probe killing during boot | Add `startupProbe`; narrow liveness to process hang only |
| `Running` but not `Ready`, Ingress 503 | Readiness failing | Probe path/port; Endpoints empty; dependency in readiness (avoid) |
| `Pending` | Insufficient CPU/mem, taints, PVC bind | `describe` Events; node allocatable; PVC status |
| `ImagePullBackOff` | Wrong tag, missing pull secret | `describe` image; `imagePullSecrets`; registry auth |
| Surge of failures after GitOps sync | Thundering herd + probe timeout | Stagger sync; lighter probes; raise requests temporarily |
| Works locally in Docker, fails in K8s | Missing env, SA permissions, DNS | Compare env; `kubectl auth can-i`; in-cluster service DNS |

---

## Best Practices

1. One Deployment per stateless service; StatefulSet only when stable network ID/storage order matters.
2. PodDisruptionBudget when running <3 replicas in prod maintenance windows.
3. NetworkPolicy default-deny + explicit egress to DNS and dependencies.
4. Label with `app.kubernetes.io/*` conventions for selectors and observability.
5. Validate YAML in CI: `kubeconform`, kube-score, or policy checks before merge.
6. Pair with `@prometheus` RED metrics and alerts on crash loop rate, not only pod restarts.

---

## Limitations

- Managed clusters (EKS/GKE/AKS) add cloud IAM, CNI, and add-on-specific behavior.
- Admission policies may reject valid-looking YAML (capabilities, seccomp, hostPath).
- This skill does not replace org-specific incident runbooks or on-call escalation paths.
- Stop and ask if cluster context (`kubectl config`), namespace, or blast radius is unclear.

---

## Related Skills

- `@docker` — image build and local reproduction
- `@helm` — chart packaging and release lifecycle
- `@argocd` — GitOps sync and drift
- `@terraform` — cluster and node pool provisioning
- `@nginx` / `@traefik` — ingress data plane behavior
- `@vault` — secret injection patterns

---

## Agent Operational Directive

> **MANDATORY**: Classify pod failures using `describe` Events, exit codes, and `lastState.terminated.reason` before changing manifests. Use startupProbe for slow boots; keep liveness off external dependencies. Set requests/limits on every production container. Pin image digests. Never recommend `cluster-admin` or pasting Secret data to “unblock” a deploy.

---

## Source anchors (research)

- [GKE: Troubleshoot CrashLoopBackOff](https://cloud.google.com/kubernetes-engine/docs/troubleshooting/crashloopbackoff-events)
- [GKE: Troubleshoot OOM events](https://cloud.google.com/kubernetes-engine/docs/troubleshooting/oom-events)
- [Kubernetes probes concept](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes)
- Community: liveness vs readiness vs startup (probe-induced crash loops)
