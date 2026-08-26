# Antigravity Skills

Guide for **Antigravity skills** and the Antigravity CLI (`agy`) using Major AI Skills.

## Important: watched catalog risk

Antigravity watches `~/.agents/skills`. Installing hundreds of skills can exhaust context, slow startup, or crash. The installer **requires** `--skills`, `--category`, or explicit `--all`.

```bash
# Safe: exact IDs + dry-run
npx major-ai-skills --antigravity --skills blender,ffmpeg,docker --dry-run

# Antigravity CLI slash skills
npx major-ai-skills --agy --skills blender,ffmpeg
```

## Workspace vs global

| Target | Flag / path |
| --- | --- |
| Global Antigravity | `--antigravity` → `~/.agents/skills` |
| Antigravity CLI (agy) | `--agy` → `~/.gemini/antigravity-cli/skills` |
| Custom / workspace | `--path ./.agents/skills` |

## First use

```text
Use @blender to batch-export selected meshes as FBX.
Use @ffmpeg to compress this screen recording for Slack.
```

## Related pages

- [Getting started](getting-started.md)
- [AI agent skills guide](ai-agent-skills.md)
- [Plugins](plugins.md)
