---
name: lets-encrypt
description: "Issue and renew Let's Encrypt DV certs with certbot/acme.sh; choose HTTP-01 vs DNS-01; use staging to avoid rate limits; wire reload hooks and monitor expiry."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["lets-encrypt", "acme", "tls", "certbot", "dns-01", "http-01", "rate-limits"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Let's Encrypt ACME Certificates AI Skill Guide (Claude)

## Overview & Engine Architecture

Let's Encrypt issues **Domain Validation (DV)** certificates over the **ACME** protocol. A client (certbot, acme.sh, Caddy, etc.) creates an account key, requests an order, proves control of each identifier via a **challenge**, then downloads the cert. Agents must pick the right challenge, test on **staging**, automate renewal (not `--force-renewal` on a cron), reload TLS terminators only after success, and never commit private keys.

```
┌─────────────────────────────────────────────────────────────┐
│                 ACME issuance loop                          │
│                                                             │
│  Client (certbot / acme.sh)                                 │
│  ├── Account key + order (identifiers)                      │
│  ├── Challenge                                              │
│  │   ├── HTTP-01: GET :80 /.well-known/acme-challenge/…     │
│  │   └── DNS-01: TXT _acme-challenge.<name>                 │
│  └── Cert + privkey → install → reload nginx/caddy/LB       │
│                                                             │
│  Ops                                                        │
│  ├── Staging directory while debugging                      │
│  ├── Timer/cron: renew (~2×/day); ARI when supported        │
│  └── Monitor notAfter; backoff on failures                  │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Public hostnames need free automated TLS.
- Wildcards or blocked port 80 → DNS-01 with a DNS API.
- Recovering failed renewals before expiry.

**Do not use when**

- Names are internal-only and not publicly resolvable → private PKI (`@vault`) or org CA.
- You need OV/EV organization identity (LE is DV only).
- Someone asks to paste DNS API tokens or private keys into Git/chat → refuse; use env/secret mounts (`@vault`).

---

## Operational Capabilities & Agent Directives

1. **Staging first**: point clients at LE staging until HTTP/DNS path + reload succeed; then switch to production.
2. **Challenge selection**: HTTP-01 needs inbound **:80** reachable by LE (multi-vantage); DNS-01 for wildcards / no :80; clean up stale TXT records.
3. **Never use interactive `--manual` for production renewals**—prefer DNS plugins or HTTP webroot/nginx plugins.
4. **Renewal cadence**: run `certbot renew` ~twice daily; renew when ~⅓ lifetime remains (~30d for 90d certs); prefer **ARI** when the client supports it (rate-limit exempt).
5. **Hooks**: `--deploy-hook` / `renewal-hooks/deploy` must `nginx -t && reload` (or equivalent) only after success.
6. **Rate-limit hygiene**: do not loop failed production issuances; 5 failed authorizations/identifier/hour can block; exact-set duplicate issuances are tightly limited.
7. **Permissions**: private keys `600`; directories owned by root or dedicated TLS user.

---

## Production Example: certbot webroot + renew hook

```bash
# Issue (production only after staging dry-run path works)
sudo certbot certonly --webroot -w /var/www/html \
  -d api.example.com \
  --email ops@example.com --agree-tos --no-eff-email

# nginx ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh >/dev/null <<'EOF'
#!/bin/sh
nginx -t && systemctl reload nginx
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

sudo certbot renew --dry-run
sudo systemctl enable --now certbot.timer   # distro unit name may vary
```

DNS-01 wildcard sketch (API token from environment—never hardcode):

```bash
export CF_Token="${CLOUDFLARE_API_TOKEN:?set scoped DNS edit token}"
# acme.sh example; prefer scoped zone token
acme.sh --issue --dns dns_cf -d example.com -d '*.example.com' \
  --server letsencrypt
acme.sh --install-cert -d example.com \
  --fullchain-file /etc/ssl/certs/example.fullchain.pem \
  --key-file /etc/ssl/private/example.key \
  --reloadcmd "nginx -t && systemctl reload nginx"
```

Expiry check:

```bash
echo | openssl s_client -connect api.example.com:443 -servername api.example.com 2>/dev/null \
  | openssl x509 -noout -dates -subject
```

### Challenge selection

| Situation | Challenge |
| :--- | :--- |
| Public origin serves :80 | HTTP-01 |
| Wildcard `*.example.com` | DNS-01 |
| CDN proxies / blocks :80 to origin | DNS-01 or CDN-managed certs |
| Many frontends | Central validation server or DNS-01 |
| Internal hostname only | Not LE → `@vault` PKI |

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| HTTP-01 timeout / connection refused | :80 closed, wrong vhost, CDN not forwarding challenge | Open :80; ensure `/.well-known/acme-challenge/` bypasses auth/HTTPS-only traps; test from external network |
| HTTP-01 redirect loops / wrong host | Multi-server; challenge not on all nodes | Redirect challenges to one validation host or use DNS-01 |
| DNS-01 unauthorized / NXDOMAIN | Wrong TXT name/value; slow propagation; leftover TXT | Set `_acme-challenge`; wait/propagate; delete old TXT (size limits) |
| `too many certificates already issued` / exact set limit | Reinstall loops; deleting ACME state and re-issuing | Use staging; wait for refill; change identifier set only if needed; prefer renew over new-order |
| Auth failures / hour | Repeated bad validation | Fix challenge on **staging**, then retry prod with backoff |
| Renew succeeds, browsers still show old cert | Reload hook missing / wrong path | Deploy hook reload; verify live paths vs nginx `ssl_certificate` |
| Wildcard issued, apex missing | Only `*.example.com` requested | Include both `example.com` and `*.example.com` when needed |

---

## Best Practices

1. Monitor `notAfter` (synthetic HTTPS check or cert exporter); alert at 21/14/7 days.
2. Keep ACME account email current for expiry mail.
3. Scope DNS API credentials to one zone; prefer dedicated validation host over putting DNS tokens on every web node ([LE challenge docs](https://letsencrypt.org/docs/challenge-types/)).
4. Randomize cron seconds; stagger large fleets ([integration guide](https://letsencrypt.org/docs/integration-guide/)).
5. Document which layer owns TLS (edge CDN vs origin).

---

## Limitations

- DV only—no organization identity.
- Public validation required; air-gapped names need other PKI.
- Rate limits refill over time; overrides are for large integrators, not emergency resets.
- IP certificates and some TLD edge cases have constraints—verify before promising LE.
- Stop and ask for DNS provider, whether :80 is reachable, and who reloads the terminator.

---

## Related Skills

- `@nginx` / `@nginx-hardening` — install fullchain/privkey and secure TLS config
- `@cloudflare-dns` — DNS-01 automation and proxied :80 pitfalls
- `@vault` — private PKI / secret storage for API tokens
- `@docker` — sidecars only with shared volume + careful renewal locking
- `@github-actions` — scheduled renew dry-runs and expiry monitors in CI

---

## Agent Operational Directive

> **MANDATORY**: Use staging while debugging challenges. Prefer automated HTTP-01 or DNS API plugins over manual mode for renewals. Never commit private keys or DNS tokens. Wire deploy/reload hooks and prove `certbot renew --dry-run` (or equivalent). Respect rate limits—fix validation before hammering production ACME.

---

## Source anchors (research)

- [Challenge types](https://letsencrypt.org/docs/challenge-types/)
- [Rate limits](https://letsencrypt.org/docs/rate-limits/)
- [Integration guide (renewal, retries)](https://letsencrypt.org/docs/integration-guide/)
- [Certbot user guide](https://eff-certbot.readthedocs.io/en/stable/using.html)
