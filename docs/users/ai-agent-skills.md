# AI Agent Skills Guide

**AI agent skills** (also called **agentic skills**, **Claude Code skills**, **Cursor skills**, or `SKILL.md` playbooks) are reusable instruction packages that teach coding agents how to perform a job with clearer constraints and outputs.

## What is a skill?

A skill is a folder with a required `SKILL.md` file:

```text
skills/my-skill/
  SKILL.md      # name + description frontmatter + instructions
  scripts/      # optional helpers
```

Agents discover skills by name/description, then load the full file when relevant. You can also invoke with `@skill-id` (Cursor) or slash commands (some CLIs).

## Breadth vs depth

| Library style | Good for | Example |
| --- | --- | --- |
| Giant coding catalog | Architecture, security, DevOps, brainstorming | agentic-awesome-skills |
| Curated awesome-list | Discovery before install | VoltAgent/awesome-agent-skills |
| Product-depth library | CAD, video, design, desktop apps + efficiency | **Major AI Skills** |
| Official vendor pack | Format reference, office docs | anthropics/skills |

## How to evaluate a skill library

1. **Installability** - Can you `npx` into Claude / Cursor / Codex / Gemini / Antigravity paths?
2. **Selective install** - Can you avoid loading everything into a watched folder?
3. **Catalog** - Is there a machine-readable index (`skills_index.json`) and human `CATALOG.md`?
4. **Trigger quality** - Do `description` fields say *when* to use the skill?
5. **Safety** - Are risky commands gated? Is there a security policy?

## When to use Major AI Skills

Use this repo when your agent needs expertise on **specific software products** or **token-efficient prompting**, for example:

- SolidWorks, Fusion 360, Blender, Unity, Unreal
- Premiere, After Effects, DaVinci, Remotion, FFmpeg
- Figma, Photoshop, Obsidian, Notion, Linear
- Raycast, PowerToys, Everything, Docker, Playwright
- Efficiency habits like CSV-over-JSON and short-answer-first

## Install once, reuse everywhere

```bash
npx major-ai-skills --cursor --skills figma,docker
npx major-ai-skills --claude --category efficiency
npx major-ai-skills --antigravity --skills blender --dry-run
```

## Next reads

- [Medium: What are AI agent skills? Claude Code, Cursor & SKILL.md](https://medium.com/@alithetechguy/what-are-ai-agent-skills-claude-code-cursor-skill-md-explained-plus-392-skill-library-to-instal-a4218fa6f0b5)
- [Best Claude Code skills on GitHub](best-claude-code-skills-github.md)
- [Best Cursor skills on GitHub](best-cursor-skills-github.md)
- [Claude Code skills](claude-code-skills.md)
- [Cursor skills](cursor-skills.md)
- [Antigravity skills](antigravity-skills.md)
