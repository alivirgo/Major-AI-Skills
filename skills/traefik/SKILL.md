---
name: traefik
description: "Deploy Traefik v3 edge routing with Docker/Kubernetes providers, middleware chains, ACME TLS (acme.json mode 600), and exposedbydefault=false so agents do not accidentally publish every container."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-09-13"
tags: ["traefik", "reverse-proxy", "ingress", "docker", "kubernetes", "letsencrypt", "acme", "middleware"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Traefik Cloud-Native Edge Router AI Skill Guide (Claude)

## Overview & Engine Architecture

Traefik is a dynamic HTTP reverse proxy / ingress: **EntryPoints** (ports) → **Routers** (rules + TLS) → **Middlewares** → **Services** (upstreams). Providers (Docker, Kubernetes IngressRoute/CRDs, Consul, Nomad) discover backends without static upstream reloads. ACME (Let's Encrypt) stores certs in **`acme.json` (mode 600)**—persist it or crash-loops burn LE rate limits. Always set **`exposedByDefault=false`** on Docker hosts so unlabeled containers stay private.

```
┌─────────────────────────────────────────────────────────────┐
│                 Traefik request pipeline (v3)               │
│                                                             │
│  Client → EntryPoints (web :80, websecure :443)             │
│           └── optional HTTP→HTTPS redirect at entrypoint    │
│                                                             │
│  Routers: Host(`api.example.com`) && PathPrefix(`/v1`)      │
│           └── TLS certResolver (ACME TLS/HTTP/DNS challenge)│
│                                                             │
│  Middlewares (order matters): rateLimit → auth → stripPrefix│
│                                                             │
│  Services: LB + healthcheck → container/pod upstreams       │
│  Providers: Docker labels | K8s CRDs | file | Consul/Nomad  │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Edge routing for Docker Compose / Swarm-style hosts or K8s IngressRoute.
- Automatic ACME TLS, middleware security chains, and dynamic service discovery.
- Replacing static `@nginx` upstream files when backends churn often.

**Do not use when**

- You need full service mesh mTLS / intentions as the primary control plane → `@consul` Connect or mesh product.
- Cluster ingress policy is already standardized on another controller and team runbooks assume it.
- Someone asks to leave `exposedByDefault=true` on a busy multi-stack host “for convenience” → refuse; require explicit `traefik.enable=true`.

---

## Operational Capabilities & Agent Directives

1. **`providers.docker.exposedbydefault=false`** always; only label intended public services with `traefik.enable=true`.
2. **Pin a shared Docker network** (`providers.docker.network=proxy`) so Traefik and backends share connectivity; set explicit `loadbalancer.server.port`.
3. **`acme.json` mode 600** and persist across restarts; use LE **staging** `caServer` while experimenting to avoid rate limits.
4. **One Traefik owns one acme.json**—do not share the file across replicas (ACME concurrency).
5. **Middleware order**: rate limit → ForwardAuth/BasicAuth → path/header transforms.
6. **HTTPS redirect at EntryPoint** (`web` → `websecure`), not duplicated on every router.
7. **Health checks** on services so unhealthy replicas are ejected.
8. Never invent Cloudflare/DNS API tokens for DNS challenge—reference env/secret mounts only.

---

## Production Example: Compose edge + ACME + explicit expose

```bash
mkdir -p letsencrypt
touch letsencrypt/acme.json && chmod 600 letsencrypt/acme.json
```

`compose.yaml`:

```yaml
services:
  traefik:
    image: traefik:v3.4
    restart: unless-stopped
    security_opt: [no-new-privileges:true]
    ports: ["80:80", "443:443"]
    networks: [proxy]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt/acme.json:/acme.json
    command:
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --providers.docker.network=proxy
      - --entrypoints.web.address=:80
      - --entrypoints.web.http.redirections.entrypoint.to=websecure
      - --entrypoints.web.http.redirections.entrypoint.scheme=https
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.le.acme.email=admin@example.com
      - --certificatesresolvers.le.acme.storage=/acme.json
      - --certificatesresolvers.le.acme.tlschallenge=true
      # While testing: --certificatesresolvers.le.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory
    labels:
      - traefik.enable=true
      - traefik.http.middlewares.sec-headers.headers.stsSeconds=31536000
      - traefik.http.middlewares.sec-headers.headers.frameDeny=true
      - traefik.http.middlewares.sec-headers.headers.contentTypeNosniff=true

  app:
    image: traefik/whoami:v1.10
    restart: unless-stopped
    networks: [proxy]
    labels:
      - traefik.enable=true
      - traefik.http.routers.app.rule=Host(`app.example.com`)
      - traefik.http.routers.app.entrypoints=websecure
      - traefik.http.routers.app.tls.certresolver=le
      - traefik.http.routers.app.middlewares=sec-headers
      - traefik.http.services.app.loadbalancer.server.port=80

networks:
  proxy:
    name: proxy
```

Validation:

```bash
docker compose config
docker compose up -d
docker logs traefik 2>&1 | tail -n 50
curl -I http://app.example.com          # expect redirect to https
openssl s_client -connect app.example.com:443 -servername app.example.com </dev/null
```

### Kubernetes note

Prefer Traefik **IngressRoute** CRDs (or Ingress) with explicit Entrypoint/TLS; keep dashboard and API bound to internal networks only. Pair with `@kubernetes` / `@helm` chart values—never expose the dashboard publicly without auth middleware.

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `permissions of acme.json are too open` | Host umask created 0644/0660 | `chmod 600 acme.json`; restart Traefik |
| ACME rate limit / repeated issuance | acme.json not persisted; crash loop | Persist volume; use staging CA while debugging |
| 404 on configured Host | Rule mismatch / not enabled / wrong entrypoint | Confirm `Host(...)` exact; `traefik.enable=true`; router entrypoints |
| 502 Bad Gateway | Wrong internal port or networks isolated | Set `loadbalancer.server.port`; join shared `proxy` network |
| Intermittent 522 / config churn | `exposedbydefault=true` on busy host | Set `false`; enable only public services ([upstream reports](https://github.com/traefik/traefik/issues/13321)) |
| TLS challenge timeout | Port 80/443 blocked or DNS A/AAAA wrong | Fix DNS/firewall; consider DNS challenge |
| Middleware conflict | Same middleware name, different params | Unique middleware names; reference once |
| Cert works then “unknown resolver” | acme.json perms flipped after upgrade | Init/chmod 600 before start |

---

## Best Practices

1. Disable anonymous usage / version checks in locked-down prod if policy requires.
2. JSON access logs filtered to 4xx/5xx; keep DEBUG only during incidents.
3. Trusted forwarded headers only for known CDN/proxy CIDRs.
4. Prefer DNS challenge behind CDN when HTTP/TLS challenges cannot reach origin.
5. Pair edge Traefik with `@docker` Compose graphs or `@kubernetes` IngressRoute—not both fighting for :443 on one IP without a plan.
6. Document every public `Host()` rule in the repo README.

---

## Limitations

- ACME storage is not multi-writer; HA Traefik needs an external cert strategy or coordinated leader design.
- Docker socket mount is powerful—prefer read-only and minimize who can start Traefik.
- Traefik is not a substitute for app authZ; ForwardAuth still needs a real IdP.
- Stop and ask if domain ownership, DNS challenge credentials, or public expose scope are unclear.

---

## Related Skills

- `@docker` — Compose networks, labels, and socket mounts
- `@kubernetes` / `@helm` — IngressRoute / chart installs
- `@consul` / `@nomad` — alternate discovery providers
- `@nginx` — static reverse-proxy alternative
- `@vault` — secrets for DNS challenge providers (not in Git)

---

## Agent Operational Directive

> **MANDATORY**: Set `exposedbydefault=false` and explicit `traefik.enable=true` on public services only. Persist `acme.json` with mode 600; use staging ACME while experimenting. Put Traefik and backends on a shared network with explicit upstream ports. Never invent ACME/DNS API credentials.

---

## Source anchors (research)

- [Traefik Docker expose guide (v3.4)](https://doc.traefik.io/traefik/v3.4/expose/docker/)
- [Docker provider routing reference](https://doc.traefik.io/traefik/v3.5/reference/routing-configuration/other-providers/docker/)
- [ACME / storage mode 600](https://doc.traefik.io/traefik/https/acme/)
- [exposedbydefault churn report](https://github.com/traefik/traefik/issues/13321)
