---
name: consul
description: "Operate HashiCorp Consul service discovery, health checks, KV (non-secrets), ACLs, and Connect intentions; keep odd-sized Raft quorums and never store passwords in KV."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["consul", "hashicorp", "service-discovery", "service-mesh", "acl", "kv", "health-checks", "connect"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# HashiCorp Consul AI Skill Guide (Claude)

## Overview & Engine Architecture

Consul provides **service discovery**, **health checking**, a hierarchical **KV** store, and optional **Connect** service mesh (mTLS + intentions). **Servers** form a Raft quorum; **client agents** on nodes register services and answer DNS (`*.service.consul`) / HTTP catalog queries. In any shared environment treat **ACLs as mandatory**—bootstrap once, store the management token offline, issue least-privilege tokens to agents and sidecars. Put secrets in `@vault`, not Consul KV.

```
┌─────────────────────────────────────────────────────────────┐
│                 Consul control plane                        │
│                                                             │
│  Servers (3 or 5) ──Raft──► leader + replicated state       │
│       ▲ gossip (LAN) / RPC                                  │
│  Client agents on nodes                                     │
│       ├── service + check registration                      │
│       ├── DNS :8600 / HTTP API catalog                      │
│       └── Connect: Envoy sidecars + intentions              │
│                                                             │
│  Multi-DC: WAN federation (8300/8302) + ACL replication     │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Registering services with HTTP/TCP/gRPC checks so load balancers and apps resolve **healthy** instances only.
- Central non-secret config in KV; prepared queries / resolvers for failover.
- Service mesh intentions (allow/deny) with Connect proxies—often beside `@nomad`.

**Do not use when**

- You need Kubernetes-native Service/Endpoints only and already run full K8s discovery → `@kubernetes`.
- The data is passwords, API keys, or certs → `@vault` (Consul KV is for config, not secret source of truth).
- Someone asks for a single Consul server “for prod simplicity” → refuse; require 3 or 5 voters.

---

## Operational Capabilities & Agent Directives

1. **Odd server quorum (3 or 5)** in production; separate clients from servers.
2. **Enable ACLs**; bootstrap once; never paste the bootstrap SecretID into Git or chat—create scoped tokens immediately.
3. **Honest health checks** with sensible `interval`/`timeout`; use `deregister_critical_service_after` for crash-loop cleanup.
4. **KV for config only**; integrate `@vault` for credentials and dynamic secrets.
5. **Intentions default-deny** in mesh environments; explicitly allow `web` → `api` (etc.).
6. **Multi-DC**: set `primary_datacenter`, enable ACL token replication on secondaries; verify `/v1/acl/replication`.
7. Tag services with env/version for canary routing; document gossip encryption key rotation separately from ACLs.
8. Never invent Gossip keys, ACL tokens, or TLS material—reference existing files/Secret backends.

---

## Production Example: register, discover, intention, ops checks

`api.service.hcl` (agent config snippet style / register JSON equivalent):

```json
{
  "service": {
    "name": "api",
    "id": "api-1",
    "port": 8080,
    "tags": ["prod", "v1"],
    "meta": {
      "version": "1.4.2"
    },
    "check": {
      "id": "api-http",
      "name": "HTTP API health",
      "http": "http://127.0.0.1:8080/healthz",
      "interval": "10s",
      "timeout": "2s",
      "deregister_critical_service_after": "30m",
      "failures_before_critical": 3
    }
  }
}
```

```bash
# Registration & discovery
consul services register api.json
consul catalog services
consul health service api -passing
dig @127.0.0.1 -p 8600 api.service.consul

# KV (non-secret config)
consul kv put apps/api/log_level info
consul kv get apps/api/log_level
consul kv export apps/api/ > api-kv-backup.json

# Connect intention (mesh)
consul intention create -allow web api
consul intention list

# Operator health
consul members
consul operator raft list-peers
consul info
```

ACL bootstrap (run once; store offline—do not commit):

```bash
consul acl bootstrap
# Immediately create agent/service tokens with least privilege; revoke/replace if exposed
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Empty DNS / no instances | Checks critical or not registered | `consul health service NAME`; fix check URL/port |
| Split views across clients | ACL denial or stale agent | Token policy; `consul members`; agent logs |
| Leader election churn | Network partition / disk IOPS | `raft list-peers`; stabilize disk & latency |
| KV / catalog denied | Missing ACL policy | Grant least-privilege `service`/`key` rules |
| Mesh connect timeout | Missing intention or sidecar token | `intention list`; ensure proxy has service token |
| Secondary DC auth fails | ACL replication broken | Check `primary_datacenter`, replication token, `/v1/acl/replication` |
| WAN join fails | 8300/8302 blocked | Open RPC/WAN gossip per federation model |
| Crash-loop still in DNS | No deregister-after | Set `deregister_critical_service_after` |

---

## Best Practices

1. Bootstrap ACLs before exposing UI/API beyond localhost.
2. Backup Raft/KV on a schedule; test restore in staging.
3. Prefer prepared queries / service resolvers for multi-DC failover designs.
4. Pair with `@nomad` service blocks for registration from jobspecs; `@traefik` can use Consul catalog as a provider.
5. Monitor Raft peer health and check critical counts as SLO signals.
6. Document token lifecycle (agent, service, replication, management offline).

---

## Limitations

- Consul health checks are not full APM—pair with metrics/tracing (`@opentelemetry`).
- Connect sidecars add CPU/latency and operational cost.
- Multi-DC WAN federation and ACL replication need careful network and identity planning.
- Stop and ask if datacenter topology, ACL state, or whether KV vs Vault is intended.

---

## Related Skills

- `@nomad` — scheduler that registers services into Consul
- `@vault` — secrets companion (not Consul KV)
- `@traefik` — edge proxy with Consul provider
- `@terraform` — provision Consul server/client fleet
- `@docker` — local Consul agent/dev containers for labs only

---

## Agent Operational Directive

> **MANDATORY**: Use 3/5 server voters in prod; enable ACLs and least-privilege tokens. Keep passwords out of KV (`@vault`). Make health checks reflect real readiness; set deregister-after for critical churn. Never invent or commit bootstrap/gossip/ACL secrets.

---

## Source anchors (research)

- [ACL bootstrap](https://developer.hashicorp.com/consul/docs/secure/acl/bootstrap)
- [Health check reference](https://developer.hashicorp.com/consul/docs/reference/service/health-check)
- [ACL replication for WAN federation](https://developer.hashicorp.com/consul/docs/secure/acl/token/federation)
- [Multi-cluster reference architecture](https://developer.hashicorp.com/consul/tutorials/production-multi-cluster/multi-cluster-reference-architecture)
