# Changelog

## 2.4.1 - 2026-10-06

- Terminal tip after install/search/list: Buy Ali a coffee → https://bmc.link/alivirgo
- npm `funding` field and README community link for the same short URL

## 2.4.0 - 2026-10-06

- Deepened **50 high-impact skills** across Days 1–5 of the skill improvement backlog (AI workflow stubs, core DevOps, data platforms, app/automation stack, and creative/CAD/video tools).
- Day 1: production-grade rewrites for RAG retrieval audits, eval datasets, JSON contracts, prompt regression gates, cost/latency benchmarks, citation verification, PII redaction, human handoff, injection boundary tests, and tool replay.
- Days 2–5: ops-hardened rewrites with `gpt.md` / `gemini.md` variants for Docker/K8s/Terraform/CI/observability, databases & messaging, Next.js/React/Stripe/Playwright/n8n, and Blender/Unity/FFmpeg/Figma/CAD/Remotion (plus plugin mirrors where applicable).
- Added tracked backlog at `docs/skill-improvement-backlog.md` (412 skills / 10 per day).
- Synchronized Claude, Codex, Gemini, and plugin manifest versions with the npm release.

## 2.3.0 - 2026-09-11

- Added read-only task search with bounded JSON results, category filtering, and exact install commands.
- Added discovery regression tests and weekly public aggregate adoption snapshots.
- Prepared marketplace submission materials with explicit review evidence and evaluation gaps.
- Synchronized all marketplace and Gemini versions with the npm release.

## 2.2.0 - 2026-09-11

- Added ten focused AI workflow skills: evaluation datasets, RAG retrieval audits, JSON contracts, citation verification, PII redaction, injection boundary testing, tool replay, prompt regression gates, cost/latency benchmarks, and human handoff contracts.
- Expanded the canonical catalog from 392 to 402 skills and added the MAS AI Workflows plugin for Claude Code and Codex.
- Synchronized plugin bundles with canonical content and added native Codex marketplace manifests, publisher metadata, and CI drift checks.
- Added a crawlable web catalog with per-skill anchors and corrected current release/download links.
- Included marketplace manifests, plugin bundles, and Gemini extension metadata in npm archives.

## 2.1.1 - 2026-09-01

- Added a daily npm-download graph to the GitHub and npm package README.
- Added an automated workflow that refreshes the graph every 12 hours.

## 2.1.0 - 2026-08-26

### Added

- **100 new skills** (catalog 292 -> 392): cloud/devops (Kubernetes, Terraform, Helm, GitHub Actions, AWS/GCP/Azure CLIs, ...), data/ML (Postgres, Redis, Pandas, Spark, Hugging Face, ...), web/mobile (Next.js, FastAPI, React, Flutter, ...), and SaaS/security (Stripe, Jira, Salesforce, Semgrep, CodeQL, ...)
- Gemini CLI extension manifest (gemini-extension.json) and distribution docs

### Changed

- README, site, and llms.txt skill counts updated to 392
- Package version bump for npm + GitHub Packages + GitHub Release

## 2.0.0 - 2026-08-26

### Highlights

- **Installable skill library**: flat `skills/<id>/SKILL.md` layout compatible with Claude Code, Cursor, Codex CLI, Gemini CLI, and Antigravity
- **CLI**: `npx major-ai-skills` with `--dry-run`, `--skills`, `--category`, and host flags
- **Catalog**: `CATALOG.md` + `skills_index.json` for humans and machines
- **Plugins & bundles**: specialized packs for CAD, video, 3D, design, desktop utilities, devops tools, token efficiency, and common-sense habits
- **SEO + GEO**: high-intent docs, `llms.txt` / `llms-full.txt`, FAQ JSON-LD, AI-crawler-friendly `robots.txt`
- **New product skills**: Blender, Unity, Unreal, Premiere, After Effects, Photoshop, Figma, Obsidian, Notion, VS Code, Docker, Excel, n8n, Linear, Slack, Remotion, Playwright, Supabase

### Breaking

- Old paths `efficiency ai skills/` and `common sense ai skills/` are replaced by flat `skills/<id>/` entries (`category: efficiency` | `common-sense`)
- Per-app `claude_skill.md` is now canonical `SKILL.md` (optional `gpt.md` / `gemini.md` retained)

## 1.x

Prior releases shipped nested category folders and GitHub Pages catalog only (pre-installer).
