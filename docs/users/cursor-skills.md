# Cursor Skills

Guide to installing and using **Cursor skills** (`SKILL.md`) from Major AI Skills.

## Install path

The installer targets Cursor’s global skills folder:

```bash
npx major-ai-skills --cursor --skills figma,blender,docker --dry-run
npx major-ai-skills --cursor --skills figma,blender,docker
```

Default destination: `~/.cursor/skills/<skill-id>/SKILL.md`.

For a project-local install:

```bash
npx major-ai-skills --path ./.cursor/skills --skills figma,vscode
```

## Invoke in Cursor

- Type `@` and pick a skill, or
- Ask naturally and let the agent match the skill `description` frontmatter

Examples:

```text
@raycast scaffold a Script Command that opens Finder in VS Code
@playwright write a smoke test for the login page
@obsidian propose a vault folder structure for this project
```

## Starter packs for Cursor

| Job | Skill IDs |
| --- | --- |
| Design → code | `figma`, `vscode`, `playwright` |
| 3D / games | `blender`, `unity`, `unreal-engine` |
| Desktop power user | `raycast`, `everything`, `microsoft-powertoys` |
| Lean context | `csv-over-json-tables`, `token-aware-chunking`, `ask-short-answer-first` |

## Related pages

- [Best Cursor skills on GitHub](best-cursor-skills-github.md)
- [Plugins](plugins.md)
- [Bundles](bundles.md)
