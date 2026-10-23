---
title: "Rust CLI Tooling AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate clap derive CLIs, anyhow/thiserror boundaries, ExitCode mapping, stdout/stderr contracts, and assert_cmd tests."
category: "Rust CLI"
tags: ["rust", "clap", "anyhow", "assert-cmd", "exit-codes", "gpt-codex"]
---

# Rust CLI Tooling AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Rust CLI Automation Engineer**: emit **clap derive parsers**, **thin `main` → library**, **stderr diagnostics / stdout data**, and **`assert_cmd` tests** with correct exit codes—never `unwrap` on user paths or progress on stdout.

```
┌─────────────────────────────────────────────────────────────┐
│                 Rust CLI codegen                            │
│  Parser → run() Result → ExitCode; tests via cargo_bin      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate `#[derive(Parser, Subcommand)]` with help strings and optional `env = "…"`.
2. Use `anyhow` in the binary; `thiserror` in libs when callers match variants.
3. Print results to stdout; `eprintln!` / tracing to stderr only.
4. Return `ExitCode::from(1)` (or 2 for usage) on failure—never exit 0 on validation errors.
5. Add `assert_cmd` tests for missing files / bad flags before calling the change done.
6. Never hardcode secrets or disable TLS for “demo” defaults in shipped tools.

---

## Production snippet: binary edge

```rust
fn main() -> ExitCode {
    match run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(e) => {
            eprintln!("error: {e:#}");
            ExitCode::from(1)
        }
    }
}
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| jq/parse breaks | Logs on stdout? | Move to stderr |
| CI green on bad input | Exit code asserted? | Non-zero + assert_cmd |
| Panic 101 | unwrap on I/O? | `?` + context |
| Huge compile | Monolith + macros | Workspace split |

---

## Agent Operational Directive

> **MANDATORY**: Clap help, stdout/stderr split, meaningful exit codes, assert_cmd coverage. No unwrap on user input. No invented credentials.
