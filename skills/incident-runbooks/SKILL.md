---
name: incident-runbooks
description: "Operational skill for writing actionable oncall runbooks: symptoms, severity, diagnostics, mitigation steps, escalation, and post-incident links."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["runbooks", "oncall", "incidents", "sre", "operations", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Incident Runbooks AI Skill Guide

## Overview & Engine Architecture

An incident runbook is a short, actionable guide an oncall engineer follows under pressure. Good runbooks start from observable symptoms, list safe diagnostics, then mitigation and escalation - not essays. Agents write runbooks that link to dashboards and feature flags, avoid secret values, and keep steps numbered and reversible when possible.

```
Alert / user report
   -> Symptom match in runbook index
       -> Severity + impact
           -> Diagnose (read-only first)
               -> Mitigate / roll back
                   -> Escalate + handoff notes
                       -> Post-incident follow-ups
```

## When to use this skill

- Authoring oncall docs for services you own
- Converting tribal knowledge into page-ready steps
- Reviewing runbooks for actionability before a launch
- Linking alerts to the correct playbook URL

## Operational directives

1. Title with the symptom or alert name humans will search (`Checkout 5xx elevated`).
2. First section: impact, severity hints, and owners/escalation path.
3. Prefer read-only diagnostics before mutating production.
4. Every destructive or customer-facing step needs an explicit confirmation checkpoint.
5. Never embed passwords, tokens, or private URLs that bypass SSO without vault references.

## Runbook template

```markdown
# Runbook: <Alert or symptom>

## Severity cheat sheet
- SEV1: ...
- SEV2: ...

## Symptoms
- Dashboard: <link>  Panel: ...
- User-visible: ...

## Quick checks (read-only)
1. ...
2. ...

## Mitigation
1. ...
2. Rollback flag/command: ...
3. Verify recovery: ...

## Escalation
- Primary: @team-oncall
- Secondary: @platform
- External vendor: ...

## Do not
- ...

## Follow-ups
- Ticket template / postmortem link
```

## Quality bar

| Weak | Strong |
| --- | --- |
| "Check the logs" | Exact query, index, and time window |
| "Restart if needed" | When restart is safe; order of instances; blast radius |
| "Ask Bob" | Role rotation + paging policy |
| Secret paste in page | Link to vault path + access role |

## Best practices

- Store runbooks where oncall already looks (`@confluence`, Notion, or repo `docs/runbooks`).
- Link each alert rule to exactly one runbook URL.
- Dry-run runbooks in game days; fix stale commands within a week.
- Keep a one-page index of runbooks sorted by service and symptom.
- After incidents, update the runbook in the same PR/change as the fix when possible.

## Limitations

- Runbooks cannot replace decision-making for novel failure modes - escalate early.
- Cloud console UIs change; prefer stable CLI/API steps with UI as backup.
- Legal/comms (status pages, customer emails) need separate incident-commander playbooks.

## Related skills

- `@confluence` - publishing and permissioning runbook pages
- `@prometheus` - alert symptoms and dashboard links
- `@redis-streams` / `@terraform-aws` - domain-specific mitigation details to link out to
