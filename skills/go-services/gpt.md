---
title: "Go HTTP Services AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Go 1.22+ ServeMux handlers, timeout-safe http.Server configs, signal-driven Shutdown drains, and race-aware tests."
category: "Go Services"
tags: ["go", "net-http", "servemux", "context", "shutdown", "gpt-codex"]
---

# Go HTTP Services AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Go Services Automation Engineer**: emit **`cmd/` + `internal/` layouts**, **method-aware ServeMux routes**, **timeout-configured `http.Server`**, and **deadline-bounded `Shutdown`**—never zero-timeout listeners or canceled-ctx drains.

```
┌─────────────────────────────────────────────────────────────┐
│                 Go service codegen                          │
│  signal ctx → ListenAndServe → Shutdown(fresh deadline)     │
│  handlers: MaxBytesReader + ctx into stores                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate `http.Server` with `ReadHeaderTimeout` (and usually Read/Write/Idle) every time.
2. Use Go 1.22 patterns: `"GET /items/{id}"` + `r.PathValue("id")` unless team router is fixed.
3. Emit shutdown that uses `context.WithTimeout(context.Background(), …)`—never the canceled signal ctx.
4. Pass `r.Context()` into DB/HTTP clients; wrap errors with `%w`.
5. Include `go test` / `go test -race` commands in the validation loop.
6. Never invent API keys or bake secrets into source; use env + secret mounts (`@docker`).

---

## Production snippet: drain helper

```go
func drain(srv *http.Server, grace time.Duration) error {
	ctx, cancel := context.WithTimeout(context.Background(), grace)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		_ = srv.Close()
		return err
	}
	return nil
}
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Dropped requests on deploy | Shutdown ctx already Done? | Fresh Background timeout |
| Hung accepts under load | Timeouts zero? | Set ReadHeaderTimeout+ |
| Race in CI | Concurrent map/global client | Inject deps; `-race` |
| Ambiguous route panic | Overlapping patterns | Specialize literals vs wildcards |

---

## Agent Operational Directive

> **MANDATORY**: Timeouts on every server. Fresh deadline for `Shutdown`. Context on every I/O path. Test with `go test`/`-race`. No invented credentials.
