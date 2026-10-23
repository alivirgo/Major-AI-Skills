---
name: cloudflare-dns
description: "Manage Cloudflare DNS with correct proxy (orange/grey) mode, TTL cutovers, zone backups, and scoped API tokens—avoid mail/ACME breakage and mixed proxied-record traps."
category: network
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["cloudflare", "dns", "cdn", "records", "ttl", "proxy", "dnssec", "api-token"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Cloudflare DNS AI Skill Guide (Claude)

## Overview & Engine Architecture

Cloudflare DNS is **authoritative** for a zone. **Proxied** (orange cloud) A/AAAA/CNAME records send HTTP(S) through Cloudflare’s edge (anycast IPs to clients; origin hidden). **DNS-only** (grey cloud) returns origin addresses. Only **A / AAAA / CNAME** can be proxied; MX/TXT/etc. are always DNS-only. Proxied records use **Auto TTL (~300s, not editable)**. Agents inventory/export before edits, choose proxy mode by traffic type, lower TTL ahead of grey-record migrations, and use **zone-scoped API tokens**—never Global API keys in automation.

```
┌─────────────────────────────────────────────────────────────┐
│                 Cloudflare DNS resolution                     │
│                                                             │
│  Registrar NS → Cloudflare authoritative zone               │
│                                                             │
│  Record types                                               │
│  ├── A / AAAA / CNAME → Proxied (orange) → CF edge → origin │
│  ├── A / AAAA / CNAME → DNS-only (grey) → origin IP/name    │
│  └── MX / TXT / CAA / NS … → always DNS-only                │
│                                                             │
│  Ops controls                                               │
│  ├── TTL: editable when DNS-only; Auto when proxied         │
│  ├── API: Bearer token (Zone DNS Edit) — not Global Key     │
│  └── Mixed A/AAAA on same name: one proxied ⇒ all treated   │
│      as proxied                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Creating/updating A/AAAA/CNAME/MX/TXT/CAA records; planning cutovers and low-TTL rehearsals.
- Choosing proxied vs DNS-only for web, APIs, mail, or validation records.
- Automating DNS via Cloudflare API with least-privilege tokens.

**Do not use when**

- The task is full WAF / Workers / Tunnel app design beyond DNS → stop or use broader Cloudflare product skills/docs.
- Certificate issuance details dominate → `@lets-encrypt` (still coordinate DNS-01 / HTTP-01 with proxy mode).
- Someone asks to delete apex records without traffic owners, paste Global API keys into git, or invent account tokens → refuse.

---

## Operational Capabilities & Agent Directives

1. **Inventory + backup** zone records before changes (dashboard export or API list).
2. **Proxy web traffic** (A/AAAA/CNAME) by default; keep **mail, DKIM, many ACME/validation CNAMEs DNS-only**—proxying verification targets breaks proofs / CNAME flattening surprises.
3. **TTL**: lower DNS-only TTL before migrations; raise after soak. Do not expect to edit TTL on proxied records (Auto ~300s).
4. **Mixed proxy on same name**: if any A/AAAA is proxied, Cloudflare treats all on that name as proxied—do not assume grey siblings stay grey.
5. **Pending zones** may answer DNS-only until activation—origin IPs can leak during onboarding; plan origin IP rotation after activation when security-sensitive.
6. **API tokens**: Zone DNS Read/Edit for one zone; store `CLOUDFLARE_API_TOKEN` + `ZONE_ID` in secrets—never commit. Prefer Bearer tokens over Global API Key + email.
7. **Verify** with `dig` against 1.1.1.1 and another resolver; confirm CAA/MX unchanged after web edits.
8. **DNSSEC** migrations are advanced (multi-signer)—follow official migration tutorial; do not flip DS casually.
9. Never invent Zone IDs, account IDs, or API tokens; ask the operator.

---

## Production Example: inventory, create DNS-only API record, cutover

Common record set:

| Type | Name | Content | Proxy |
| :--- | :--- | :--- | :--- |
| A | `@` | origin IPv4 | Proxied (public web) |
| AAAA | `@` | origin IPv6 | Match A mode |
| CNAME | `www` | `@` or apex target | Proxied |
| TXT | `@` | SPF / verification | DNS-only |
| MX | `@` | mail provider | DNS-only |
| CNAME | `_acme-challenge` | CA validation target | DNS-only |

API (token from env—placeholder zone/IP only):

```bash
# List (backup-friendly)
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?per_page=100" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  | jq '.result[] | {id,type,name,content,proxied,ttl}'

# Create DNS-only A for cutover lab (documentation IP)
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"type":"A","name":"api","content":"203.0.113.10","ttl":120,"proxied":false}'
```

Cutover sequence:

```text
1) Export current records
2) Lower TTL on DNS-only records that will change (e.g. 120)
3) Add parallel target / validate dig + curl from multiple networks
4) Flip content or proxy mode during change window
5) Watch origin logs / synthetic checks
6) Raise TTL after soak; restore any temporary grey records carefully
```

Verification:

```bash
dig +short example.com @1.1.1.1
dig +short api.example.com A
dig MX example.com
dig CAA example.com
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Mail delivery breaks after “CDN enable” | Proxied records affecting mail-related names; MX/TXT edits | Keep MX/DKIM DNS-only; restore grey where required |
| ACME / domain verification fails | Proxied CNAME flattened / challenge not reaching expected party | DNS-only for validation records; match CA docs |
| “I set one A grey but still see CF IPs” | Sibling A/AAAA on same name is proxied | Align all records on that name; understand mix rule |
| TTL change ignored | Record is proxied (Auto TTL) | Expect ~300s Auto; use DNS-only if you must control TTL |
| Origin IP exposed during onboard | Zone still pending | Wait for active zone; consider rotating origin IPs |
| API `Unauthorized` / wrong zone | Token scope or wrong `ZONE_ID` | Recreate zone-scoped token; verify zone id |
| WebSockets / odd ports fail via orange | Proxy limitations / need Spectrum | Confirm plan features; Spectrum for non-HTTP |
| DNSSEC SERVFAIL after NS change | DS/DNSKEY mismatch | Follow multi-signer migration; do not half-apply |

