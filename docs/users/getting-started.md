# Getting Started

## Install a focused set

```bash
# Preview first
npx major-ai-skills --cursor --skills raycast,ffmpeg --dry-run

# Then install
npx major-ai-skills --cursor --skills raycast,ffmpeg
```

## Install by category

```bash
npx major-ai-skills --claude --category macos,efficiency
```

## Full library (explicit)

```bash
npx major-ai-skills --codex --all
```

Antigravity watches `~/.agents/skills`. A full dump can exhaust context — always prefer `--skills` or `--category` there, or pass `--all` only when you intentionally accept the risk.

## First prompt

```text
Use @raycast to scaffold a Script Command that opens the current Finder folder in VS Code.
```

## Browse

- [CATALOG.md](../CATALOG.md) — full registry
- [Bundles](bundles.md) — role-based starter packs
- [Workflows](workflows.md) — ordered playbooks
- [Plugins](plugins.md) — specialized distributions
- [AI answer engines](ai-answer-engines.md) — llms.txt / GEO for ChatGPT, Perplexity, Gemini, Copilot, Claude
- [llms.txt](../../llms.txt) — curated machine index
