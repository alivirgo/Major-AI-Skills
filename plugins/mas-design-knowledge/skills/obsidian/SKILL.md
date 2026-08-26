---
name: obsidian
description: "Operational skill for Claude to automate Obsidian vaults via URI schemes, Templater/Dataview patterns, Markdown structure, and local plugin workflows."
category: knowledge
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["obsidian", "dataview", "templater", "markdown", "uri-scheme", "pkm", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Obsidian Knowledge Vault AI Skill Guide (Claude)

## Overview & Engine Architecture
Obsidian is a local-first Markdown knowledge base where a **vault** is a folder of `.md` files plus `.obsidian` config. Power features come from community plugins such as **Dataview** (query notes as a database), **Templater** (scripted templates), and core **URI schemes** (`obsidian://`). Claude operates as a Principal PKM Systems Architect, specializing in **frontmatter schemas**, **Dataview queries**, **Templater JS templates**, and **safe vault-wide refactors**.

### Obsidian Vault & Plugin Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Obsidian Architecture                       │
│                                                             │
│  Vault Filesystem                                           │
│  ├── Notes (.md) + YAML frontmatter                         │
│  ├── Attachments / canvas / bases (version-dependent)       │
│  └── .obsidian (workspace, plugins, snippets)               │
│                                                             │
│  Query & Automation                                         │
│  ├── Dataview / DataviewJS                                  │
│  ├── Templater (tp.*)                                       │
│  └── obsidian:// URI + Advanced URI plugin                  │
│                                                             │
│  Graph & Navigation                                         │
│  ├── Wikilinks [[Note]] / embeds ![[Note]]                  │
│  ├── Tags / Folders / Properties                            │
│  └── Graph view / local graph                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Frontmatter Schemas**: Standardize properties (`type`, `status`, `project`, `due`) for Dataview reliability.
2. **Non-Destructive Edits**: Prefer append/refactor with backups; never mass-delete without explicit confirmation.
3. **URI Deep Links**: Open notes, create files, and search via `obsidian://` (and Advanced URI when installed).
4. **Dataview Performance**: Limit table scans with `FROM "Folder"` and filters; avoid vault-wide JS on huge vaults.
5. **Plugin Awareness**: Detect whether Dataview/Templater are installed before recommending their syntax.

---

## Production Examples: Dataview + Templater + URI

Dataview task digest (in a note):

```dataview
TABLE file.link AS Note, status, due
FROM "Projects"
WHERE type = "task" AND status != "done"
SORT due ASC
LIMIT 30
```

Templater daily note stub (`Templates/Daily.md`):

```javascript
<%*
const stamp = tp.date.now("YYYY-MM-DD");
const title = `Daily ${stamp}`;
await tp.file.rename(title);
-%>
---
type: daily
date: <% stamp %>
tags: [daily]
---

## Focus
- 

## Log
- 

## Links
- [[Projects]]
```

Open/create via URI:

```text
obsidian://open?vault=MyVault&file=Projects%2FRoadmap
obsidian://new?vault=MyVault&name=Inbox%2FQuick%20Capture&content=Captured%20from%20agent
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Dataview empty results** | Property mismatch / wrong folder. | Inspect YAML keys; quote folder paths; check `type` values. |
| **URI opens wrong vault** | Vault name mismatch / encoding. | Use exact vault name; URL-encode file paths. |
| **Templater not executing** | File not run via Templater / plugin off. | Enable plugin; use Templater insert, not raw paste without trigger. |
| **Broken wikilinks after move** | Manual FS move without updater. | Use Obsidian rename; enable updated link settings. |

---

## Best Practices

1. Keep attachments in a dedicated folder; use relative links.
2. Prefer Properties UI-compatible YAML types (lists, dates).
3. Treat `.obsidian` as machine-local unless intentionally syncing community plugins.

### Essential Paths
- **Vault root**: user-chosen folder
- **Config**: `.obsidian/`
- **Templates**: commonly `Templates/`

---

## Agent Operational Directive
> **MANDATORY**: Preserve existing frontmatter keys when editing notes. Prefer Dataview filters scoped to folders. Use URI schemes for open/create; do not invent plugin commands that are not installed.