---

## Best Practices

1. Enable DNSSEC when registrar + Cloudflare path is understood end-to-end.
2. If fully proxied, restrict origin firewall to Cloudflare IP ranges (and authenticated origin pulls).
3. Separate `staging.` / `canary.` subdomains with clear proxy policy.
4. Store Zone ID in team docs; tokens only in secret managers / CI.
5. Comment records (API `comment`) for human intent—why proxied vs grey.
6. Pair certificate work with `@lets-encrypt`; origin TLS with `@nginx-hardening` when grey or flexible SSL is in play.

---

## Limitations

- Full CDN/WAF/Workers/Tunnel configuration is broader than this skill—stay DNS-scoped unless the user expands.
- Resolver caches and local OS caches can outlive TTL.
- Enterprise secondary DNS / custom nameservers change ownership paths—verify before edits.
- Stop and ask if Zone ID, token scope, or traffic owners for apex records are missing.

---

## Related Skills

- `@lets-encrypt` — certificates when DNS-01 / HTTP-01 interacts with proxy mode
- `@nginx-hardening` — origin TLS when not fully terminated at Cloudflare
- `@wireguard` — private access when origin should not be public
- `@gcloud-cli` / `@azure-cli` — origin infrastructure behind the zone
- `@vercel` — often the origin/target behind CNAME records

---

## Agent Operational Directive

> **MANDATORY**: Backup the zone before edits. Keep MX and validation records DNS-only. Treat mixed proxied/unproxied A/AAAA on the same name as all proxied. Use zone-scoped API tokens from the environment—never Global API keys in git. Verify with `dig` from multiple resolvers before declaring a cutover done.

---

## Source anchors (research)

- [Proxy status](https://developers.cloudflare.com/dns/proxy-status/)
- [Proxying limitations](https://developers.cloudflare.com/dns/proxy-status/limitations/)
- [TTL reference](https://developers.cloudflare.com/dns/manage-dns-records/reference/ttl/)
- [DNS API](https://developers.cloudflare.com/api/resources/dns/)
- [DNSSEC active migration](https://developers.cloudflare.com/dns/dnssec/dnssec-active-migration/)
