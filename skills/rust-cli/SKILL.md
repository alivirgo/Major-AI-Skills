---
name: rust-cli
description: "Operational skill for Rust CLIs: clap argument parsing, error handling with anyhow/thiserror, Cargo workspace layout, and distributable binaries."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["rust", "cli", "clap", "cargo", "binaries", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Rust CLI Tooling AI Skill Guide

## Overview & Engine Architecture

Rust CLIs are Cargo binary crates (often in a workspace) that parse args with `clap`, report errors with `anyhow` at the binary edge and `thiserror` in libraries, and exit with meaningful codes. Agents keep I/O fallible, avoid `unwrap` in non-demo paths, and design subcommands that compose well in scripts (stdout data, stderr diagnostics).

```
cargo run -p tool
      |
   clap::Parser
      |
  subcommands -> library crates
      |
  ExitCode + stderr messages
```

## When to use this skill

- Building command-line tools in Rust
- Adding subcommands, flags, and env-backed defaults
- Structuring library + bin crates for reuse
- Preparing release builds and cross-compilation basics

## Operational directives

1. Derive `clap::Parser` / `Subcommand`; document help strings for every flag.
2. Use `anyhow::Result` in `main`; map to library `thiserror` types underneath.
3. Write machine-friendly stdout when the tool is meant for pipes; put progress on stderr.
4. Prefer `std::fs` / `std::process::Command` with explicit error context (`.with_context`).
5. Run `cargo fmt` and `cargo clippy -D warnings` before calling a change done.

## CLI sketch

```rust
use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "inventory", version, about = "Inventory helper CLI")]
struct Cli {
    #[command(subcommand)]
    cmd: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Count lines in a file
    Count { path: PathBuf },
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.cmd {
        Commands::Count { path } => {
            let data = std::fs::read_to_string(&path)
                .with_context(|| format!("read {}", path.display()))?;
            println!("{}", data.lines().count());
        }
    }
    Ok(())
}
```

## Commands

```bash
cargo new inventory --bin
cargo add clap --features derive
cargo add anyhow
cargo run -- count ./README.md
cargo build --release
cargo clippy -- -D warnings
```

## Common pitfalls

| Pitfall | Why it hurts | Fix |
| --- | --- | --- |
| `unwrap` in main paths | Hostile UX on bad input | `?` + context |
| Logging on stdout | Breaks pipes | stderr / tracing |
| Giant single crate | Slow compile, weak reuse | workspace libs |
| Ignoring exit codes | Bad CI scripting | `ExitCode` / `Main` Result |

## Best practices

- Support `--format json` for automation when output grows complex.
- Add a `tests/` CLI smoke test with `assert_cmd` / `predicates` when stable.
- Document required env vars in `--help` and README.
- Pin MSRV in `Cargo.toml` if you support older toolchains.

## Limitations

- Cross-compiling needs target toolchains and sometimes zig/linker setup.
- Async CLIs (tokio) add complexity - use only when concurrent I/O dominates.
- Signal handling and TTY color detection are OS-sensitive.

## Related skills

- `@python-packaging` - shipping CLIs in Python instead
- `@go-services` - Go alternative for simple static binaries
- `@docker` - distributing CLIs in images when needed
