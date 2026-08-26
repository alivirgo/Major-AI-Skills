---
name: kubernetes
description: "Operational skill for agents to design, debug, and operate Kubernetes workloads with kubectl, Deployments, Services, Ingress, ConfigMaps, Secrets, and rollout hygiene."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["kubernetes", "kubectl", "k8s", "deployments", "ingress", "yaml", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Kubernetes Cluster Operations AI Skill Guide

## Overview & Engine Architecture

Kubernetes schedules container workloads across nodes through a declarative API. Desired state lives in objects (Pod, Deployment, Service, Ingress, ConfigMap, Secret); controllers continuously reconcile cluster state toward that desire. Agents act as platform engineers: write correct manifests, diagnose scheduling and crash loops, and avoid cluster-admin shortcuts that bypass RBAC and Pod Security.

```
+------------------------------------------------------------------+
|                     Kubernetes control plane                     |
|  API server  ->  etcd  <-  controllers / scheduler               |
+------------------------------+-----------------------------------+
                               |
                    kubelet + runtime (containerd)
                               |
              +----------------+----------------+
              | Pods / Deployments / ReplicaSets|
              | Services / Endpoints / Ingress  |
              | ConfigMaps / Secrets / PVC      |
              +---------------------------------+
```

## When to use this skill

- Authoring or reviewing Deployment/Service/Ingress YAML
- Debugging `Pending`, `CrashLoopBackOff`, `ImagePullBackOff`, or failed rollouts
- Setting resource requests/limits, probes, and safe ConfigMap/Secret mounts
- Designing least-privilege ServiceAccounts and NetworkPolicies (sketches)

## Operational directives

1. Prefer **Deployments** (or StatefulSets/DaemonSets when required) over naked Pods.
2. Always set **resources.requests** and **resources.limits** for CPU/memory.
3. Use **readiness** probes for traffic and **liveness** probes only for true deadlocks.
4. Apply with `--dry-run=client` (and server-side dry-run when available) before production applies.
5. Never paste kubeconfig tokens, cloud IAM keys, or Secret values into chat logs.

## Manifest pattern (Deployment + Service)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels: { app: api }
spec:
  replicas: 2
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      serviceAccountName: api
      securityContext:
        runAsNonRoot: true
      containers:
        - name: api
          image: ghcr.io/example/api:1.4.2
          ports: [{ containerPort: 8080 }]
          resources:
            requests: { cpu: "100m", memory: "128Mi" }
            limits: { cpu: "500m", memory: "512Mi" }
          readinessProbe:
            httpGet: { path: /healthz, port: 8080 }
            initialDelaySeconds: 5
            periodSeconds: 10
          envFrom:
            - configMapRef: { name: api-config }
---
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector: { app: api }
  ports: [{ port: 80, targetPort: 8080 }]
```

## Debugging runbook

```bash
kubectl get pods -A
kubectl describe pod <pod> -n <ns>
kubectl logs <pod> -n <ns> -c <container> --previous
kubectl get events -n <ns> --sort-by=.lastTimestamp
kubectl rollout status deployment/api -n <ns>
kubectl rollout undo deployment/api -n <ns>
```

| Symptom | Likely cause | First checks |
| --- | --- | --- |
| Pending | Resources / affinity / PVC | `describe` Events, node capacity |
| ImagePullBackOff | Tag, registry auth | image name, imagePullSecrets |
| CrashLoopBackOff | App exit / bad config | logs --previous, command/args |
| 503 via Ingress | readiness failing | endpoints, probe path |

## Best practices

- Pin image tags or digests; avoid `latest` in production.
- Keep Secrets out of Git; inject via sealed-secrets, CSI drivers, or external secret operators.
- Separate namespaces by environment or team; default-deny NetworkPolicy where feasible.
- Review RBAC RoleBindings before granting `cluster-admin`.

## Limitations

- Managed distributions (EKS/GKE/AKS) add cloud-specific IAM and CNI behavior.
- Admission policies (OPA/Gatekeeper/Kyverno, PSA) may reject otherwise valid YAML.
- This skill does not replace incident runbooks for a specific cluster.

## Related skills

- `@docker` - image build and Compose local loops
- `@helm` - chart packaging when many manifests repeat
- `@terraform` - cluster and node pool provisioning
