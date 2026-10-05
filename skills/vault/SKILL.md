---
name: vault
description: "Configure Vault auth methods, least-privilege policies, and dynamic secrets with correct K8s TokenReview wiring; never log secret material or treat root tokens as routine."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["vault", "secrets", "kv-v2", "approle", "kubernetes-auth", "leases", "transit"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# HashiCorp Vault Secrets AI Skill Guide (Claude)

## Overview & Engine Architecture

Vault centralizes **secrets**, **encryption (Transit)**, and **dynamic credentials** (DB, PKI, cloud) behind **authentication** and **ACL policies**. Clients authenticate → receive a **token with lease TTL** → access only allowed paths. HA depends on **storage backend** and **unseal** procedures (Shamir or auto-unseal)—agents document patterns but never invent production unseal keys.

```
┌─────────────────────────────────────────────────────────────┐
│                 Vault request path                          │
│                                                             │
│  Auth (K8s / AppRole / OIDC / cloud)                        │
│       ↓ token + policies                                    │
│  Secret engines: KV v2, database, PKI, Transit              │
│       ↓ leases / versions                                   │
│  Audit devices → immutable log (no secret echo in chat)     │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Designing KV v2 path layouts, policies, AppRole for CI, Kubernetes auth for pods.
- Issuing dynamic DB credentials vs long-lived passwords in Git.
- Incident response: revoke leases/tokens after leak.

**Do not use when**

- Storing TLS certs for public websites only → `@lets-encrypt` may suffice; Vault PKI for internal mesh.
- Replacing full IAM for humans—Vault complements, rarely replaces cloud SSO for operators.

---

## Operational Capabilities & Agent Directives

1. **Never paste** root tokens, unseal keys, wrapped tokens, or secret payloads into chat/logs.
2. **KV v2 paths**: use `secret/data/...` for reads/writes; `secret/metadata/...` for policies; enable versioning; use `cas` for concurrent writers.
3. **Least privilege policies**: narrow path prefixes; separate read vs admin; test with non-admin token.
4. **Dynamic secrets preferred** over static KV for databases; always **revoke leases** on rotation/incident (`vault lease revoke -prefix`).
5. **Kubernetes auth gotcha**: Vault calls **TokenReview API**—reviewer JWT needs `system:auth-delegator`; short-lived reviewer tokens expiring breaks all logins.
6. **Vault in-cluster**: omit `token_reviewer_jwt`, use local projected SA token with periodic reload (Vault ≥1.9.3); set `disable_local_ca_jwt=true` when using client JWT as reviewer per docs.
7. **AppRole**: short `token_ttl`, bind `secret_id` delivery out-of-band; rotate role IDs on compromise.
8. **Audit devices** early; protect audit sink integrity.

---

## Production Example: policy + K8s auth role

Policy `api-prod.hcl`:

```hcl
path "secret/data/api/prod" {
  capabilities = ["read"]
}
path "secret/metadata/api/prod" {
  capabilities = ["read", "list"]
}
path "database/creds/api-readonly" {
  capabilities = ["read"]
}
```

Enable and configure (sketch):

```bash
vault secrets enable -path=secret kv-v2
vault policy write api-prod api-prod.hcl

vault auth enable kubernetes
vault write auth/kubernetes/config \
  kubernetes_host="https://kubernetes.default.svc:443" \
  disable_local_ca_jwt=true

vault write auth/kubernetes/role/api \
  bound_service_account_names=api \
  bound_service_account_namespaces=api \
  token_policies=api-prod \
  token_ttl=20m
```

ClusterRoleBinding for reviewer SA (when external Vault):

```yaml
# vault-auth SA needs system:auth-delegator to call TokenReview
```

AppRole for CI (short TTL):

```bash
vault auth enable approle
vault write auth/approle/role/ci token_policies="api-prod" token_ttl=15m token_max_ttl=1h
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix |
| :--- | :--- | :--- |
| `403 tokenreviews forbidden` | Reviewer SA lacks delegator | ClusterRoleBinding `system:auth-delegator` |
| All K8s logins fail after ~24h | Expired reviewer JWT | In-cluster Vault or rotate long-lived reviewer |
| `permission denied` on path | Policy typo / wrong mount | `vault token capabilities` with test token |
| Leaked approle secret_id | Credential theft | Rotate secret_id; revoke accessors |
| Sealed vault | Restart/unseal event | Operator unseal ceremony—agents don’t guess keys |
| DB creds still work after revoke | App cached password | Revoke lease + restart app |

---

## Best Practices

1. Namespaces (Enterprise) or strict path prefixes for team isolation in OSS.
2. Break-glass root procedure documented offline; no root in Git.
3. Prefer **Transit** for app-level crypto without exporting key material.
4. Pair with `@kubernetes` CSI/driver or external-secrets for pod injection.
5. Run rotation drills; measure time-to-revoke.

---

## Limitations

- Vault outage is critical path—design HA, backups, and unseal custody.
- Mis-scoped policies are common; always validate with dedicated test tokens.
- Agents must stop and ask for seal status, namespace, and auth method before destructive revoke.

---

## Related Skills

- `@kubernetes` — service accounts, projected tokens, injectors
- `@terraform` — Vault provider resources (if used)
- `@github-actions` — AppRole/OIDC for CI secrets
- `@mysql` / `@postgresql` — dynamic DB engines

---

## Agent Operational Directive

> **MANDATORY**: Never output secret values or root/unseal material. Default to dynamic secrets and short TTLs. For Kubernetes auth, verify TokenReview permissions and reviewer JWT lifetime. On leak: revoke token/lease first, then rotate upstream credentials. Test policies with non-admin tokens before declaring least privilege done.

---

## Source anchors (research)

- [Vault Kubernetes auth](https://developer.hashicorp.com/vault/docs/auth/kubernetes)
- [Kubernetes auth API](https://developer.hashicorp.com/vault/api-docs/auth/kubernetes)
- [HashiCorp: TokenReview 403 / auth-delegator](https://support.hashicorp.com/hc/en-us/articles/17058982377747)
- [Short-lived K8s tokens and reviewer JWT](https://github.com/hashicorp/web-unified-docs/blob/main/content/vault/v1.21.x/content/docs/auth/kubernetes.mdx)
