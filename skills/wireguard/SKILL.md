---
name: wireguard
description: "Design WireGuard interfaces with cryptokey routing (AllowedIPs), PersistentKeepalive for NAT, and forwarding/NAT only when intended; debug handshake vs routing failures."
category: network
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["wireguard", "vpn", "networking", "wg-quick", "allowedips", "cryptokey-routing"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# WireGuard VPN AI Skill Guide (Claude)

## Overview & Engine Architecture

WireGuard is a **UDP tunnel** with Noise-based handshake and a single critical idea: **cryptokey routing**. Each peer’s `AllowedIPs` is both the **ACL** (which source packets may arrive as that peer) and the **route table** (which destinations are sent to that peer). There is no user/password plane—only keys, endpoints, and OS forwarding. Agents must generate keys on-box, never paste private keys into repos/chat, and separate “no handshake” from “handshake OK but AllowedIPs/routes wrong.”

```
┌─────────────────────────────────────────────────────────────┐
│                 WireGuard cryptokey routing                 │
│                                                             │
│  Interface wg0                                              │
│  ├── PrivateKey (local) / ListenPort (server)               │
│  └── Peer: PublicKey + Endpoint? + AllowedIPs + keepalive?  │
│                                                             │
│  Packet out: dst ∈ peer AllowedIPs → encrypt to that peer   │
│  Packet in:  src must match peer AllowedIPs or drop         │
│                                                             │
│  Optional host role                                         │
│  ├── ip_forward + FORWARD rules (site / LAN access)         │
│  └── MASQUERADE (full-tunnel internet egress only if needed)│
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Point-to-point or small hub-and-spoke private networks you fully control.
- Exposing admin tooling without public app ports (bind services to `wg0` only).
- Replacing simple IPsec site links where static peers are enough.

**Do not use when**

- You want SSO, device posture, MagicDNS, and managed ACL UX → `@tailscale`.
- You need per-user MFA identity baked into the tunnel itself (pair WG with an IdP gateway instead).
- Someone asks to commit private keys or share them in chat → refuse; use files mode `0600` and secret managers (`@vault`).

---

## Operational Capabilities & Agent Directives

1. **Generate keys with umask 077**; store private keys only on the host (`/etc/wireguard/` mode `700`/`600`).
2. **Scope AllowedIPs** to tunnel `/32`s plus intentional LAN prefixes—avoid reflexive `0.0.0.0/0` on every peer unless full-tunnel is the design.
3. **Symmetric mental model**: if A routes `10.1.0.0/16` to B, B’s peer entry for A must allow A’s tunnel IP (and return path for LAN sources if applicable).
4. **NAT clients**: set `PersistentKeepalive = 25` on the NAT’d side so the mapping stays open (WireGuard is silent by default).
5. **Forwarding is explicit**: enable `ip_forward` and firewall FORWARD/NAT only for designed gateway roles; persist via sysctl.d.
6. **Prefer `wg-quick@.service`** for boot persistence; validate with `wg show` handshakes and `ip route get`.

---

## Production Example: hub-and-spoke (split tunnel)

Keygen (on each host, do not echo secrets into logs):

```bash
umask 077
wg genkey | tee /etc/wireguard/server.key | wg pubkey > /etc/wireguard/server.pub
wg genkey | tee /etc/wireguard/client.key | wg pubkey > /etc/wireguard/client.pub
```

Server `/etc/wireguard/wg0.conf` (placeholders only):

```ini
[Interface]
Address = 10.10.0.1/24
ListenPort = 51820
PrivateKey = <SERVER_PRIVATE_KEY>
# Optional LAN access for clients — enable forwarding first
# PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -A FORWARD -o wg0 -j ACCEPT
# PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -D FORWARD -o wg0 -j ACCEPT

[Peer]
# laptop
PublicKey = <CLIENT_PUBLIC_KEY>
AllowedIPs = 10.10.0.2/32
```

Client:

```ini
[Interface]
Address = 10.10.0.2/24
PrivateKey = <CLIENT_PRIVATE_KEY>
DNS = 10.10.0.1

[Peer]
PublicKey = <SERVER_PUBLIC_KEY>
Endpoint = vpn.example.com:51820
AllowedIPs = 10.10.0.0/24, 10.1.0.0/16
PersistentKeepalive = 25
```

Bring-up and validation:

```bash
sudo systemctl enable --now wg-quick@wg0
sudo wg show wg0
sudo wg show wg0 latest-handshakes
ping -c 3 10.10.0.1
ip route get 10.1.0.10
# Firewall: allow UDP/51820 on server WAN
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| No `latest handshake` / transfer counters stuck at 0 | UDP blocked, wrong Endpoint/DNS, key mismatch | Check WAN UDP ListenPort; verify pubkeys not swapped; `tcpdump -n udp port 51820` |
| Handshake OK, ping fails | AllowedIPs / OS routes mismatch | Align AllowedIPs both sides; `ip addr` / `ip route` on `wg0` |
| `Destination Host Unreachable` / “Destination address required” | Peer has no Endpoint and has not received traffic yet; or NAT mapping expired | Initiate from side that has Endpoint; set PersistentKeepalive on NAT peer |
| Works briefly then dies behind NAT | Missing keepalive | `PersistentKeepalive = 25` on client |
| Clients reach hub but not LAN | `ip_forward=0` or FORWARD drop; missing return routes | Persist sysctl; firewall ACCEPT forward; optional MASQUERADE only if designed |
| TCP stalls / weird HTTP hangs | MTU / nested tunnel | Lower MTU (e.g. 1280–1420); test with `ping -M do -s` |
| Intermittent one-way traffic | Asymmetric AllowedIPs (source not allowed on return peer) | Fix peer AllowedIPs for real source CIDRs |

---

## Best Practices

1. Rotate and delete Peer blocks on offboarding the same day.
2. Use optional PresharedKey files for extra PQ mixing—still never commit them.
3. Monitor handshake age; alert when expected-online peers go stale.
4. Split-tunnel laptops by default; full-tunnel only with clear policy + DNS plan.
5. Bind SSH/admin listeners to WG addresses; keep WAN management closed.

---

## Limitations

- No built-in user directory, SSO, or device inventory—compose with IdP / bastion patterns.
- Roaming is excellent, but large dynamic fleets often prefer a control plane (`@tailscale` / Headscale).
- Mobile OS WG apps differ in Always-on / kill-switch behavior.
- Stop and ask for real CIDRs, ListenPort, and whether NAT egress is intentional before generating configs.

---

## Related Skills

- `@tailscale` — managed mesh, ACLs, DERP, MagicDNS on top of WireGuard
- `@nginx-hardening` — publish apps only on WG interface
- `@lets-encrypt` — TLS for any public portal in front of VPN onboarding
- `@cloudflare-dns` — stable Endpoint hostname for hubs
- `@ansible` — distribute peer configs without printing private keys

---

## Agent Operational Directive

> **MANDATORY**: Treat AllowedIPs as routing + ACL on every peer. Separate handshake failures from routing failures. Require PersistentKeepalive for NAT’d clients that must receive inbound traffic. Never invent or commit private keys; use placeholders and file permissions. Enable forwarding/MASQUERADE only when the design explicitly needs a gateway.

---

## Source anchors (research)

- [WireGuard Quick Start (PersistentKeepalive)](https://www.wireguard.com/quickstart/)
- [wg(8) man page](https://man7.org/linux/man-pages/man8/wg.8.html)
- [Ubuntu WireGuard troubleshooting](https://ubuntu.com/server/docs/how-to/wireguard-vpn/troubleshooting/)
- [RHEL: WireGuard behind NAT/firewalls](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_networking/assembly_setting-up-a-wireguard-vpn_configuring_and_managing_networking)
