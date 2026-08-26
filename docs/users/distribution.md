# Where to publish / discover Major AI Skills

Channels you can use from this repo. Status reflects what is already live vs what needs one more step.

## Live now (done from this workspace)

| Channel | How users get it | Status |
| --- | --- | --- |
| **npm** | `npx major-ai-skills` | Live - https://www.npmjs.com/package/major-ai-skills |
| **GitHub Packages** | `@alivirgo/major-ai-skills` | Live + public - repo Packages sidebar |
| **GitHub Release** | `major-ai-skills-2.1.0.tgz` on v2.1.0 | Live |
| **GitHub Pages** | Browse + SEO landings | Live - https://alivirgo.github.io/Major-AI-Skills/ |
| **Claude self-marketplace** | `/plugin marketplace add alivirgo/Major-AI-Skills` | Ready (`.claude-plugin/marketplace.json`) |
| **skills.sh** | `npx skills add alivirgo/Major-AI-Skills` | Live via GitHub; ranking grows with installs |
| **GitHub Discussions** | Q&A / discovery pages | Enabled |
| **Gemini CLI gallery** | Topic `gemini-cli-extension` + `gemini-extension.json` | Manifest added; crawler indexes daily after push |
| **Medium** | SEO/GEO explainer article | Live - [What are AI agent skills?](https://medium.com/@alithetechguy/what-are-ai-agent-skills-claude-code-cursor-skill-md-explained-plus-392-skill-library-to-instal-a4218fa6f0b5) |

## Ready to submit (manual click / PR)

| Channel | Action | Link |
| --- | --- | --- |
| **Claude official plugin directory** | Submit marketplace for Discover tab | https://clau.de/plugin-directory-submission |
| **top-agent-skills.com** | Curated listing | Submission packet: [top-agent-skills-submission.md](top-agent-skills-submission.md) · email curator `aviv@alon.email` (site repo is private) |
| **VoltAgent awesome-agent-skills** | PR after usage matures (they reject brand-new) | https://github.com/VoltAgent/awesome-agent-skills |
| **awesome-claude-skills** | PR under Individual Skills | https://github.com/travisvn/awesome-claude-skills |
| **awesome-claude-code** | PR under Agent Skills | https://github.com/hesreallyhim/awesome-claude-code |
| **localskills.sh** | Account + `localskills publish` | https://docs.localskills.sh/getting-started/ |
| **AI Skillstore** | Security-reviewed marketplace | https://skillstore.io / https://github.com/aiskillstore/marketplace |
| **Product Hunt / Show HN / r/ClaudeAI** | Launch posts | Manual |

## Install / sync tools (no separate "publish" - they consume GitHub)

```bash
# Vercel skills CLI (skills.sh telemetry)
npx skills add alivirgo/Major-AI-Skills --skill blender -g -y

# SkillKit (44 agents)
npx skillkit install alivirgo/Major-AI-Skills

# Gemini CLI extension install
gemini extensions install https://github.com/alivirgo/Major-AI-Skills

# Our installer (any host)
npx major-ai-skills --cursor|--claude|--codex|--gemini|--antigravity --skills <ids>
```

## CDN mirrors of the npm package (automatic)

- https://cdn.jsdelivr.net/npm/major-ai-skills@2.1.0/
- https://unpkg.com/major-ai-skills@2.1.0/

## Repo checklist for discovery

- [x] Public repo + MIT + Release + Pages
- [x] Topics (20) including agent-skills / claude-code / cursor / gemini
- [x] `AGENTS.md`, `.claude-plugin/*`, `gemini-extension.json`
- [x] `llms.txt` / `llms-full.txt` for answer engines
- [ ] Push uncommitted marketplace + Gemini files so remotes see them
- [ ] Official Claude directory submission
- [ ] Awesome-list PRs once stars/installs exist

## Re-publish commands (maintainers)

```bash
# npmjs
npm publish --access public

# GitHub Packages (scoped mirror)
node tools/scripts/publish-github-packages.js

# Release tarball
npm pack
gh release upload vX.Y.Z major-ai-skills-X.Y.Z.tgz --clobber
```
