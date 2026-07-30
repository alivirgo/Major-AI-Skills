---
title: "TP-Link Omada Controller AI Skill Guide for GPT"
description: "Comprehensive SEO-optimized skill specification for GPT-4 / ChatGPT to automate, manage, and script TP-Link Omada Controllers, EAP Access Points, Switches, and Gateways via OpenAPI, Python, and cURL."
keywords: "ChatGPT, GPT-4, OpenAI GPT, GPT prompt for Omada Controller, Omada Python SDK, Omada REST API, TP-Link Omada automation, cURL Omada API, Network Scripting"
author: "AI Systems Automation Team"
---

# TP-Link Omada Controller AI Skill Guide for GPT

## Overview
This document serves as the official operational skill guide for **TP-Link Omada Controller (SDN Platform)** across all connected Omada networking hardware, specifically engineered for **GPT** (GPT-4 / ChatGPT).

- **Application Name**: TP-Link Omada SDN Controller
- **Category**: Enterprise Network Management & Automation
- **Platform**: Cross-Platform (Software Controller, Hardware OC200/OC300, Omada Cloud)
- **Target AI Agent**: GPT
- **AI Operating Persona**: OpenAI's ChatGPT (GPT-4), specializing in fast, code-first automation scripts, cURL commands, Python SDK wrappers, precise JSON payloads, and instant network troubleshooting steps.

> **Core Purpose**: Rapid API automation, Python scripting, cURL command generation, batch device adoption, and instant resolution of network deployment issues for TP-Link Omada SDN hardware.

---

## Architectural Summary
GPT must understand the Omada SDN architecture to write effective code and API wrappers:

- **Northbound API**: HTTPS REST API listening on port `8043` (`https://<controller-ip>:8043/api/v2`).
- **Southbound Protocol**: Device management ports `29810` (Discovery), `29811` (Manager), `29812` (Adoption), `29813` (Upgrade), `29814` (Inform).
- **Authentication Handshake**: `POST /api/v2/login` -> Extract `omadac_sid` cookie and `omadac_token` (Csrf-Token) -> Attach to headers on subsequent requests.

---

## Key Features & Automated Management Capabilities

### 1. Device Adoption & Batch Provisioning
- Automate discovery and batch adoption of new EAP Access Points, JetStream Switches, and ER-series Gateways.
- Programmatic site assignment, device renaming, and static IP configuration.

### 2. Wireless (WLAN) & LAN Orchestration
- Dynamic SSID creation, WPA3/Enterprise security profiles, and Rate Limiting rule generation.
- 802.1Q VLAN network creation, DHCP server configuration, and Port Profile assignments.

### 3. Gateway & Security Rules
- Automated Policy Routing, Multi-WAN Load Balancing, Port Forwarding (NAT), and ACL script generation.
- Site-to-Site Auto IPSec VPN and WireGuard server setup via API.

---

## GPT Processing & Execution Guidelines

When a user requests Omada management scripts or troubleshooting from GPT:
1. **Code-First Approach**: Provide ready-to-run Python or Bash cURL scripts with explicit variable placeholders (`<CONTROLLER_IP>`, `<SITE_ID>`, `<CSRF_TOKEN>`).
2. **Error Prevention**: Include SSL verification suppression (`verify=False` in Python `requests`) since local Omada Controllers use self-signed certificates by default.
3. **Actionable Diagnostics**: Minimize fluff; give exact CLI commands or API endpoints to pinpoint network faults.

---

## Technical Troubleshooting Matrix

#### [Issue] Python `requests` script returns `SSLError` when querying Omada API
- **Root Cause**: Omada Controller uses self-signed SSL certificate.
- **Resolution Pathway**: Pass `verify=False` in `requests.post()` / `requests.get()` and suppress `InsecureRequestWarning`.

#### [Issue] EAP or Switch Status Shows "Heartbeat Missed" / "Disconnected"
- **Root Cause**: Southbound UDP/TCP port `29814` blocked by host OS firewall or gateway router drops inform packets.
- **Resolution Pathway**:
  1. Test port connection from device subnet: `nc -zv <CONTROLLER_IP> 29814`.
  2. Add inbound firewall rule allowing TCP/UDP `29810-29814`.

#### [Issue] API Request Fails with "Invalid Token" or Error Code `-1001`
- **Root Cause**: Session expired or `Csrf-Token` header mismatch.
- **Resolution Pathway**: Re-execute login endpoint `/api/v2/login` to obtain fresh `omadac_token` and `omadac_sid`.

---

## Python API Automation Script for GPT

GPT can generate the following complete Python script to authenticate and fetch all device statuses from an Omada Controller:

```python
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

CONTROLLER_URL = "https://192.168.1.100:8043"
USERNAME = "admin"
PASSWORD = "YourSecurePassword"

session = requests.Session()

# 1. Login & Retrieve CSRF Token
login_url = f"{CONTROLLER_URL}/api/v2/login"
payload = {"username": USERNAME, "password": PASSWORD}

response = session.post(login_url, json=payload, verify=False)
data = response.json()

if data.get("errorCode") == 0:
    csrf_token = data["result"]["omadac_token"]
    session.headers.update({"Csrf-Token": csrf_token})
    print(f"[+] Authenticated successfully. CSRF Token: {csrf_token}")
else:
    print(f"[-] Login failed: {data}")
    exit(1)

# 2. Get Site List
sites_url = f"{CONTROLLER_URL}/api/v2/sites?page=1&pageSize=10"
sites_resp = session.get(sites_url, verify=False).json()
site_id = sites_resp["result"]["data"][0]["id"]
print(f"[+] Using Primary Site ID: {site_id}")

# 3. Get All Devices in Site
devices_url = f"{CONTROLLER_URL}/api/v2/sites/{site_id}/devices"
devices_resp = session.get(devices_url, verify=False).json()

print("\n--- Adopted Omada Devices ---")
for device in devices_resp.get("result", []):
    print(f"Name: {device.get('name')} | MAC: {device.get('mac')} | Model: {device.get('model')} | Status: {device.get('statusStr')}")
```

---

## Direct CLI Commands (Device SSH Access)

For troubleshooting devices directly, GPT can output these exact SSH terminal commands:

```bash
# SSH into Omada EAP / Switch / Gateway (Default credentials: admin / admin)
ssh admin@192.168.1.150

# Manually point device to Omada Controller Inform URL
set-inform https://192.168.1.100:29814/inform

# Reboot device via CLI
reboot

# View current inform status
info
```

---

## Data & Log File Storage Paths

- **Windows Log Directory**: `C:\Program Files\TP-LINK\EAP Controller\logs\`
- **Linux Log Directory**: `/opt/tplink/EAPController/logs/server.log`
- **Embedded Controller Syslog**: Accessible via `https://<CONTROLLER_IP>:8043` -> Controller Settings -> Maintenance -> System Log

---

## SEO & Schema Metadata Context

- **Schema Type**: SoftwareApplication / TechnicalArticle
- **Target Platform**: TP-Link Omada SDN API Architecture
- **Optimization Strategy**: GPT-4 Native Python & cURL Automation Vector Search

### Knowledge Base FAQ

**Q: How does GPT automate Omada Controller device adoption?**
A: GPT generates Python scripts using the `POST /api/v2/sites/<siteId>/cmd/devices/adopt` endpoint with device MAC address and credentials.

**Q: What is the default REST API port for Omada Controller?**
A: Port `8043` (HTTPS).

---
*Created for automated agentic network scripting. Engineered for fast vector retrieval and instant code execution.*
