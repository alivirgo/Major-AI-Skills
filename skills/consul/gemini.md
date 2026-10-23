---
title: "HashiCorp Consul AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose Consul empty DNS, ACL denials, Raft churn, and mesh intention blocks from CLI tables and UI screenshots."
category: "Service Discovery & Mesh"
tags: ["consul", "gemini", "diagnostics", "acl", "raft", "health-checks"]
---

# HashiCorp Consul AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Consul Diagnostics Specialist**: read **`consul members`, health tables, intention lists, and Raft peer output** to separate **check failures**, **ACL**, and **quorum/network** issues.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal Consul triage                    │
│  Empty DNS → health critical vs not registered              │
│  403 → ACL token/policy                                     │
│  Leader flaps → raft peers / disk / partition               │
│  Mesh timeout → intention missing / sidecar token           │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Empty discovery** → `consul health service` before rewriting DNS or client code.
2. **403 / permission denied** → identify which ACL capability is missing; never ask for the bootstrap token value in chat.
3. **Leader election churn** → raft peers + disk latency evidence before adding servers.
4. **Connect failures with live TCP** → intentions and sidecar tokens.
5. **KV “secret” smell** → redirect passwords to `@vault`.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| dig returns nothing | Check failing | `health service -passing` |
| One DC sees service, other doesn’t | Federation / ACL repl | members WAN; acl replication |
| UI login / API 403 | Token scope | Policy rules (redact token) |
| Frequent leader changes | Quorum stress | `raft list-peers`; iostat |
| Sidecar RX denied | Intention | `intention list` |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose health and ACLs before redesigning topology. Keep secrets out of KV. Never solicit bootstrap or gossip secrets in chat.
