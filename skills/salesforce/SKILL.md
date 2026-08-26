---
name: salesforce
description: "Operational skill for Salesforce: objects, SOQL/SOSL, Apex triggers, Flows, Lightning Web Components, and API integration hygiene."
category: enterprise
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["salesforce", "soql", "apex", "flows", "crm", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Salesforce CRM Platform AI Skill Guide

## Overview & Engine Architecture

Salesforce is a multi-tenant CRM platform built around standard and custom objects, declarative automation (Flows), and programmatic layers (Apex, LWC). Data is queried with SOQL/SOSL; external systems use REST/Bulk APIs with OAuth. Agents prefer declarative solutions first, keep governor limits in mind, and never hard-code org IDs or secrets in Apex.

```
UI (Lightning / LWC)
   -> Objects + Fields + Relationships
       -> Flows / Process automation
       -> Apex / Triggers (when needed)
External apps -> OAuth + REST / Bulk / Streaming APIs
```

## When to use this skill

- Modeling custom objects and relationships for CRM processes
- Writing safe SOQL and bulk-friendly Apex
- Designing Flows vs Apex trade-offs
- Integrating Salesforce with middleware or custom backends

## Operational directives

1. Prefer Flow for straightforward create/update/routing; use Apex for complex bulk logic or callouts.
2. Bulkify everything: no SOQL/DML inside loops.
3. Enforce FLS and sharing (`with sharing` where appropriate); never assume admin context in integrations.
4. Use Named Credentials for callouts; store secrets outside source.
5. Version metadata with SFDX/source format; avoid editing production directly.

## SOQL sketches

```sql
SELECT Id, Name, Account.Name
FROM Contact
WHERE Email = :email
LIMIT 1

SELECT Id, (SELECT Id, Subject FROM Cases__r)
FROM Account
WHERE Id = :accountId
```

## Apex trigger pattern

```apex
trigger ContactTrigger on Contact (before insert, before update) {
  ContactService.beforeSave(Trigger.new, Trigger.oldMap);
}
// Service class: one SOQL, one DML path, unit-tested with Test.startTest/stopTest
```

## Common pitfalls

| Pitfall | Result | Fix |
| --- | --- | --- |
| SOQL in for-loop | Governor limit exceptions | Collect IDs, query once, map results |
| Hard-coded record type IDs | Breaks across sandboxes | Query by DeveloperName |
| Unrestricted guest/API user | Data leaks | Least-privilege profiles + permission sets |
| Flow recursion | Infinite updates | Entry criteria + recursion guards |

## Best practices

- Name custom APIs with `__c` awareness; document External IDs for upserts.
- Use Bulk API 2.0 for large data jobs; respect daily limits.
- Cover Apex with tests that assert behavior, not just coverage percentage.
- Prefer Change Data Capture or Platform Events over polling for near-real-time sync.

## Limitations

- Edition, licenses, and feature gates (e.g. Flow types) vary by org.
- Managed packages and AppExchange apps add opaque automation.
- Multi-org middleware patterns need explicit identity and conflict rules.

## Related skills

- `@hubspot` - lighter CRM alternative for marketing/sales teams
- `@zapier` - no-code sync into Salesforce
- `@postman` - explore Salesforce REST collections
