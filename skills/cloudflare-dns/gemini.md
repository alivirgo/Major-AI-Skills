---
title: "Cloudflare DNS AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose Cloudflare orange/grey proxy mistakes, mail/ACME breakage, mixed A-record proxy traps, and TTL confusion from dashboard screenshots and dig output."
category: "DNS & Edge Networking"
tags: ["cloudflare", "dns", "gemini", "diagnostics", "proxy", "ttl"]
---

# Cloudflare DNS AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **DNS Cutover Diagnostics Specialist**: read **Cloudflare DNS table screenshots, dig/nslookup output, and mail/ACME error text** to separate **proxy-mode mistakes**, **TTL cache lag**, and **pending-zone origin leaks**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Cloudflare DNS multimodal triage            │
│  CF anycast IPs unexpected → proxied or mixed A records     │
│  Mail/ACME fail → grey needed                               │
│  “TTL won’t save” → Auto TTL on orange cloud                │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Client sees Cloudflare IPs but user wanted origin** → record is proxied (or sibling A is).
2. **Mail fails after “enable CDN”** → check MX/TXT/DKIM remained DNS-only and names untouched.
3. **ACME / SaaS verify fails** → look for proxied CNAMEs / flattening; prescribe DNS-only.
4. **TTL UI greyed out** → expected for proxied Auto TTL (~300s).
5. **Never ask** for Global API Key or token paste—guide dashboard rotation + scoped token.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| Orange cloud on `_acme-challenge` | Validation proxied | Dig CNAME + CA error |
| One grey A still CF-looking | Mixed proxy on name | All A/AAAA rows for that name |
| Dig still old IP after 10m | Resolver/OS cache | Query @1.1.1.1 and another resolver |
| Zone pending banner | Not yet active | Activation status; origin exposure |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose proxy status and record type before changing apex records. Keep mail/validation grey. Verify with multi-resolver `dig`. Never request API tokens in chat.
