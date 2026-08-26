# Top Agent Skills listing submission

Prepared for [publish-a-skill-and-get-listed](https://top-agent-skills.com/guides/publish-a-skill-and-get-listed).

**Curator contact:** aviv@alon.email (from https://aviv-israel.dev)  
**Site repo:** `aviv-israel/top-agent-skills` (private - issues/PRs not open to public)  
**Provenance tier requested:** `community`

---

## Checklist (guide requirements)

| Requirement | Status |
| --- | --- |
| Stable `skills/<name>/SKILL.md` paths | Yes - https://github.com/alivirgo/Major-AI-Skills/tree/master/skills |
| Real `LICENSE` file (MIT) | Yes - https://github.com/alivirgo/Major-AI-Skills/blob/master/LICENSE |
| Trigger-oriented descriptions | Yes - frontmatter `description` names artefacts / situations |
| One-command install per agent | Yes - see below |
| Honest limits (`notIdealFor`) | Yes - see entries |
| Agents actually tested from this workspace | Cursor (verified); Claude Code / Codex / Gemini CLI install commands verified via CLI / installer flags (host UI not all run here) |

---

## Primary listing: library / bundle

**Proposed slug:** `major-ai-skills`

**Repo:** https://github.com/alivirgo/Major-AI-Skills  
**Homepage:** https://alivirgo.github.io/Major-AI-Skills/  
**npm:** https://www.npmjs.com/package/major-ai-skills  
**Licence:** MIT

**Tagline:** Product-depth agent skills (CAD, video, 3D, design) plus token-efficiency and common-sense prompting - installable with one `npx` command.

**Description:** Installable library of 392+ `SKILL.md` skills for Claude Code, Cursor, Codex CLI, Gemini CLI, and Antigravity. Focused on professional apps (SolidWorks, Blender, Figma, DaVinci, Docker, etc.), token-efficiency protocols, and plain-English prompting habits - not a generic coding mega-pack.

**bestFor:** Teams that need product-app and efficiency skills beside a coding catalog (e.g. beside agentic-awesome-skills / superpowers).

**notIdealFor:** Lean setups that only need one coding workflow skill; do not install the full library into Antigravity without `--skills` / `--category` filters (context bloat).

### Install commands (tested paths)

```bash
# Cursor
npx major-ai-skills --cursor --skills blender,figma,csv-over-json-tables
# or
npx skills add alivirgo/Major-AI-Skills --skill blender -g -a cursor -y

# Claude Code
npx major-ai-skills --claude --skills solidworks,blender
npx skills add alivirgo/Major-AI-Skills --skill solidworks -g -a claude-code -y

# Codex CLI
npx major-ai-skills --codex --skills docker,playwright

# Gemini CLI
npx major-ai-skills --gemini --skills figma,blender
gemini extensions install https://github.com/alivirgo/Major-AI-Skills

# Antigravity (selective only)
npx major-ai-skills --antigravity --skills raycast,ffmpeg,blender --dry-run
npx major-ai-skills --antigravity --skills raycast,ffmpeg,blender
```

**Credentials:** None required for skill text. Product APIs inside specific skills (SolidWorks COM, etc.) need the host app installed on the user's machine.

---

## Optional individual entries (category depth)

### 1. `blender`

- **Path:** https://github.com/alivirgo/Major-AI-Skills/blob/master/skills/blender/SKILL.md
- **Raw:** https://raw.githubusercontent.com/alivirgo/Major-AI-Skills/master/skills/blender/SKILL.md
- **Install:** `npx skills add alivirgo/Major-AI-Skills --skill blender -g -y`
- **Alt:** `npx major-ai-skills --cursor --skills blender`
- **bestFor:** Headless `bpy` batch jobs, Geometry Nodes, EEVEE/Cycles render pipelines.
- **notIdealFor:** Pure game-engine work (use Unity / Unreal skills instead).

### 2. `solidworks`

- **Path:** https://github.com/alivirgo/Major-AI-Skills/blob/master/skills/solidworks/SKILL.md
- **Install:** `npx major-ai-skills --cursor --skills solidworks`
- **bestFor:** SOLIDWORKS COM/VBA automation, FeatureManager diagnosis, assembly mates.
- **notIdealFor:** Non-Windows environments (SOLIDWORKS API is Windows/COM).

### 3. `csv-over-json-tables`

- **Path:** https://github.com/alivirgo/Major-AI-Skills/blob/master/skills/csv-over-json-tables/SKILL.md
- **Install:** `npx skills add alivirgo/Major-AI-Skills --skill csv-over-json-tables -g -y`
- **bestFor:** Cutting token cost when agents pass large tabular data.
- **notIdealFor:** Nested / irregular JSON documents that are not row-column tables.

---

## Email body (copy-paste)

Subject: Listing request: Major AI Skills (community bundle + product skills)

```
Hi Aviv,

Requesting a Top Agent Skills listing per https://top-agent-skills.com/guides/publish-a-skill-and-get-listed

Repo: https://github.com/alivirgo/Major-AI-Skills
Licence file: https://github.com/alivirgo/Major-AI-Skills/blob/master/LICENSE (MIT)
Publisher: Ali Virgo / alivirgo (community)

Primary entry (bundle): major-ai-skills
- 392+ SKILL.md skills: professional apps + token efficiency + common-sense prompting
- Install (Cursor): npx major-ai-skills --cursor --skills blender,figma
- Install (skills.sh): npx skills add alivirgo/Major-AI-Skills --skill blender -g -y
- npm: https://www.npmjs.com/package/major-ai-skills
- Site: https://alivirgo.github.io/Major-AI-Skills/

bestFor: Product-app and efficiency skills beside a coding catalog
notIdealFor: Full-library dump into Antigravity without --skills filters

Optional individual paths:
- skills/blender/SKILL.md
- skills/solidworks/SKILL.md
- skills/csv-over-json-tables/SKILL.md

Agents with install commands verified: Cursor, Claude Code flags, Codex flags, Gemini flags, Antigravity selective install.
Not claiming Claude.ai web upload testing from this submission.

Happy to adjust fields to your skill.v1 schema.

Thanks,
Ali
```

---

## After listing

Add the ranking badge from the skill page to README (guide: every listed Skill page includes an embeddable badge).
