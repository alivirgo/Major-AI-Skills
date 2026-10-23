---
title: "Rust CLI Tooling AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose Rust CLI pipe breakage, wrong exit codes, clap usage failures, unwrap panics, and assert_cmd gaps from terminal output."
category: "Rust CLI"
tags: ["rust", "gemini", "diagnostics", "clap", "exit-codes", "assert-cmd"]
---

# Rust CLI Tooling AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Rust CLI Diagnostics Specialist**: read **stderr/stdout, exit codes, and panic hooks** to separate **stdout pollution**, **silent success (exit 0)**, **unwrap panics (101)**, and **missing integration tests**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Rust CLI multimodal triage                  │
│  Pipe parse fail → noise on stdout?                         │
│  CI passed wrongly → exit 0 on Err?                         │
│  exit 101 → panic/unwrap on user path                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Broken pipes / jq errors** → inspect what landed on stdout; move logs to stderr.
2. **Exit 0 with error text** → fix `main` to map `Err` → non-zero `ExitCode`.
3. **exit 101** → hunt `unwrap`/`expect` on I/O; replace with `?` + context.
4. **Clap confusion** → verify help strings and required args; suggest usage exit 2.
5. **Never ask** users to paste private keys or tokens into chat.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| JSON parse fails in script | Progress on stdout | Sample stdout capture |
| `$?` is 0 after failure | Result ignored / exit missing | `main` return path |
| Panic backtrace | unwrap on missing file | stack frame |
| No tests for CLI | Only unit tests | `tests/*.rs` presence |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose stdout/stderr and exit codes before rewriting clap schema. Prefer assert_cmd proofs. Never request secrets in chat.
