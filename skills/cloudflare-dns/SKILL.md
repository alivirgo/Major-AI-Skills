---
name: cloudflare-dns
description: "Operational skill for agents to manage Cloudflare DNS - records, proxied vs DNS-only, TTL, API tokens, and safe cutover patterns."
category: network
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["cloudflare", "dns", "cdn", "records", "ttl", "network"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Cloudflare DNS AI Skill Guide

## Overview

Cloudflare DNS manages authoritative records for a zone and optionally **proxies** traffic (orange cloud) through Cloudflare's edge. DNS-only (grey cloud) returns origin IPs directly. Agents must distinguish proxy mode from pure DNS - proxied records change visible IPs, affect TLS termination, and hide origin addresses. Prefer scoped API tokens over Global API keys.

```
Registrar / NS -> Cloudflare authoritative DNS
                      |
                      +--> DNS-only A/AAAA/CNAME (grey)
                      +--> Proxied record (orange) -> Cloudflare edge -> origin
```

## When to use

- Creating or updating A/AAAA/CNAME/MX/TXT records
- Planning domain cutovers and low-TTL rehearsals
- Choosing proxied vs DNS-only for APIs, mail, or ACME challenges
- Automating record changes via Cloudflare API

## Operational directives

1. Inventory existing records before edits; export a backup of the zone.
2. Lower TTL ahead of migrations; raise TTL after stability.
3. Keep MX and many ACME/validation records DNS-only when required.
4. Use least-privilege API tokens limited to the single zone and DNS edit.
5. Never delete apex records casually - confirm traffic owners first.

## Concrete examples

### Common record set

| Type | Name | Content | Proxy |
| :--- | :--- | :--- | :--- |
| A | `@` | origin IPv4 | Proxied (web) or DNS-only (special cases) |
| AAAA | `@` | origin IPv6 | Match A mode |
| CNAME | `www` | `example.com` | Proxied |
| TXT | `@` | SPF/verification | DNS-only |
| MX | `@` | mail provider | DNS-only |

### API token create (dashboard mentally) then CLI with curl

```bash
# List DNS records
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" | jq '.result[] | {type,name,content,proxied,ttl}'

# Upsert-style create A record (DNS-only for origin cutover lab)
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"A","name":"api","content":"203.0.113.10","ttl":120,"proxied":false}'
```

### Cutover sequence

```text
1) Set TTL 120 on records to change
2) Add new record / parallel target
3) Verify dig + curl from multiple resolvers
4) Flip old record or proxy mode
5) Watch origin logs / synthetic checks
6) Raise TTL after soak
```

### dig verification

```bash
dig +short example.com @1.1.1.1
dig +short api.example.com A
dig CAA example.com
```

## Proxy mode pitfalls

| Situation | Guidance |
| :--- | :--- |
| Mail (MX) | DNS-only related records |
| Let's Encrypt HTTP-01 to origin | Understand whether challenge hits CF or origin |
| WebSockets / special ports | Confirm Cloudflare plan/features |
| Origin IP leak via grey records | Keep unused grey records off public docs |

## Best practices

1. Enable DNSSEC when the registrar chain supports it cleanly.
2. Restrict origin firewall to Cloudflare IP ranges if fully proxied.
3. Store Zone ID and account references in team docs - not API tokens in Git.
4. Use separate subdomains for staging with clear names (`staging.`, `canary.`).

## Limitations

- Full CDN/WAF/Workers configuration is broader than DNS - stay in DNS scope unless asked.
- Propagation depends on resolver caches despite low TTL.
- Some enterprise setups use secondary DNS / custom nameservers - verify ownership path.

## Related skills

- `lets-encrypt` - certificates when DNS-01 or HTTP-01 interacts with CF
- `nginx-hardening` - origin TLS when not fully terminated at CF
- `wireguard` - private access when origin should not be public
- `gcloud-cli` / `azure-cli` - origin infrastructure behind the zone
