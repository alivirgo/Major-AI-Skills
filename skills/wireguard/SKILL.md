---
name: wireguard
description: "Operational skill for agents to deploy WireGuard VPNs - keys, interfaces, AllowedIPs, NAT traversal notes, and least-privilege peer routing."
category: network
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["wireguard", "vpn", "networking", "wg", "tunnel", "security"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# WireGuard VPN AI Skill Guide

## Overview

WireGuard is a modern VPN that authenticates peers with public keys and encrypts traffic over UDP. Each interface has a private key; peers are listed with **PublicKey**, endpoint (optional), and **AllowedIPs** (cryptokey routing). Agents should treat AllowedIPs as both routing and ACL - overly broad `0.0.0.0/0` on every peer is rarely correct for site-to-site designs.

```
Peer A (wg0)  <--- UDP/WireGuard --->  Peer B (wg0)
AllowedIPs:                            AllowedIPs:
  10.0.0.2/32                            10.0.0.1/32
  10.1.0.0/16 (optional LAN)             ...
```

## When to use

- Building point-to-point or hub-and-spoke private networks
- Exposing admin tooling without public internet ports
- Replacing complex IPsec topologies for small/medium fleets
- Debugging handshake failures and wrong AllowedIPs routing

## Operational directives

1. Generate keys on-box; never paste private keys into chat or Git.
2. Scope AllowedIPs to the minimal prefixes each peer should reach.
3. Keep ListenPort and firewall UDP rules explicit; block WAN management otherwise.
4. Use `PersistentKeepalive` (e.g. 25) for NAT'd clients that need to stay reachable.
5. Prefer separate interfaces/networks for user VPN vs site tunnels.

## Concrete examples

### Key generation

```bash
umask 077
wg genkey | tee server.key | wg pubkey > server.pub
wg genkey | tee client.key | wg pubkey > client.pub
```

### Server `/etc/wireguard/wg0.conf`

```ini
[Interface]
Address = 10.0.0.1/24
ListenPort = 51820
PrivateKey = <SERVER_PRIVATE>

# optional NAT for client internet egress (only if intentional)
# PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
# PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = <CLIENT_PUBLIC>
AllowedIPs = 10.0.0.2/32
```

### Client config

```ini
[Interface]
Address = 10.0.0.2/24
PrivateKey = <CLIENT_PRIVATE>
DNS = 10.0.0.1

[Peer]
PublicKey = <SERVER_PUBLIC>
Endpoint = vpn.example.com:51820
AllowedIPs = 10.0.0.0/24, 10.1.0.0/16
PersistentKeepalive = 25
```

### Bring-up and debug

```bash
wg-quick up wg0
wg show
wg show wg0 latest-handshakes
ping 10.0.0.1
ip route get 10.1.0.10
```

## Troubleshooting table

| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| No handshake | UDP blocked / wrong endpoint | Check firewall, NAT, DNS |
| Handshake OK, no ping | AllowedIPs / OS routes | Align AllowedIPs both sides |
| Intermittent NAT drop | No keepalive | Set PersistentKeepalive |
| Asymmetric traffic | Missing forwarding/MASQUERADE | Enable only if designed |

## Best practices

1. Rotate keys on offboarding; remove Peer blocks promptly.
2. Run `wg-quick` via systemd (`wg-quick@wg0`) for persistence.
3. Log and monitor handshake age; alert on stale peers that should be live.
4. Split-tunnel by default for laptops - full-tunnel only when policy requires.

## Limitations

- WireGuard does not provide user accounts/MFA by itself - pair with SSO gateways if needed.
- Roaming works well, but complex enterprise policy may still need a control plane (Headscale, etc.).
- MTU issues can appear on nested tunnels - tune if TCP stalls.

## Related skills

- `cloudflare-dns` - hostname for VPN endpoints
- `nginx-hardening` - publish apps privately over WG + local proxy
- `lets-encrypt` - public HTTPS on the VPN entry portal if any
- `makefile-automation` - helper targets for keygen hygiene (without printing keys)
