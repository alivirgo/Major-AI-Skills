# Changelog

## 2.0.0 — 2026-08-26

### Highlights

- **Installable skill library**: flat `skills/<id>/SKILL.md` layout compatible with Claude Code, Cursor, Codex CLI, Gemini CLI, and Antigravity
- **CLI**: `npx major-ai-skills` with `--dry-run`, `--skills`, `--category`, and host flags
- **Catalog**: `CATALOG.md` + `skills_index.json` for humans and machines
- **Plugins & bundles**: specialized packs for CAD, video, design, desktop, efficiency, and common sense
- **SEO + GEO**: high-intent docs (`best-claude-code-skills-github`, `best-cursor-skills-github`, …), `llms.txt` / `llms-full.txt`, FAQ JSON-LD, AI-crawler-friendly `robots.txt`
- **New product skills**: Blender, Unity, Unreal, Premiere, After Effects, Photoshop, Figma, Obsidian, Notion, VS Code, Docker, Excel, n8n, Linear, Slack, Remotion, Playwright, Supabase

### Breaking

- Old paths `efficiency ai skills/` and `common sense ai skills/` are replaced by flat `skills/<id>/` entries (`category: efficiency` | `common-sense`)
- Per-app `claude_skill.md` is now canonical `SKILL.md` (optional `gpt.md` / `gemini.md` retained)

## 1.x

Prior releases shipped nested category folders and GitHub Pages catalog only (pre-installer).
