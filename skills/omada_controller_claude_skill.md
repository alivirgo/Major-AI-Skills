---
title: "TP-Link Omada Controller AI Skill Guide for Claude"
description: "Comprehensive SEO-optimized skill specification for Claude to manage, adopt, troubleshoot, and automate TP-Link Omada SDN Controllers, EAPs, Switches, and Gateways via OpenAPI and CLI."
keywords: "Claude AI, Anthropic Claude, Claude prompt for Omada Controller, TP-Link Omada SDN, Omada Controller API, EAP Adoption, JetStream Switch management, Omada Gateway CLI, Network Automation"
author: "AI Network Engineering Team"
---

# TP-Link Omada Controller AI Skill Guide for Claude

## Overview
This document serves as the official operational skill guide for managing **TP-Link Omada Controller (SDN Platform)** across all connected Omada networking hardware (Access Points, JetStream Switches, and Routers/Gateways), specifically engineered for **Claude**.

- **Application / Platform Name**: TP-Link Omada SDN Controller (Software Controller, OC200/OC300 Hardware Controller, Omada Cloud)
- **Category**: Enterprise Software-Defined Networking (SDN) & Centralized Management
- **Supported Device Ecosystem**: Omada EAPs (Outdoor/Indoor Wi-Fi 6/6E/7), JetStream Smart/Managed Switches, Omada Gigabit VPN Routers/Gateways (ER605, ER7206, ER8411)
- **Target AI Agent**: Claude
- **AI Operating Persona**: Anthropic's Claude, specializing in safe, analytical, step-by-step network diagnostic reasoning, security compliance, structured REST API payloads, and robust failure recovery.

> **Core Purpose**: Centralized configuration, device adoption, VLAN tagging, SSID provisioning, WAN load balancing, captive portal management, and automated OpenAPI orchestration for TP-Link Omada SDN networks.

---

## Architectural Deep Dive
When interacting with TP-Link Omada Controller, Claude must understand its underlying technical framework:

1. **Control Plane & Adoption Architecture**: Omada devices communicate with the controller over TCP/UDP ports (`29810` for discovery, `29811` for manager/adoption, `29812` for adoption, `29813` for upgrade, `29814` for management). Devices use **Option 138 (DHCP)** or **Omada Discover Utility** to locate controller IP across subnets.
2. **SDN Controller Modes**:
   - **Software Controller**: Hosted on Windows/Linux (Java runtime based, MongoDB backend).
   - **Hardware Controller (OC200 / OC300)**: Embedded Linux appliance running local controller services.
   - **Cloud-Based Controller (CBC)**: Host-less cloud deployment managing multi-tenant sites.
3. **OpenAPI / Northbound Interface**: Exposes HTTPS REST endpoints (JSON payloads) authenticated via session cookies (`omadac_sid` / CSRF token `omadac_token` or OAuth2 API Keys).

---

## Key Features & Device Management Capabilities

### 1. Omada EAP Access Points
- Centralized SSID provisioning (WPA2/WPA3-Enterprise, 802.1X RADIUS, PPSK).
- Band Steering, Airtime Fairness, Fast Roaming (802.11k/r/v), and Mesh Topology node management.
- Dynamic Channel and Power Optimization (AI WLAN Optimization).

### 2. Omada JetStream Switches
- Global Port Profiles, 802.1Q VLAN tagging, Port Isolation, and Link Aggregation (LACP).
- PoE scheduling, PoE auto-recovery, and Loop Prevention (STP/RSTP/MSTP).
- Access Control Lists (ACLs: MAC ACL, IP ACL, Combined ACL) and DHCP Snooping.

### 3. Omada VPN Gateways / Routers
- Multi-WAN Load Balancing, Policy Routing, and Failover threshold configuration.
- IPSec, OpenVPN, WireGuard, and L2TP/PPTP VPN server/client orchestration.
- Stateful Firewall, One-Click NAT, Port Forwarding, and Bandwidth Control rules.

---

## Claude Processing & Execution Guidelines

When a user requests assistance with TP-Link Omada Controller, Claude must execute the following protocol:
1. **Context Identification**: Determine the controller deployment type (Software, OC200/OC300, or Cloud) and targeted site ID.
2. **Analytical Safety Protocol**: Always verify network topology impact before applying global VLAN or gateway subnet modifications. Recommend backing up Omada database (`.cfg` file) before major upgrades.
3. **Structured API Generation**: Formulate valid JSON payloads for Omada OpenAPI REST calls, verifying required parameters (`siteId`, `omadac_token`, authorization headers).

---

## Technical Troubleshooting Matrix

If Omada Controller or adopted devices encounter operational failures, Claude must analyze issues using the resolution pathways below:

