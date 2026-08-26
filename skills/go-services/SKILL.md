---
name: go-services
description: "Operational skill for Go HTTP services: modules, idiomatic handlers, context cancellation, middleware, testing, and lean deployable binaries."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["go", "golang", "http", "modules", "services", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Go HTTP Services AI Skill Guide

## Overview & Engine Architecture

Go services are typically single static binaries with `net/http` (or a thin router), goroutines for concurrency, and `context.Context` for deadlines and cancellation. Agents keep packages small, return errors explicitly (no panic for control flow), propagate context into DB/HTTP clients, and use `go test` table-driven tests as the default quality gate.

```
main -> http.Server
          |
     mux / chi / echo
          |
   handlers -> services -> stores
          |
     context cancel / timeout
```

## When to use this skill

- Building REST/JSON backends in Go
- Structuring modules (`go.mod`) and internal packages
- Fixing leaked goroutines or ignored contexts
- Hardening graceful shutdown

## Operational directives

1. Accept `context.Context` as the first parameter on I/O methods.
2. Wrap errors with `%w` and handle at the edge with stable HTTP status mapping.
3. Prefer stdlib `net/http` + small router unless the team already standardized.
4. Run `go vet` and race detector on critical packages (`go test -race`).
5. Set read/write/idle timeouts on `http.Server` - never listen with zero timeouts in prod.

## Handler sketch

```go
package main

import (
  "encoding/json"
  "net/http"
  "time"
)

type ItemIn struct {
  SKU string `json:"sku"`
  Qty int    `json:"qty"`
}

func createItem(w http.ResponseWriter, r *http.Request) {
  var in ItemIn
  if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&in); err != nil {
    http.Error(w, "bad json", http.StatusBadRequest)
    return
  }
  if in.SKU == "" || in.Qty < 0 {
    http.Error(w, "invalid item", http.StatusBadRequest)
    return
  }
  w.Header().Set("content-type", "application/json")
  w.WriteHeader(http.StatusCreated)
  _ = json.NewEncoder(w).Encode(map[string]any{"id": 1, "sku": in.SKU, "qty": in.Qty})
}

func main() {
  mux := http.NewServeMux()
  mux.HandleFunc("POST /items", createItem)
  srv := &http.Server{
    Addr:              ":8080",
    Handler:           mux,
    ReadHeaderTimeout: 5 * time.Second,
  }
  _ = srv.ListenAndServe()
}
```

## Commands

```bash
go mod init example.com/service
go test ./...
go test -race ./...
go build -o bin/service ./cmd/service
```

## Common pitfalls

| Pitfall | Why it hurts | Fix |
| --- | --- | --- |
| Ignoring `ctx.Done()` | Work continues after client leave | Select on ctx / pass down |
| Naked `go func()` without recovery | Process crash | Supervised workers |
| Global mutable clients | Flaky tests | Inject dependencies |
| No server timeouts | Slowloris risk | Set timeouts |

## Best practices

- Put binaries under `cmd/<name>` and libraries under `internal/`.
- Use structured logging (`slog`) with request IDs.
- Migrate SQL with a real tool (golang-migrate, goose) - not ad-hoc scripts only.
- Prefer interfaces at boundaries you need to mock; do not interface everything.

## Limitations

- Generics help but heavy abstraction can fight Go readability.
- cgo and certain crypto/OS deps complicate static builds.
- Framework choice (Gin, Echo, Fiber) should follow team norms.

## Related skills

- `@docker` - multi-stage Go builds
- `@postgresql` - typical datastore
- `@graphql-apis` - GraphQL servers in Go ecosystems
