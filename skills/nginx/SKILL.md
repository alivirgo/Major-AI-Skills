---
name: nginx
description: "Configure Nginx reverse proxies with TLS, rate limits, and Docker/K8s-safe upstream DNS; diagnose 502/504, probe kills, and buffering traps agents miss."
category: cross-platform
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["nginx", "reverse-proxy", "tls", "load-balancing", "docker", "ingress", "websocket"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Nginx High-Performance Reverse Proxy AI Skill Guide (Claude)

## Overview & Engine Architecture

Nginx terminates HTTP/TLS, serves static assets, and **reverse-proxies** to upstream apps using an event-driven worker model. Master parses config and binds ports; workers handle connections with **keepalive pools** to backends. In **Docker/Kubernetes**, upstream hostnames resolve at **config parse time** unless you use **`resolver` + variable `proxy_pass`**—the most common production footgun.

```
┌─────────────────────────────────────────────────────────────┐
│                 Nginx request path                          │
│                                                             │
│  Client → server { listen ssl http2 }                       │
│  ├── limit_req / WAF-adjacent headers                       │
│  ├── location → proxy_pass upstream (keepalive)             │
│  └── access_log / error_log                                 │
│                                                             │
│  Upstream                                                   │
│  ├── Static upstream { server ip:port }                     │
│  └── Dynamic DNS: resolver + set $backend + proxy_pass      │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Authoring reverse proxy, TLS termination, WebSocket upgrades, rate limits, gzip/brotli.
- Debugging 502/504/413, cert chain issues, duplicate upstream names, large upload buffering.
- Container ingress pairing with `@docker` / `@kubernetes` Services.

**Do not use when**

- Full API gateway auth/OAuth/rate-limit SaaS features → dedicated gateway or service mesh.
- Kubernetes Ingress controller choice/architecture → ingress controller docs + `@kubernetes`; Nginx skill covers **config semantics**.

---

## Operational Capabilities & Agent Directives

1. **`nginx -t` before every reload**; hot reload (`nginx -s reload`) for zero-downtime on config changes.
2. **Forward headers**: `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`; trust only known hop IPs for client IP decisions.
3. **WebSockets**: `proxy_http_version 1.1`, `Upgrade`, `Connection "upgrade"`.
4. **Docker/K8s upstreams**: `resolver 127.0.0.11 valid=10s ipv6=off;` (Docker DNS) or cluster DNS IP; use variable form:
   `set $upstream http://api:8080; proxy_pass $upstream;`
5. **TLS**: full chain (`fullchain.pem`), modern protocols (TLS 1.2+), HSTS only when HTTPS is stable on all hosts.
6. **Streaming/long requests**: raise `proxy_read_timeout`; set `proxy_buffering off` for SSE; `proxy_max_temp_file_size 0` for large downloads.
7. **Rate limits**: `limit_req_zone` + burst; return 429, don’t pass abuse to app tier.

---

## Production Configuration: TLS + dynamic upstream (Docker)

```nginx
limit_req_zone $binary_remote_addr zone=api_rl:10m rate=20r/s;

upstream backend_api {
    least_conn;
    server 127.0.0.1:8001 max_fails=3 fail_timeout=10s;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        limit_req zone=api_rl burst=10 nodelay;
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
    }
}

# Docker service name pattern (api container may boot after nginx)
server {
    listen 80;
    server_name internal-api.local;
    resolver 127.0.0.11 valid=10s ipv6=off;
    set $docker_upstream http://api:8080;
    location / {
        proxy_pass $docker_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Validation:

```bash
nginx -t
docker run --rm -v "$PWD/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t
nginx -s reload
```

---

## Technical Troubleshooting Matrix

| Signature | Root cause | Fix |
| :--- | :--- | :--- |
| `[emerg] host not found in upstream` at container start | Static resolve before peer exists | `resolver` + variable `proxy_pass` |
| `502 Bad Gateway` | Upstream down / wrong port / SELinux | Curl upstream; `httpd_can_network_connect` on RHEL |
| `504 Gateway Timeout` | `proxy_read_timeout` exceeded | Increase timeout; disable buffering for streams |
| `413 Request Entity Too Large` | Default 1m body limit | `client_max_body_size` in server/http |
| SSL untrusted | Leaf without intermediate | Use `fullchain.pem`; test with `openssl s_client` |
| Duplicate upstream name | Two files define same `upstream foo` | Unique names; grep conf.d |
| Download stops ~1GB | Temp file buffering limit | `proxy_max_temp_file_size 0`; streaming off |

---

## Best Practices

1. Separate `sites-available` / `sites-enabled` (Debian) or `conf.d/*.conf` (RHEL/Alpine)—one concern per file.
2. Log format includes `$request_time` and `$upstream_response_time` for latency splits.
3. CI: containerized `nginx -t` on every PR touching config (`@github-actions`).
4. Pair with `@prometheus` nginx-prometheus-exporter for connection/upstream metrics.
5. Never expose stub_status publicly without ACL.

---

## Limitations

- Nginx does not replace WAF, OAuth, or mTLS service mesh policies at scale.
- Windows nginx paths differ (`C:\nginx\`); reload semantics same, tooling differs.
- OpenResty/Lua modules are out of scope unless explicitly requested.
- Stop and ask if cert issuance method (ACME DNS vs HTTP-01) and public DNS are unknown.

---

## Related Skills

- `@docker` — compose networking and health-gated startup
- `@kubernetes` — Ingress controllers using nginx data plane
- `@lets-encrypt` — certificate lifecycle
- `@prometheus` / `@grafana` — edge latency and error dashboards
- `@github-actions` — config lint in CI

---

## Agent Operational Directive

> **MANDATORY**: Run `nginx -t` before reload. In container orchestration, use dynamic upstream resolution (`resolver` + variable `proxy_pass`) so Nginx does not fail startup when backends are still booting. Redirect HTTP to HTTPS in production. Do not disable TLS verification upstream without documented trust boundaries.

---

## Source anchors (research)

- [Nginx proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Docker embedded DNS 127.0.0.11](https://docs.docker.com/engine/network/#dns-server)
- Community: duplicate upstream across conf.d; SELinux 502; proxy temp file 1GB limit
