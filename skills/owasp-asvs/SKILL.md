---
name: owasp-asvs
description: "Operational skill for OWASP ASVS: selecting levels, mapping requirements to controls, evidence for reviews, and gap triage."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["owasp", "asvs", "security", "requirements", "verification", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# OWASP ASVS Application Security AI Skill Guide

## Overview & Engine Architecture

OWASP Application Security Verification Standard (ASVS) is a catalog of security requirements grouped by chapters (authn, session, access control, validation, crypto, API, etc.) across levels (typically L1-L3). Teams pick a target level, map each requirement to an implemented control or exception, and collect verification evidence. Agents translate ASVS items into concrete engineering tasks - not vague "be secure" advice.

```
Threat / compliance context
   -> Choose ASVS level (L1 baseline ... L3 high assurance)
       -> Chapter requirements
           -> Control implementation + tests
               -> Evidence / exceptions register
```

## When to use this skill

- Setting an application security baseline for a product
- Preparing security review or customer questionnaire evidence
- Turning audit gaps into backlog tickets
- Aligning API and auth designs with standard requirements

## Operational directives

1. Pick a level explicitly (often L1 for standard web apps; higher for sensitive data).
2. Map each applicable requirement to: implemented, partial, N/A (with rationale), or gap.
3. Prefer verifiable controls (tests, config-as-code, scanner gates) over slideware.
4. Do not mark "N/A" for access control or injection chapters without written justification.
5. Revisit ASVS version when upgrading major releases of the standard.

## Requirement-to-ticket sketch

```text
ASVS 4.x V4.2.1 (example numbering may differ by version)
Goal: Enforce authorization on every object reference
Evidence: integration tests for IDOR; centralized policy middleware
Ticket: "Add object-level authz checks on /api/orders/{id}"
```

## Common chapter focus areas

| Chapter theme | Agent emphasis |
| --- | --- |
| Authentication | MFA options, credential storage, brute-force resistance |
| Session | Cookie flags, rotation, logout invalidation |
| Access control | Deny-by-default, object-level checks, least privilege |
| Validation | Server-side validation, encoding, file upload limits |
| API | Authn on all routes, rate limits, mass-assignment guards |

## Best practices

- Keep a living ASVS workbook (spreadsheet or SecOps tool) linked to PR evidence.
- Combine ASVS mapping with automated findings (`@semgrep`, `@codeql`, `@snyk`) - standards and scanners complement each other.
- Treat exceptions as time-boxed risk acceptances with owners.
- Write acceptance criteria that quote the ASVS intent in engineer-readable language.

## Limitations

- ASVS is requirements-oriented; it does not replace threat modeling or pen tests.
- Exact section numbers change between ASVS versions - always cite the version used.
- Regulatory frameworks (PCI, HIPAA) may demand controls beyond the chosen ASVS level.

## Related skills

- `@semgrep` - static rules mapped to coding flaws
- `@codeql` - deep semantic vulnerability queries
- `@snyk` - dependency and container issue triage
- `@incident-runbooks` - response when controls fail in production
