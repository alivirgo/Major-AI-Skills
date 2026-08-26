---
name: lets-encrypt
description: "Operational skill for agents to issue and renew TLS certificates with Let's Encrypt - certbot/acme.sh, HTTP-01/DNS-01, renewal timers, and failure recovery."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["lets-encrypt", "acme", "tls", "certbot", "certificates", "https"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Let's Encrypt ACME Certificates AI Skill Guide

## Overview

Let's Encrypt issues free DV certificates via the ACME protocol. Clients like **certbot** or **acme.sh** prove domain control with **HTTP-01** or **DNS-01**, then install certificates for NGINX/Caddy/load balancers. Agents should automate renewal (timers/cron), monitor expiry, and prefer DNS-01 for wildcards or when port 80 is unavailable.

```
ACME client (certbot/acme.sh)
        |
        +--> HTTP-01: http://domain/.well-known/acme-challenge
        +--> DNS-01: TXT _acme-challenge.domain
        v
Certificate + private key -> web server / LB reload
```

## When to use

- Issuing first certificates for a public hostname
- Setting up renewals and post-renew reload hooks
- Choosing HTTP-01 vs DNS-01 (wildcard, CDN, closed :80)
- Recovering from failed renewals nearing expiry

## Operational directives

1. Never commit private keys; restrict filesystem permissions (`600`).
2. Prefer staging ACME endpoint while testing to avoid rate limits.
3. Ensure renewals are unattended (`certbot renew` timer or equivalent).
4. Reload/restart the TLS terminator only after successful renew.
5. Document the challenge path owners (CDN vs origin vs DNS API).

## Concrete examples

### Certbot NGINX plugin (HTTP-01)

```bash
certbot --nginx -d api.example.com --redirect --email ops@example.com --agree-tos
certbot renew --dry-run
```

### Webroot mode

```bash
certbot certonly --webroot -w /var/www/html -d api.example.com
# Deploy fullchain.pem + privkey.pem into NGINX ssl_* paths
nginx -t && nginx -s reload
```

### DNS-01 wildcard with manual TXT (lab only)

```bash
certbot certonly --manual --preferred-challenges dns -d '*.example.com' -d example.com
# Publish TXT _acme-challenge.example.com as instructed, then continue
```

### acme.sh DNS API sketch

```bash
export CF_Token="***"   # from secret manager, not shell history if possible
acme.sh --issue --dns dns_cf -d example.com -d '*.example.com'
acme.sh --install-cert -d example.com \
  --fullchain-file /etc/ssl/certs/example.fullchain.pem \
  --key-file /etc/ssl/private/example.key \
  --reloadcmd "nginx -t && nginx -s reload"
```

### Expiry check

```bash
echo | openssl s_client -connect api.example.com:443 -servername api.example.com 2>/dev/null \
  | openssl x509 -noout -dates -subject
```

## Challenge selection table

| Situation | Challenge |
| :--- | :--- |
| Public :80 to origin | HTTP-01 |
| Wildcard cert | DNS-01 |
| Cloudflare proxied / blocked :80 | DNS-01 or CF-managed certs |
| Internal only hostname | Public LE may be impossible - use private PKI |

## Best practices

1. Monitor certificate notAfter (synthetic check or Prometheus exporter).
2. Use staging until the full reload path is proven, then switch to production ACME.
3. Keep account email current for expiry notices.
4. Rate-limit awareness: many failed issuances can block a domain temporarily.

## Limitations

- DV certs do not prove organization identity (not EV/OV).
- IP address certificates and some exotic TLDs have constraints.
- Offline / air-gapped hosts need alternative PKI (see Vault PKI).

## Related skills

- `nginx-hardening` - install and serve certificates securely
- `cloudflare-dns` - DNS-01 automation and proxied pitfalls
- `vault` - internal PKI alternative
- `docker` - containerized certbot sidecars when used carefully
