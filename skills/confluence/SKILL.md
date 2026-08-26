---
name: confluence
description: "Operational skill for Confluence: spaces, page trees, macros, labels, permissions, and REST content updates."
category: knowledge
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["confluence", "wiki", "documentation", "spaces", "atlassian", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Confluence Knowledge Base AI Skill Guide

## Overview & Engine Architecture

Confluence is a hierarchical wiki: spaces contain page trees with versioned content, labels, and attachments. Macros embed Jira issues, code, and status. Permissions apply at space and sometimes page level. Agents structure docs for findability, keep runbooks actionable, and avoid dumping secrets into pages.

```
Site
   -> Spaces (team / product / public)
       -> Page tree + versions
       -> Labels / attachments / macros
       -> Restrictions + space permissions
```

## When to use this skill

- Designing space IA and page hierarchies
- Writing ADRs, runbooks, and onboarding docs
- Bulk-updating or migrating page content via API
- Cleaning stale docs and label taxonomies

## Operational directives

1. One topic per page; use child pages for depth, not endless scroll.
2. Put owner + review date near the top of living docs.
3. Prefer labels over inventing parallel page trees for the same taxonomy.
4. Never paste credentials, private keys, or production connection strings.
5. Link to Jira/Linear issues by key; do not duplicate ticket status prose that goes stale.

## Page structure template

```markdown
# <Title>
**Owner:** @team  **Review by:** YYYY-MM-DD  **Status:** current|draft|deprecated

## Purpose
One paragraph.

## Steps / Content
Numbered, actionable.

## Related
Links to tickets, dashboards, repos.
```

## REST sketch (Cloud)

```bash
# Get page by ID (API version/path can vary - verify for your site)
curl -s -u email:token \
  -H "Accept: application/json" \
  "$CONFLUENCE_BASE/wiki/rest/api/content/123456?expand=body.storage,version"
```

## Information architecture smells

| Smell | Better approach |
| --- | --- |
| Personal sandbox as team source of truth | Move to owned team space with permissions |
| Duplicate "How we deploy" pages | Canonical page + redirects/links from old ones |
| Untitled meeting notes floods | Dated titles + archive parent after 90 days |
| Everyone can edit prod runbooks | Restrict edit; broad view |

## Best practices

- Use templates for runbooks, ADRs, and postmortems so sections stay consistent.
- Archive deprecated pages rather than deleting history users still link to.
- Keep macros light; heavy macro nests slow pages and break exports.
- For API writes, bump `version.number` and send a clear version message.

## Limitations

- Confluence Cloud vs Data Center APIs and macros differ.
- Storage format (storage XHTML vs ADF in some APIs) complicates programmatic edits.
- Marketplace macros may not render in exports or offline mirrors.

## Related skills

- `@jira` - issues linked from Confluence pages
- `@incident-runbooks` - actionable oncall page structure
- `@notion` - alternative knowledge workspace
