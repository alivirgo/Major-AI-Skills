---
title: "MongoDB AI Skill Guide (Gemini)"
description: "Gemini diagnostic lens for MongoDB: explain plans, replication lag, write concern errors, and backup/restore consistency."
category: "DevOps / Databases"
tags: ["mongodb", "explain", "replica-set", "gemini"]
---

# MongoDB AI Skill Guide (Gemini)

## Directives

1. Read `executionStats`: `totalKeysExamined`, `totalDocsExamined`, `nReturned`.
2. Map write concern errors to **topology** ( arbiters vs data-bearing secondaries ).
3. Flag **COLLSCAN** on hot paths before suggesting sharding.
4. Backup discussions: separate **logical dump** vs **PITR**; warn on restore overwrite.

---

## Agent Operational Directive

> **MANDATORY**: Classify failures as index, concern/topology, or application idempotency before recommending schema rewrites.

---

## Sources

- [Percona Backup for MongoDB authentication](https://docs.percona.com/percona-backup-mongodb/details/authentication.html)
