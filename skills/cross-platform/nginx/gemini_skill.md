---
title: "Nginx High-Performance Reverse Proxy AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, configure, and troubleshoot Nginx access logs, load balancing waterfalls, SSL chains, and caching."
category: "High-Performance HTTP Server & Reverse Proxy"
tags: ["nginx", "reverse-proxy", "gemini", "log-diagnostics", "http-waterfall", "load-balancing"]
---

# Nginx High-Performance Reverse Proxy AI Skill Guide (Gemini)

## Overview & Engine Architecture
Nginx powers the majority of high-traffic web architectures, serving static content in microseconds and routing dynamic traffic across distributed application servers. Gemini acts as an AI Infrastructure Specialist and Traffic Analyst, specializing in **multimodal Nginx access/error log analysis**, **HTTP latency waterfall diagnostics**, **upstream health check audits**, and **micro-caching architectures**.

### Architecture & Traffic Routing Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Nginx Traffic Processing Stack              │
│                                                             │
│  Ingress & Security Layer                                   │
│  ├── TLS 1.3 Termination & SNI Host Dispatcher              │
│  ├── Geolocation & IP CIDR Blocking Rules                   │
│  └── Sliding Window Rate Limiting (Token Bucket Algorithm)  │
│                                                             │
│  Proxying & Cache Acceleration                              │
│  ├── `proxy_cache_path` Memory Zone (Zone Sharded Fast Cache│
│  ├── Upstream Health Checks & Passive Circuit Breaking      │
│  └── Content-Type-Specific Gzip / Brotli Compression        │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Log & Error Triage**: Analyze screenshots of Grafana dashboards, Nginx access logs (`$status`, `$request_time`, `$upstream_response_time`), and network waterfall charts to pinpoint latency spikes and HTTP 502/504 surges.
2. **Micro-Caching Architecture Design**: Author `proxy_cache` configurations that cache dynamic GET requests for 1–5 seconds (`proxy_cache_valid 200 5s;`), shielding backend databases from traffic storms.
3. **HTTP/2 and HTTP/3 (QUIC) Implementation**: Configure modern multiplexed protocols to eliminate head-of-line blocking on mobile and high-latency networks.
4. **Automated Static Asset Optimization**: Configure `expires max;` headers, Brotli compression modules, and `try_files $uri $uri/ /index.html;` for Single Page Applications (SPA).

---

## Production Configuration Recipe: High-Performance SPA & Micro-Cache

Save this configuration as `/etc/nginx/conf.d/frontend_app.conf`:

```nginx
# Micro-cache storage path: 10MB memory keys, 1GB disk cache
proxy_cache_path /var/cache/nginx/microcache levels=1:2 keys_zone=MICROCACHE:10m max_size=1g inactive=10m use_temp_path=off;

server {
    listen 80;
    server_name app.enterprise.io;
    root /var/www/frontend_app/dist;
    index index.html;

    # Gzip Compression for JS/CSS bundles
    gzip on;
    gzip_min_length 1024;
    gzip_types text/css application/javascript application/json image/svg+xml;

    # 1. Single Page Application (SPA) Route Fallback
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # 2. Immutable Static Assets (Vite/Webpack hashed chunks)
    location ~* \.(?:css|js|woff2?|png|jpg|jpeg|gif|ico|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 3. Dynamic API Gateway with Micro-Caching
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # Micro-cache Configuration
        proxy_cache MICROCACHE;
        proxy_cache_valid 200 302 5s;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`404 Not Found` on Browser Refresh in SPA (React / Vue)** | Nginx attempted to locate a physical directory on disk for client-side router paths (e.g. `/dashboard/settings`). | Add `try_files $uri $uri/ /index.html;` inside the root `location /` block to route requests back to the frontend bundle. |
| **Access Log Shows Spike in 499 Status Codes** | Client closed connection (`Client Closed Request`) before Nginx could receive a response from the slow upstream backend. | 1. Optimize slow upstream backend queries.<br>2. Increase `proxy_read_timeout`.<br>3. Check client-side AJAX/fetch timeout configurations. |
| **`X-Cache-Status` Header Always Returns `BYPASS` or `MISS`** | Upstream server sets `Set-Cookie` or `Cache-Control: private, no-cache`, instructing Nginx not to cache responses. | 1. In upstream backend, strip unnecessary `Set-Cookie` on public GET routes.<br>2. In Nginx, use `proxy_ignore_headers Set-Cookie Cache-Control;` for public API endpoints. |
| **`worker_connections are not enough` in Error Log** | High concurrent connection volume exceeded `worker_connections` budget in `nginx.conf`. | 1. In `events` block, increase `worker_connections 4096;` or `10240;`.<br>2. Increase OS file descriptor limits: `ulimit -n 65535` and `/etc/security/limits.conf`. |

---

## Command Line Syntax & Server Control

```bash
# Verify Configuration Syntax and Active Modules
nginx -T

# Graceful Stop Worker Processes
nginx -s quit

# Test URL with Curl and Inspect Nginx Cache Status Header
curl -I https://app.enterprise.io/api/catalog
```

### Key Configuration Locations
- **Master Config**: `/etc/nginx/nginx.conf`
- **Cache Directory**: `/var/cache/nginx/`
- **Default Web Root**: `/var/www/html/`

---

## Agent Operational Directive
> **MANDATORY**: For Single Page Applications (React, Vue, Next.js static export), always configure `try_files $uri $uri/ /index.html;` to prevent 404 errors on deep linking. Use micro-caching (`proxy_cache`) to absorb sudden traffic spikes.
