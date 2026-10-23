---
name: tailscale
description: "Join devices to a Tailscale mesh, advertise subnet/exit routes with IP forwarding and admin approval, tune MagicDNS, and diagnose DERP-relayed vs direct WireGuard paths."
category: cross-platform
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["tailscale", "wireguard", "mesh-vpn", "derp-relay", "magicdns", "subnet-router", "acl"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Tailscale Mesh VPN AI Skill Guide (Claude)

## Overview & Engine Architecture

Tailscale is a **coordination-plane + WireGuard data-plane** mesh VPN. Nodes register with a control server (Tailscale SaaS or self-hosted Headscale), exchange keys and ACL policy, then encrypt traffic peer-to-peer. When UDP hole-punching fails (symmetric NAT, locked-down firewalls), encrypted packets fall back through **DERP** relays (or optional peer relays). Agents should treat **route advertisement** and **admin approval** as a double opt-in, treat MagicDNS as an OS DNS integration problem, and never invent auth keys or ACL principals.

```
┌─────────────────────────────────────────────────────────────┐
│                 Tailscale mesh                              │
│                                                             │
│  Control plane (coord + ACL + MagicDNS names)               │
│  ├── Auth / tags / key expiry                               │
│  ├── autoApprovers for routes & exit nodes                  │
│  └── Policy: who may reach which tags / CIDRs               │
│                                                             │
│  Data plane (WireGuard)                                     │
│  ├── Prefer direct UDP (often ListenPort ~41641)            │
│  ├── Else DERP / peer-relay (encrypted WG still)            │
│  └── Subnet router / exit node = forward + advertise        │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Joining laptops, CI runners, and cloud VMs into one private overlay without opening inbound WAN ports.
- Exposing a LAN that cannot run Tailscale via a **subnet router**.
- Debugging “slow VPN” (DERP relay) vs broken routes / ACL denials.
- Publishing internal HTTPS with Serve, or carefully exposing with Funnel.

**Do not use when**

- You need a self-managed, no-vendor WireGuard fabric with your own key distribution → `@wireguard`.
- You need classic site-to-site IPsec / vendor SD-WAN with existing enterprise gear only.
- Someone asks to paste live **auth keys**, OAuth client secrets, or full ACL with real employee emails into chat/Git → refuse; use env vars / secret stores (`@vault`).

---

## Operational Capabilities & Agent Directives

1. **Persist IP forwarding** on Linux subnet routers / exit nodes via `/etc/sysctl.d/` (`net.ipv4.ip_forward=1`, IPv6 forwarding as needed); do not rely on a one-shot `sysctl -w`.
2. **Advertise then approve**: `tailscale set --advertise-routes=CIDR` (or `tailscale up …`) is incomplete until routes are approved in Admin Console **or** covered by `autoApprovers` (re-advertise after policy changes—auto-approvers are not retroactive for already-pending routes).
3. **Clients must `--accept-routes`** (or UI equivalent) to install advertised subnet routes.
4. **Diagnose path first**: `tailscale netcheck` + `tailscale ping` — distinguish `direct` vs `via DERP(...)` before blaming application latency.
5. **MagicDNS / Linux DNS**: prefer `systemd-resolved` stub symlink (`/etc/resolv.conf` → stub); use `--accept-dns` intentionally; on Amazon Linux watch for resolv.conf loops.
6. **SNAT default**: subnet traffic is SNAT’d by default; only disable with `--snat-subnet-routes=false` when the LAN has static routes back to CGNAT/`100.x` ranges.
7. **Never invent credentials**: auth keys, OAuth tokens, and API keys come from the operator’s secret store; use placeholders like `$TAILSCALE_AUTH_KEY`.

---

## Production Example: Linux subnet router

```bash
#!/usr/bin/env bash
# Subnet router bootstrap — credentials via env only
set -euo pipefail

SUBNET_CIDR="${SUBNET_CIDR:-192.0.2.0/24}"   # DOCUMENTATION prefix; replace with real LAN
AUTH_KEY="${TAILSCALE_AUTH_KEY:-}"

sudo tee /etc/sysctl.d/99-tailscale.conf >/dev/null <<'EOF'
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1
EOF
sudo sysctl -p /etc/sysctl.d/99-tailscale.conf

# firewalld hosts may need: firewall-cmd --permanent --add-masquerade && firewall-cmd --reload
# Prefer nftables/ufw defaults that deny forward unless explicitly allowed.

if ! command -v tailscale >/dev/null; then
  curl -fsSL https://tailscale.com/install.sh | sh
fi

if [[ -n "$AUTH_KEY" ]]; then
  sudo tailscale up --auth-key="$AUTH_KEY" --advertise-routes="$SUBNET_CIDR"
else
  sudo tailscale up --advertise-routes="$SUBNET_CIDR"
fi

echo "Approve routes in Admin Console (or autoApprovers), then on clients:"
echo "  sudo tailscale set --accept-routes"
sudo tailscale status
```

Minimal `autoApprovers` sketch (Admin Console policy — use tags, not invented emails):

```jsonc
{
  "tagOwners": {
    "tag:subnet-router": ["autogroup:admin"]
  },
  "autoApprovers": {
    "routes": {
      "192.0.2.0/24": ["tag:subnet-router"]
    },
    "exitNode": ["tag:exit"]
  },
  "acls": [
    {
      "action": "accept",
      "src": ["autogroup:member"],
      "dst": ["192.0.2.0/24:*"]
    }
  ]
}
```

Validation loop:

```bash
tailscale netcheck
tailscale status
tailscale ping --c 5 <peer-or-lan-host>
# Expect: "direct" for healthy LAN/WAN UDP; "via DERP" explains high RTT
ip route | grep -E 'tailscale|100\.'
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| High RTT / low throughput; `ping` shows `via DERP` | Symmetric NAT or UDP blocked; stuck on relay | Open/allow UDP (often 41641); check `netcheck` UDP; consider peer relays; accept DERP for hard NAT |
| Subnet advertised but LAN unreachable | Route not approved; client missing `--accept-routes`; `ip_forward=0` | Approve in Machines → Subnets; `sysctl` forward=1; client `tailscale set --accept-routes` |
| ACL “connection refused” / timeout to allowed host | Policy `dst` missing tag/CIDR; wrong port | Diff HuJSON ACL; test with broader rule then tighten |
| MagicDNS works nowhere / intermittent on Linux | `resolv.conf` fight (DHCP vs tailscaled); not using resolved stub | Symlink stub resolv.conf; restart `systemd-resolved` + `tailscaled`; or `--accept-dns=false` and point `*.ts.net` at `100.100.100.100` |
| DNS broken after exit node | Exit node DNS overrides split DNS | Enable nameserver “Use with exit node” in Admin DNS, or adjust exit usage |
| Windows TUN / Wintun errors | Conflicting VPN filter drivers | Remove conflicting adapters; restart Tailscale service |
| Route approval never auto-applies after ACL edit | `autoApprovers` not retroactive | Remove/re-advertise routes after policy change |

---

## Best Practices

1. Prefer **tagged** servers (`tag:ci`, `tag:prod`) over user-owned keys for always-on routers; tags disable key expiry by default.
2. Least-privilege ACLs: grant CIDR/port access to groups/tags, not `*:*` for everyone.
3. Document whether Funnel (public) vs Serve (tailnet-only) is intentional; Funnel is an internet exposure path.
4. For HA subnet access, run redundant routers carefully—overlapping CIDRs need clear primary/failover design.
5. Monitor `tailscale status` / admin for expired nodes and unapproved routes in CI/CD jump hosts.

---

## Limitations

- Control plane trust: SaaS (or your Headscale) sees metadata/coordination; data plane is WireGuard end-to-end, but DERP still relays ciphertext when direct fails.
- Not a replacement for cloud VPC peering/Transit Gateway at scale without careful subnet and ACL design.
- Apple platforms and some IoT devices have feature gaps (e.g. subnet advertising constraints).
- Stop and ask if auth key scopes, ACL ownership, or production CIDRs are unspecified.

---

## Related Skills

- `@wireguard` — raw WG when you own keys/endpoints without Tailscale control plane
- `@nginx` / `@nginx-hardening` — private apps behind Serve or subnet-only listeners
- `@vault` — store auth keys / OAuth client secrets for automation
- `@ansible` — fleet install of `tailscaled` + sysctl
- `@github-actions` — ephemeral CI nodes with tagged auth keys

---

## Agent Operational Directive

> **MANDATORY**: Persist IP forwarding for routers/exit nodes. Treat advertise + approve (+ client `--accept-routes`) as required steps. Diagnose direct vs DERP before optimizing apps. Never commit or invent Tailscale auth keys; use env/secret references. Fix Linux DNS via resolved/stub patterns rather than silently rewriting `/etc/resolv.conf` forever.

---

## Source anchors (research)

- [Subnet routers](https://tailscale.com/docs/features/subnet-routers)
- [Configure a subnet router](https://tailscale.com/docs/features/subnet-routers/how-to/setup)
- [Disable subnet route masquerading (SNAT)](https://tailscale.com/docs/reference/troubleshooting/network-configuration/disable-subnet-route-masquerading)
- [Policy file / autoApprovers](https://tailscale.com/docs/reference/syntax/policy-file)
- [Linux DNS / resolv.conf](https://tailscale.com/docs/reference/linux-dns)
- [DERP servers](https://tailscale.com/docs/reference/derp-servers)
