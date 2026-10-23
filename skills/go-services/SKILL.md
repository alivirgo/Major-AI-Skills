---
name: go-services
description: "Build production Go HTTP services with Go 1.22+ ServeMux patterns, context cancellation, graceful Shutdown deadlines, middleware, race-safe tests, and multi-stage Docker binaries."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["go", "golang", "net-http", "servemux", "context", "graceful-shutdown", "middleware", "testing"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Go HTTP Services AI Skill Guide (Claude)

## Overview & Engine Architecture

Go services ship as **single static binaries**: `net/http` (or a thin `http.Handler` router) accepts traffic, **goroutines** handle concurrency, and **`context.Context`** carries deadlines and cancellation into DB/HTTP clients. Since **Go 1.22**, stdlib `ServeMux` supports method + wildcard patterns (`GET /items/{id}`). Agents treat timeouts, context propagation, and **deadline-bounded `Shutdown`** as first-class contracts—not optional polish.

```
┌─────────────────────────────────────────────────────────────┐
│                 Go HTTP service path                          │
│                                                             │
│  main / cmd/<svc>                                           │
│  ├── signal.NotifyContext → cancel root ctx                 │
│  └── http.Server{ timeouts + Handler }                      │
│                                                             │
│  Handler stack                                              │
│  ├── middleware: recover / request-id / access log          │
│  ├── ServeMux: "METHOD /path/{id}" → handlers               │
│  └── handlers → services → stores (ctx first arg)           │
│                                                             │
│  Lifecycle                                                  │
│  ├── readiness flip → srv.Shutdown(fresh deadline ctx)      │
│  └── close pools / workers (reverse init order)             │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Building REST/JSON backends, workers fronted by HTTP, or internal APIs in Go.
- Structuring `cmd/` + `internal/` modules, middleware, and table-driven `go test`.
- Fixing leaked goroutines, ignored contexts, missing server timeouts, or broken graceful drain.

**Do not use when**

- The product surface is GraphQL schema/resolvers → `@graphql-apis` (Go host still OK for transport).
- You need managed PaaS Node stacks as the primary runtime → `@nodejs` / `@express` / `@nextjs`.
- Someone asks to hardcode secrets, open `0.0.0.0` admin debug without auth, or disable TLS verification in prod → refuse; use env/secret stores and `@docker`/`@vault` patterns.

---

## Operational Capabilities & Agent Directives

1. **Context first**: every I/O method takes `ctx context.Context` as the first parameter; pass `r.Context()` (or a child with timeout) into stores and outbound clients.
2. **Server timeouts always**: set at least `ReadHeaderTimeout`; usually also `ReadTimeout`, `WriteTimeout`, `IdleTimeout`. Zero-value `http.Server` never times out (Slowloris risk).
3. **Prefer Go 1.22+ ServeMux patterns** (`GET /items/{id}`, `r.PathValue("id")`) unless the team already standardized on chi/echo/gin.
4. **Wrap errors with `%w`**; map to stable HTTP status at the edge; do not panic for control flow.
5. **Graceful shutdown**: on SIGTERM, use a **fresh** `context.WithTimeout(context.Background(), …)` for `srv.Shutdown`—never the already-canceled signal ctx (instant abort).
6. **One shared `http.Client`** (with `Timeout`) per outbound dependency; never `http.Get` / new client per request (pool thrash).
7. **Quality gates**: `go test ./...`, `go test -race` on concurrent packages, `go vet`; put binaries under `cmd/<name>`.

---

## Production Example: ServeMux + timeouts + drain

```go
package main

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type ItemIn struct {
	SKU string `json:"sku"`
	Qty int    `json:"qty"`
}

func createItem(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var in ItemIn
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}
	if in.SKU == "" || in.Qty < 0 {
		http.Error(w, "invalid item", http.StatusBadRequest)
		return
	}
	// pass r.Context() into stores; honor cancel on client disconnect
	w.Header().Set("content-type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]any{"sku": in.SKU, "qty": in.Qty})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	mux.HandleFunc("POST /items", createItem)

	srv := &http.Server{
		Addr:              ":8080",
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	root, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	errCh := make(chan error, 1)
	go func() {
		slog.Info("listening", "addr", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
		close(errCh)
	}()

	select {
	case <-root.Done():
		slog.Info("shutdown signal")
	case err := <-errCh:
		if err != nil {
			slog.Error("server crashed", "err", err)
			os.Exit(1)
		}
	}

	// Fresh deadline — do NOT pass canceled root ctx into Shutdown
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 25*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("drain failed", "err", err)
		_ = srv.Close()
		os.Exit(1)
	}
}
```

Layout + validation:

```bash
go mod init example.com/inventory
# cmd/inventory-api/main.go  internal/…
go test ./...
go test -race ./...
go vet ./...
go build -trimpath -ldflags="-s -w" -o bin/inventory-api ./cmd/inventory-api
```

Multi-stage image: pair with `@docker` (builder → scratch/distroless non-root). Datastore migrations: golang-migrate / goose beside `@postgresql`.

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| 502s / dropped in-flight on deploy | `Shutdown` got canceled signal ctx → instant return | Fresh `WithTimeout(context.Background(), …)` for drain |
| Handlers keep running after client leave | Ignored `r.Context()` / no `select` on `ctx.Done()` | Propagate ctx into DB/HTTP; cancel long work |
| Slowloris / hung conns | Missing `ReadHeaderTimeout` (and friends) | Set server timeouts; per-route `TimeoutHandler` if needed |
| `panic: … patterns … conflict` at start | Ambiguous ServeMux overlaps | Make one pattern more specific; fix registration |
| Connection pool exhaustion outbound | New `http.Client`/`Transport` per request | One client; raise `MaxIdleConnsPerHost` if fan-out |
| Flaky tests / data races | Shared maps, global mutable clients | Inject deps; `go test -race` |
| Binary huge / glibc mismatch in container | cgo or fat base | `CGO_ENABLED=0`; multi-stage `@docker` |
| Worker never exits on SIGTERM | `for { … }` without ctx | `select` on `ctx.Done()` in loops |

---

## Best Practices

1. Binaries in `cmd/<name>`; libraries in `internal/` (or versioned `pkg/` only when truly public).
2. Structured logging (`slog`) with request ID from middleware; never log secrets or full auth headers.
3. Limit request bodies (`MaxBytesReader`); validate JSON before side effects.
4. Prefer interfaces at **boundaries you mock**; do not interface every struct.
5. Migrations are versioned SQL (migrate/goose)—not ad-hoc `Exec` in `main`.
6. Health: liveness cheap; readiness reflects dependency reachability when the platform uses both.

---

## Limitations

- Generics help; heavy abstraction fights Go readability and review speed.
- cgo / certain crypto/OS deps complicate static and scratch builds.
- `Shutdown` does not drain `Hijack`ed connections (WebSockets)—coordinate via `RegisterOnShutdown`.
- Framework choice (chi, Echo, Gin, Fiber) should follow team norms; this skill defaults to stdlib.

---

## Related Skills

- `@docker` — multi-stage Go builds, non-root runtime, Compose readiness
- `@postgresql` — typical datastore and connection hygiene
- `@graphql-apis` — GraphQL schema/resolvers when the API is GraphQL
- `@nodejs` / `@express` — alternative HTTP stacks when the org standard is Node
- `@typescript` — typed clients calling this service

---

## Agent Operational Directive

> **MANDATORY**: Propagate `context.Context` into all I/O. Configure `http.Server` timeouts. On SIGTERM, drain with a **fresh deadline context**—never the canceled signal context. Prefer Go 1.22+ ServeMux patterns; run `go test` / `-race` before declaring success. Never invent credentials or commit secrets.

---

## Source anchors (research)

- [Go 1.22 routing enhancements](https://go.dev/blog/routing-enhancements)
- [Graceful shutdown: fresh deadline for `Shutdown`](https://www.nazarboyko.com/articles/graceful-shutdown-in-go-services)
- [VictoriaMetrics: graceful shutdown patterns](https://victoriametrics.com/blog/go-graceful-shutdown/)
