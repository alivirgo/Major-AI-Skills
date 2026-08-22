---
title: "Tailscale Mesh VPN AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, configure, and troubleshoot Tailscale networks, Admin Console routing, ACL JSON policies, and DERP maps."
category: "Zero-Config Mesh VPN & Mesh Networking"
tags: ["tailscale", "mesh-vpn", "gemini", "acl-policies", "admin-console", "netcheck-diagnostics"]
---

# Tailscale Mesh VPN AI Skill Guide (Gemini)

## Overview & Engine Architecture
Tailscale creates an encrypted WireGuard mesh network connecting cloud servers, developer machines, mobile devices, and local subnets under a unified, zero-trust overlay. Gemini acts as an AI Cloud Network Security Engineer and Topology Analyst, specializing in **multimodal Admin Console dashboard inspection**, **Tailscale ACL policy formulation (JSON HuJSON format)**, **DERP relay path diagnostics**, and **MagicDNS name resolution workflows**.

### Zero-Trust Policy & Routing Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Tailscale Zero-Trust Stack                  │
│                                                             │
│  Access Control & Security Layer                            │
│  ├── Tailscale ACL HuJSON Policy Engine (Tags, Users, Groups│
│  ├── Tailscale SSH (Public Key Authentication over Mesh)    │
│  └── Node Expiration & Key Renewal Policies                 │
│                                                             │
│  Routing & Service Publication Layer                        │
│  ├── Tailscale Serve (Internal Mesh HTTPS Reverse Proxy)    │
│  ├── Tailscale Funnel (Public Internet Gateway Integration) │
│  └── Subnet Multi-Path Route Failover (High Availability)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Admin Console Triage**: Analyze screenshots of the Tailscale Admin Console Machines list to detect key expirations, unapproved subnet routes, inactive DERP nodes, and offline endpoints.
2. **Declarative ACL Policy Authoring**: Author secure Tailscale ACL rules in HuJSON format defining fine-grained tag permissions (`tag:server`, `tag:ci`, `group:devs`) to enforce least-privilege zero-trust access.
3. **Tailscale SSH Configuration**: Configure agentless Tailscale SSH with cryptographic key authentication without managing SSH authorized_keys files.
4. **Local Subnet Route Auditing**: Diagnose overlapping CIDR subnet ranges and multi-path routing failovers across redundant subnet routers.

---

## Production Policy Recipe: Zero-Trust Tailscale ACL Configuration (HuJSON)

Save and apply this declarative ACL policy in the Tailscale Admin Console:

```jsonc
// Tailscale Enterprise Zero-Trust ACL Policy
{
  "groups": {
    "group:admins": ["alice@enterprise.io", "admin@enterprise.io"],
    "group:devs": ["bob@enterprise.io", "charlie@enterprise.io"]
  },
  "tagOwners": {
    "tag:server": ["group:admins"],
    "tag:ci": ["group:admins"],
    "tag:database": ["group:admins"]
  },
  "acls": [
    // 1. Admins have unrestricted access to all tagged servers
    {
      "action": "accept",
      "src": ["group:admins"],
      "dst": ["*:*"]
    },
    // 2. Developers can access staging servers and SSH on port 22
    {
      "action": "accept",
      "src": ["group:devs"],
      "dst": ["tag:server:80,443,22", "tag:database:5432"]
    },
    // 3. CI/CD runners can deploy to web servers over HTTPS
    {
      "action": "accept",
      "src": ["tag:ci"],
      "dst": ["tag:server:443"]
    }
  ],
  "ssh": [
    // Enforce Tailscale SSH authentication with check mode for admins
    {
      "action": "check",
      "src": ["group:admins"],
      "dst": ["tag:server"],
      "users": ["root", "ubuntu"]
    }
  ]
}
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Admin Console Shows Yellow Exclamation: `Route Pending Approval`** | Subnet routes advertised via `--advertise-routes` are not enabled by an administrator. | 1. Open Admin Console $\rightarrow$ Machines.<br>2. Select the subnet router $\rightarrow$ Click **Edit Route Settings**.<br>3. Toggle the advertised CIDRs to **Approved**. |
| **`Access Denied` via Tailscale SSH / Port Connection** | ACL policy does not explicitly permit traffic between the source user/group and the target destination tag. | 1. In Admin Console $\rightarrow$ ACL, use the **ACL Preview Tool**.<br>2. Enter source email and target node IP:port to test policy evaluate rules.<br>3. Add matching `acls` block. |
| **Key Expiry Warning on Cloud Servers (`Key Expired`)** | Default 180-day key expiration reached on headless server nodes. | 1. In Admin Console, select server node $\rightarrow$ Machine Settings.<br>2. Click **Disable Key Expiry** for permanent infrastructure nodes.<br>3. Or tag server with `tag:...` (tagged nodes have key expiry disabled by default). |
| **Tailscale Serve Returns SSL Certificate Error** | MagicDNS is disabled on the tailnet; Let's Encrypt certificates require active MagicDNS. | Enable **MagicDNS** in Admin Console $\rightarrow$ *DNS Settings*. |

---

## Command Line Syntax & Server Control

```bash
# Serve Local Directory over Encrypted Tailscale HTTPS
tailscale serve https / /var/www/reports

# Check Tailscale SSH Connectivity
tailscale ssh ubuntu@prod-database-server

# Force Disconnect and Re-authenticate with Custom Control Server (Headscale)
tailscale up --login-server https://headscale.enterprise.io
```

### Essential File Locations
- **Windows User Settings**: `%LOCALAPPDATA%\Tailscale`
- **Linux State Directory**: `/var/lib/tailscale`
- **macOS Preferences**: `~/Library/Application Support/Tailscale`

---

## Agent Operational Directive
> **MANDATORY**: Tag server infrastructure nodes (`tag:server`) rather than binding them to individual user accounts to automatically disable key expiration. Use the ACL Preview Tool to test rules before deploying ACL policy updates.