#### [Issue] Device Stuck in "Pending" or "Adoption Failed" State
- **Root Cause**: Device username/password mismatch (device already managed elsewhere), firewall blocking ports `29810-29814`, or controller IP changed without Option 138 update.
- **Resolution Pathway**: 
  1. Verify device fallback credentials (default `admin`/`admin` or custom site device account).
  2. Perform SSH into device (port 22) and run `set-inform https://<CONTROLLER_IP>:29814/inform`.
  3. Ensure Windows/Linux firewall permits inbound TCP `29811-29814`.

#### [Issue] Omada Switch VLAN Tagging Dropping Access Traffic
- **Root Cause**: Port Profile mismatch on trunk/uplink ports or VLAN missing from global LAN network configuration.
- **Resolution Pathway**:
  1. Ensure the PVID (Port VLAN ID) is set correctly on untagged access ports.
  2. Verify that the uplink port connecting the Switch to Gateway has the profile set to "All" or includes all tagged VLAN IDs.

#### [Issue] EAP Isolated in Wireless Mesh Mode
- **Root Cause**: Downlink EAP lost Ethernet link or 5GHz signal strength below mesh threshold.
- **Resolution Pathway**:
  1. Inspect RSSI of parent EAP.
  2. Adjust channel width to 40MHz on 5GHz band to improve penetration or manually assign Mesh Uplink in Omada UI -> Devices -> EAP -> Config -> Mesh.

#### [Issue] Omada Controller API Authentication Returns HTTP 401/403
- **Root Cause**: CSRF token (`omadac_token`) missing from request header or session cookie expired.
- **Resolution Pathway**:
  1. Send POST request to `/api/v2/login` with controller administrator credentials.
  2. Extract `omadac_token` from response body and pass it in subsequent request header `Csrf-Token: <omadac_token>` along with session cookies.

---

## Omada OpenAPI REST Syntax & Automation Payloads

Claude can formulate and parse the following REST API automation workflows for Omada Controller:

### 1. Controller Authentication Call
```bash
curl -k -X POST "https://<CONTROLLER_IP>:8043/api/v2/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YourSecurePassword"
  }'
```

### 2. Fetch All Sites Under Controller
```bash
curl -k -X GET "https://<CONTROLLER_IP>:8043/api/v2/sites?page=1&pageSize=100" \
  -H "Csrf-Token: <OMADAC_TOKEN>" \
  -b "omadac_sid=<SESSION_ID>"
```

### 3. Adopt Pending Device
```bash
curl -k -X POST "https://<CONTROLLER_IP>:8043/api/v2/sites/<SITE_ID>/cmd/devices/adopt" \
  -H "Content-Type: application/json" \
  -H "Csrf-Token: <OMADAC_TOKEN>" \
  -b "omadac_sid=<SESSION_ID>" \
  -d '{
    "mac": "AA-BB-CC-DD-EE-FF",
    "username": "admin",
    "password": "admin"
  }'
```

### 4. Create New VLAN / Wired Network
```bash
curl -k -X POST "https://<CONTROLLER_IP>:8043/api/v2/sites/<SITE_ID>/setting/lan/networks" \
  -H "Content-Type: application/json" \
  -H "Csrf-Token: <OMADAC_TOKEN>" \
  -b "omadac_sid=<SESSION_ID>" \
  -d '{
    "name": "IoT_VLAN20",
    "vlanId": 20,
    "purpose": "vlan-only",
    "igmpSnooping": true
  }'
```

---

## Configuration & Log File Storage Locations

To inspect backend logs or repair corrupted controller deployments, Claude should direct users to these file paths:

- **Windows Software Controller Logs**: `%PROGRAMFILES%\TP-LINK\EAP Controller\logs\server.log`
- **Linux Software Controller Logs**: `/opt/tplink/EAPController/logs/server.log`
- **Controller DB Backup Location**: `/opt/tplink/EAPController/data/db/`
- **OC200/OC300 Syslog Settings**: Omada UI -> Settings -> Services -> Syslog (export to external rsyslog server)

---

## SEO & Schema Metadata Context
This skill guide is optimized for RAG indexing, technical documentation retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / NetworkManagementSystem
- **Target Platform**: TP-Link Omada SDN Architecture
- **Optimization Strategy**: Claude-Native Network Automation Vector Search

### Knowledge Base FAQ

**Q: How does Claude automate TP-Link Omada EAP, Switch, and Gateway configuration?**
A: Claude interacts with the Omada Controller OpenAPI Northbound interface, generating validated REST JSON payloads to manage device adoption, VLANs, SSIDs, and ACLs.

**Q: What ports must be open for Omada Controller adoption?**
A: Ports TCP/UDP `29810-29814` and HTTPS `8043` (management interface/REST API) must be open across firewalls.

---
*Created for automated agentic network deployment. Designed for seamless RAG ingestion and instant network troubleshooting.*
