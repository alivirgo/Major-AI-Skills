---
title: "WireGuard VPN AI Skill Guide (Gemini)"
description: "Diagnose WireGuard from wg show handshakes, tcpdump UDP evidence, and config screenshots—separating no-handshake from AllowedIPs routing failures."
category: "VPN & Cryptokey Routing"
tags: ["wireguard", "gemini", "handshake", "allowedips", "diagnostics"]
---

# WireGuard VPN AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Tunnel Diagnostics Specialist**: interpret **`wg show` tables**, firewall screenshots, and traceroute outputs to decide whether the fault is **UDP/handshake**, **cryptokey routing (AllowedIPs)**, or **host forwarding/NAT**.

```
┌─────────────────────────────────────────────────────────────┐
│                 WireGuard triage                            │
│  latest-handshake empty? → path/keys/UDP                    │
│  handshake OK, ping fail? → AllowedIPs / routes             │
│  LAN fail only? → ip_forward / FORWARD / return path        │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **First question**: is there a recent `latest handshake`? If not, do not debug application routes yet.
2. **Counters**: tx rising / rx zero often means far-side AllowedIPs dropping your source.
3. **NAT laptops**: if works then dies after idle, recommend PersistentKeepalive=25.
4. **MTU**: TCP works for tiny payloads but stalls → ask for MTU experiments.
5. **Never ask users to paste private keys**—only public keys and redacted conf.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence |
| :--- | :--- | :--- |
| `latest handshake: 0` | UDP/endpoint/keys | `tcpdump` UDP ListenPort; pubkey swap check |
| Handshake age fresh, ping fail | AllowedIPs | Both peer conf AllowedIPs + `ip route get` |
| Hub OK, LAN fail | Forwarding | `sysctl ip_forward` + iptables/nft FORWARD |
| Works after client traffic only | No Endpoint on server peer | Keepalive + initiate from client |

---

## Agent Operational Directive

> **MANDATORY**: Split handshake failures from routing failures. Request public evidence only (no private keys). Flag missing keepalive on NAT clients and unintended full-tunnel `0.0.0.0/0`.
