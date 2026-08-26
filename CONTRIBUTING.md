# Contributing Guide

Thank you for contributing to **Major AI Skills**.

## Quick Start

```bash
git clone https://github.com/YOUR-USERNAME/Major-AI-Skills.git
cd Major-AI-Skills
npm install   # optional; Node 18+ only needed for validate/index/install

mkdir -p skills/my-awesome-skill
cp docs/contributors/skill-template.md skills/my-awesome-skill/SKILL.md
# edit the skill, then:
npm run validate
npm run index
```

Open a PR with **Allow edits from maintainers** enabled.

Community PRs should stay **source-only**: do not commit generated registry noise unless maintainers ask. Prefer letting `npm run index` regenerate `CATALOG.md` / `skills_index.json` on `main`.

## What Makes a Good Skill

- Solves one clear product or workflow problem
- Reusable across projects
- Clear trigger description in frontmatter
- Includes at least one concrete example
- Keeps model-specific variants optional (`gpt.md`, `gemini.md`)

## Layout

```text
skills/<skill-id>/
  SKILL.md      # required (canonical agent entry)
  gpt.md        # optional OpenAI/Codex-oriented variant
  gemini.md     # optional Gemini-oriented variant
```

Folder name must match frontmatter `name:`.

## Commit Messages

- `feat:` new skill or major packaging feature
- `docs:` documentation
- `fix:` corrections
- `chore:` maintenance

## Need Help?

Use GitHub Discussions for ideas and Issues for reproducible bugs.
