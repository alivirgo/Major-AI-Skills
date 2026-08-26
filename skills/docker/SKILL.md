---
name: docker
description: "Operational skill for Claude to automate Docker via CLI, Dockerfiles, Compose, BuildKit, multi-stage builds, and container networking hygiene."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["docker", "dockerfile", "compose", "buildkit", "containers", "cli", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Docker Containers & Compose AI Skill Guide (Claude)

## Overview & Engine Architecture
Docker packages applications as **images** run as **containers**, orchestrated locally with **Docker Compose** and built via **BuildKit**. Core artifacts are `Dockerfile`, `compose.yaml`, and registries. Claude operates as a Principal Container Platform Engineer, specializing in **multi-stage builds**, **layer caching**, **Compose service graphs**, **healthchecks**, and **safe volume/network patterns**.

### Docker Engine & Tooling Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Docker Architecture                         │
│                                                             │
│  Build                                                      │
│  ├── Dockerfile + BuildKit / buildx                         │
│  ├── Multi-stage targets / cache mounts                     │
│  └── Image tags → registry                                  │
│                                                             │
│  Runtime                                                    │
│  ├── Containers / namespaces / cgroups                      │
│  ├── Networks / volumes / bind mounts                       │
│  └── Healthchecks / restart policies                        │
│                                                             │
│  Compose & CLI                                              │
│  ├── compose.yaml services/depends_on                       │
│  ├── docker build/run/exec/logs/compose                     │
│  └── Contexts (local / remote / desktop)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multi-Stage Builds**: Separate build and runtime stages to minimize final image size.
2. **Non-Root Runtime**: Prefer non-root users in final stages when feasible.
3. **Pin Bases**: Use digest or explicit tags; avoid `latest` in production.
4. **Compose Clarity**: One responsibility per service; explicit ports, env, and healthchecks.
5. **Secret Hygiene**: Use BuildKit secrets / Compose secrets — never `ENV PASSWORD=...` in images.

---

## Production Dockerfile + Compose

`Dockerfile`:

```dockerfile
# ==============================================================================
# Multi-stage Node API image (BuildKit)
# ==============================================================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER app
EXPOSE 3000
HEALTHCHECK CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

`compose.yaml`:

```yaml
services:
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: app
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 5s
      timeout: 5s
      retries: 10
    volumes: ["pgdata:/var/lib/postgresql/data"]
volumes:
  pgdata:
```

CLI:

```bash
docker buildx build -t myorg/api:1.2.3 --target runner .
docker compose up --build -d
docker compose logs -f api
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Huge image size** | Build tools left in final stage. | Multi-stage; copy only artifacts. |
| **Compose DNS name fails** | Wrong service name / network. | Use service DNS; `docker compose ps`. |
| **Permission denied on volume** | UID mismatch with bind mount. | Align user/uid or adjust host perms. |
| **Cache not busting** | COPY order wrong. | Copy lockfiles first; invalidate deliberately. |

---

## Best Practices

1. `.dockerignore` node_modules, `.git`, secrets.
2. Prefer `HEALTHCHECK` + Compose `condition: service_healthy`.
3. Use `docker compose config` to validate rendered YAML.

### Essential Paths
- **Dockerfile** / **compose.yaml** at repo root (or `/deploy`)
- **CLI**: `docker`, `docker compose`, `docker buildx`

---

## Agent Operational Directive
> **MANDATORY**: Prefer multi-stage Dockerfiles and pinned base tags. Keep secrets out of image layers. Validate Compose with healthchecks and explicit service dependencies.
