# Claude Code Skills

Guide to installing and using **Claude Code skills** from Major AI Skills.

## What you get

Reusable `SKILL.md` playbooks that Claude Code can load from `~/.claude/skills/<id>/SKILL.md` (or a project `.claude/skills/` path). Skills cover:

- Professional applications (CAD, video, 3D, design, desktop, devops)
- Token / context **efficiency** skills
- Everyday **common-sense** prompting skills

## Install for Claude Code

```bash
# Preview first (recommended)
npx major-ai-skills --claude --skills solidworks,ffmpeg,ask-short-answer-first --dry-run

# Install exact IDs
npx major-ai-skills --claude --skills solidworks,ffmpeg,ask-short-answer-first

# Or install a category pack
npx major-ai-skills --claude --category cad,efficiency
```

## First prompts

```text
Use @solidworks to outline a VBA macro for batch drawing exports.
Use @csv-over-json-tables before pasting this large table.
```

## Avoid context overload

Do not install the full catalog into a watched skills directory unless you mean to. Prefer `--skills`, `--category`, or a [specialized plugin](plugins.md).

## Related pages

- [Best Claude Code skills on GitHub](best-claude-code-skills-github.md)
- [AI agent skills guide](ai-agent-skills.md)
- [Getting started](getting-started.md)
