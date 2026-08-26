# Skills Library

Flat, installable agent skills. Each skill is:

```text
skills/<skill-id>/
  SKILL.md     # canonical entry (required)
  gpt.md       # optional OpenAI/Codex-oriented variant
  gemini.md    # optional Gemini-oriented variant
```

Browse the full registry in [CATALOG.md](../CATALOG.md) or [skills_index.json](../skills_index.json).

Install examples:

```bash
npx major-ai-skills --cursor --skills raycast,blender,figma
npx major-ai-skills --claude --category efficiency
npx major-ai-skills --list
```
