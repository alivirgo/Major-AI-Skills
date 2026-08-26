# Major AI Skills

> **Installable GitHub library of agentic skills / AI agent skills (`SKILL.md` playbooks) for Claude Code, Cursor, Codex CLI, Gemini CLI, Antigravity, and more — focused on professional apps, token efficiency, and practical prompting habits.**

**Current release: V2.0.0.** Flat `skills/<id>/SKILL.md` layout, multi-host `npx` installer, catalog index, specialized plugins, and bundles — with deep product skill content (CAD, video, 3D, design, desktop utilities) plus efficiency and common-sense skills.

Coding agents can install exact skill IDs into the directory their host watches. You keep control: preview with `--dry-run`, filter by `--skills` / `--category`, or install a specialized pack.

```text
Project / task
  -> you (or the agent) pick exact skill IDs from the catalog
  -> npx major-ai-skills --<host> --skills <ids> --dry-run
  -> review the plan
  -> install without --dry-run
  -> invoke with @skill-id
```

This is an independent community project. Product names (SolidWorks, Raycast, Claude, Cursor, Antigravity, etc.) are referenced only to describe compatibility and skill scope.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Anthropic-purple)](https://claude.ai)
[![Cursor](https://img.shields.io/badge/Cursor-AI%20IDE-orange)](https://cursor.sh)
[![Codex CLI](https://img.shields.io/badge/Codex%20CLI-OpenAI-green)](https://github.com/openai/codex)
[![Gemini CLI](https://img.shields.io/badge/Gemini%20CLI-Google-blue)](https://github.com/google-gemini/gemini-cli)
[![Antigravity](https://img.shields.io/badge/Antigravity-AI%20IDE-red)](https://github.com/alivirgo/Major-AI-Skills)
[![Skills](https://img.shields.io/badge/Skills-292-blueviolet)](CATALOG.md)
[![npm](https://img.shields.io/npm/v/major-ai-skills?color=cb3837&label=npm)](https://www.npmjs.com/package/major-ai-skills)
[![Direct skill distribution](https://img.shields.io/badge/Direct%20skills-npx%20major--ai--skills-black)](#installation)
[![Website](https://img.shields.io/badge/Website-GitHub%20Pages-success)](https://alivirgo.github.io/Major-AI-Skills/)
[![llms.txt](https://img.shields.io/badge/llms.txt-GEO%20ready-0ea5e9)](https://alivirgo.github.io/Major-AI-Skills/llms.txt)

## Why This Repo

- **Agentic skills that are installable, not just inspirational**: `npx major-ai-skills --claude|--cursor|--codex|--gemini|--antigravity` places `SKILL.md` where your AI coding assistant already looks.
- **Product-depth skill library**: CAD, video, 3D, GIS, medical, music, ERP, forensics, PLC, desktop utilities — not only generic coding tips.
- **Efficiency + common sense**: token-saving techniques and plain-English prompting habits in the same catalog.
- **Built for major agent workflows**: Claude Code skills, Cursor skills, Codex CLI skills, Gemini CLI skills, Antigravity skills, Kiro, OpenCode, and custom paths.
- **Focused delivery**: specialized plugins and bundles so you do not overload Antigravity / Cursor context windows.
- **Inspect before installing**: `--dry-run`, [CATALOG.md](CATALOG.md), and [skills_index.json](skills_index.json).

### Why not only browse folders?

A flat `SKILL.md` skill library with stable IDs, an index, and a host-aware installer turns prose into reproducible local agent capability — the distribution pattern popular search traffic expects from modern agent-skill repos, applied to **our** genuine skills.

## Table of Contents

- [Why This Repo](#why-this-repo)
- [Installation](#installation)
- [Recommended Specialized Plugins](#recommended-specialized-plugins)
- [Choose Your Tool](#choose-your-tool)
- [Quick FAQ](#quick-faq)
- [Bundles & Workflows](#bundles--workflows)
- [Browse the Catalog](#browse-the-catalog)
- [Compare Alternatives](#compare-alternatives)
- [Contributing](#contributing)
- [License](#license)

## Installation

Prefer an exact reviewed set. Full Antigravity installs can exhaust context because the host watches `~/.agents/skills`.

### Direct skill install

```bash
# Preview an exact set for Antigravity
npx major-ai-skills --antigravity --skills raycast,ffmpeg,blender --dry-run

# Cursor
npx major-ai-skills --cursor --skills solidworks,figma,vscode

# Claude Code
npx major-ai-skills --claude --category cad,efficiency

# Codex
npx major-ai-skills --codex --skills playwright,docker,supabase
```

### Verify

```bash
# macOS / Linux
test -d ~/.cursor/skills && ls ~/.cursor/skills

# Windows PowerShell
Test-Path "$HOME\.cursor\skills"
```

### Run your first skill

```text
Use @blender to batch-rename mesh objects and export a clean FBX.
```

## Recommended Specialized Plugins

Start with the pack that matches the job:

| Plugin | Best for |
| --- | --- |
| MAS CAD Studio | Mechanical and industrial design apps |
| MAS Video Lab | Edit / motion / transcode workflows |
| MAS 3D & Games | DCC tools and game engines |
| MAS Design & Knowledge | Figma, Photoshop, Obsidian, Notion, Linear |
| MAS Desktop Ops | OS utilities + Docker + VS Code |
| MAS Efficiency Pack | Token and context savings |
| MAS Common Sense Pack | Everyday prompting habits |

Details: [docs/users/plugins.md](docs/users/plugins.md) · manifests in [`plugins/`](plugins/).

## Choose Your Tool

| Tool | Install | First use |
| --- | --- | --- |
| Cursor | `npx major-ai-skills --cursor --skills <ids>` | `@raycast help me build a Script Command` |
| Claude Code | `npx major-ai-skills --claude --skills <ids>` | Ask Claude to use `@solidworks` |
| Codex CLI | `npx major-ai-skills --codex --skills <ids>` | Use `@docker` to harden a Compose file |
| Gemini CLI | `npx major-ai-skills --gemini --skills <ids>` | Use `@figma` to map components to code |
| Antigravity IDE | `npx major-ai-skills --antigravity --skills <ids> --dry-run` | Install only after review |
| Antigravity CLI (agy) | `npx major-ai-skills --agy --skills <ids>` | `/ffmpeg compress this clip` |
| Kiro | `npx major-ai-skills --kiro --skills <ids>` | Use `@obsidian` to structure a vault |
| OpenCode | `npx major-ai-skills --opencode --category efficiency` | `@csv-over-json-tables` |
| Custom path | `npx major-ai-skills --path ./my-skills --skills <ids>` | Depends on your host |

Guides:

- [Getting Started](docs/users/getting-started.md)
- [Claude Code skills](docs/users/claude-code-skills.md)
- [Cursor skills](docs/users/cursor-skills.md)
- [Codex CLI skills](docs/users/codex-cli-skills.md)
- [Gemini CLI skills](docs/users/gemini-cli-skills.md)
- [Antigravity skills](docs/users/antigravity-skills.md)
- [AI agent skills guide](docs/users/ai-agent-skills.md)

## Quick FAQ

### What are agentic skills / AI agent skills?

**Agentic skills** (also called **AI agent skills**, **Claude Code skills**, **Cursor skills**, or `SKILL.md` playbooks) are reusable instruction packages that teach coding agents how to run a workflow with clearer constraints. Major AI Skills is an installable skill library of those playbooks focused on professional apps and efficient prompting.

### What is Major AI Skills?

A curated, installable GitHub library of **292+ agent skills** for Claude Code, Cursor, Codex CLI, Gemini CLI, Antigravity, and related AI coding assistants — covering CAD, video, 3D, design, desktop utilities, devops tools, token efficiency, and common-sense habits.

### How do I install Claude Code skills or Cursor skills from this repo?

```bash
npx major-ai-skills --claude --skills <ids>
npx major-ai-skills --cursor --skills <ids>
```

See [claude-code-skills.md](docs/users/claude-code-skills.md) and [cursor-skills.md](docs/users/cursor-skills.md).

### Should I install everything?

No. Prefer `--skills` or `--category`, or a specialized plugin. Antigravity watches `~/.agents/skills` — a full dump can exhaust context. Use `--all` only when you intentionally accept that risk.

### Where did the old folders go?

Application, efficiency, and common-sense skills now live under `skills/<id>/SKILL.md`. Optional model variants remain as `gpt.md` / `gemini.md` inside the same folder.

### How do I browse?

- [CATALOG.md](CATALOG.md)
- [skills_index.json](skills_index.json)
- [Hosted site](https://alivirgo.github.io/Major-AI-Skills/)

## Bundles & Workflows

| Surface | Answers | Use it for |
| --- | --- | --- |
| Specialized plugin | What should I install for this domain? | Focused packs |
| Bundle | Which skills belong together? | Role-based discovery |
| Workflow | What order should the agent run skills in? | Outcome playbooks |

- Bundles: [docs/users/bundles.md](docs/users/bundles.md)
- Workflows: [docs/users/workflows.md](docs/users/workflows.md)

## Browse the Catalog

What you get in this repository:

- **Skills library** in [`skills/`](skills/)
- **Installer CLI** via the npm package (`major-ai-skills`)
- **Generated catalog** in [`CATALOG.md`](CATALOG.md) and [`skills_index.json`](skills_index.json)
- **Plugins & bundles** in [`plugins/`](plugins/) and [`data/bundles.json`](data/bundles.json)
- **Docs** under [`docs/`](docs/)
- **GitHub Pages** site in [`index.html`](index.html)

Categories include: CAD, video, 3D, games, design, knowledge, desktop (macOS/Windows/Linux), GIS, scientific, medical, music, ERP, enterprise, EDA, forensics, PLC, network, efficiency, common-sense, devops, automation, testing, office, and more.

## Compare Alternatives

High-intent guides for people comparing skill libraries on Google / GitHub / AI answer engines:

- **[Best Claude Code skills on GitHub](https://alivirgo.github.io/Major-AI-Skills/best-claude-code-skills/)** — HTML landing (also [md](docs/users/best-claude-code-skills-github.md))
- **[Best Cursor skills on GitHub](https://alivirgo.github.io/Major-AI-Skills/best-cursor-skills/)** — HTML landing (also [md](docs/users/best-cursor-skills-github.md))
- **[Best Antigravity skills](https://alivirgo.github.io/Major-AI-Skills/best-antigravity-skills/)**
- **[What are AI agent skills?](https://alivirgo.github.io/Major-AI-Skills/what-are-agent-skills/)**
- **[Major AI Skills vs agentic-awesome-skills](https://alivirgo.github.io/Major-AI-Skills/vs-agentic-awesome-skills/)**
- **[Professional app skills](https://alivirgo.github.io/Major-AI-Skills/app-skills/)** — SolidWorks, Blender, Figma, …
- **[AI answer engines / GEO](docs/users/ai-answer-engines.md)** — ChatGPT, Perplexity, Gemini, Copilot, Claude citation surfaces
- Large coding catalogs such as [agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills) remain excellent for generic agent workflows; Major AI Skills specializes in **product-depth** and **efficiency** skills you can install beside them

Machine-readable discovery for answer engines and agents:

- https://alivirgo.github.io/Major-AI-Skills/llms.txt
- https://alivirgo.github.io/Major-AI-Skills/llms-full.txt
- https://alivirgo.github.io/Major-AI-Skills/skills_index.json
- [skills_index.json](skills_index.json) (repo copy)

## Contributing

- Add skills under `skills/<skill-name>/SKILL.md`
- Start from [docs/contributors/skill-template.md](docs/contributors/skill-template.md)
- Validate with `npm run validate` and refresh the index with `npm run index`
- See [CONTRIBUTING.md](CONTRIBUTING.md)

## Community

- [Discussions](https://github.com/alivirgo/Major-AI-Skills/discussions) for ideas
- [Issues](https://github.com/alivirgo/Major-AI-Skills/issues) for bugs
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) · [SECURITY.md](SECURITY.md)

## License

MIT — see [LICENSE](LICENSE).
