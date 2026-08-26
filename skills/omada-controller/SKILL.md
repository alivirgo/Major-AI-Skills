---
name: omada-controller
description: "Comprehensive operational skill specification for Anthropic Claude to automate, script, troubleshoot, and optimize TP-Link Omada SDN Controller, REST OpenAPI, MongoDB backend, device adoption, and VLAN/VPN routing."
category: network
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["omada-controller", "tp-link-sdn", "rest-openapi", "network-automation", "vlan-routing", "wifi-roaming", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# TP-Link Omada SDN Controller AI Skill Guide (Claude)

## Overview & Engine Architecture
TP-Link Omada SDN Controller is a centralized software-defined networking platform managing Omada EAP wireless access points, JetStream managed switches, and SafeStream/Omada multi-WAN VPN gateways. Powered by a **Java OpenJDK daemon** and an embedded **MongoDB database**, Omada exposes an authenticated **HTTPS REST OpenAPI (`/api/v2`)** and maintains southbound device control via dedicated UDP/TCP ports (**UDP 29810 Discovery, TCP 29811 Management, TCP 29812 Adoption, TCP 29813 Heartbeat, TCP 29814 Upgrade**). Claude operates as a Principal Network Systems Architect and SDN Automation Engineer, specializing in **REST OpenAPI automation**, **Layer 3 remote adoption (`set-inform`)**, **802.1Q VLAN trunking**, and **MongoDB database recovery**.

### Omada SDN Controller Architecture & Protocol Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Omada SDN Controller Stack                  │
│                                                             │
│  Northbound Management & API Ingress                        │
│  ├── HTTPS Web Management Console (Port 8043)               │
│  ├── REST OpenAPI v2/v3 (`/api/v2/login`, Site Operations)  │
│  └── Cloud Portal Gateway (Omada Cloud Management Bridge)   │
│                                                             │
│  SDN Controller Core & Persistence                          │
│  ├── Java Application Daemon (`/opt/tplink/EAPController`)  │
│  ├── MongoDB Database Backend (Device State, Client Logs)   │
│  └── 802.11k/v/r Fast Roaming & AI WLAN Mesh Coordinator    │
│                                                             │
│  Southbound Device Communication Layer                      │
│  ├── UDP 29810 (Device Discovery Broadcasts)                │
│  ├── TCP 29811/29813 (Device Management & Heartbeat Keepalive│
│  └── TCP 29812/29814 (Device Adoption, Firmware Upgrade)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Omada REST OpenAPI Automation**: Author Python scripts to authenticate against Omada Controller, obtain session tokens (`omada_token`), and programmatically retrieve device inventories, client connection stats, and switch port configurations.
2. **Layer 3 Remote Device Adoption**: Remediate cross-subnet adoption failures by guiding administrators to issue the SSH discovery inform command (`set-inform http://<controller_ip>:29812/inform`).
3. **MongoDB Database Recovery & Maintenance**: Repair corrupted database journal locks (`mongod.lock`) and execute database compaction.
4. **VLAN & Multi-WAN Policy Optimization**: Design robust network segmentations with isolated Guest VLANs, 802.1p QoS tagging, and multi-WAN failover rules.

---

## Production Python Automation: Omada Controller REST API Inventory & Client Telemetry Client

Save this script as `omada_api_client.py` (requires `pip install requests urllib3`):

```python
"""
TP-Link Omada SDN Controller REST API Client
Authenticates with controller, extracts active site ID, device states, and connected clients.
"""

import sys
import requests
import json
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

CONTROLLER_URL = "https://192.168.1.50:8043"
USERNAME = "admin"
PASSWORD = "SecurePassword123"

class OmadaController:
    def __init__(self, base_url: str = CONTROLLER_URL):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.verify = False
        self.token = None
        self.omada_id = None

    def login(self, username: str = USERNAME, password: str = PASSWORD):
        print(f"--- [AUTHENTICATING WITH OMADA CONTROLLER: {self.base_url}] ---")
        
        # 1. Obtain Controller ID / Info
        info_res = self.session.get(f"{self.base_url}/api/v2/info")
        if info_res.status_code == 200:
            self.omada_id = info_res.json().get("result", {}).get("omadacId")
        
        login_url = f"{self.base_url}/api/v2/login"
        payload = {"name": username, "password": password}
        res = self.session.post(login_url, json=payload)
        
        if res.status_code == 200 and res.json().get("errorCode") == 0:
            result = res.json().get("result", {})
            self.token = result.get("token")
            self.session.headers.update({"Csrf-Token": self.token})
            print("✅ Authentication successful!")
        else:
            print(f"🚨 Login failed: {res.text}")
            sys.exit(1)

    def get_devices(self, site_id: str = "Default"):
        url = f"{self.base_url}/api/v2/sites/{site_id}/devices"
        res = self.session.get(url)
        if res.status_code == 200:
            devices = res.json().get("result", [])
            print(f"\n--- [OMADA MANAGED DEVICES: ({len(devices)})] ---")
            for d in devices:
                name = d.get("name", "Unnamed")
                model = d.get("model", "Unknown")
                mac = d.get("mac", "")
                ip = d.get("ip", "")
                status = "CONNECTED" if d.get("status") == 1 else "OFFLINE"
                print(f"• [{status:<9}] {name:<20} | Model: {model:<12} | IP: {ip:<15} | MAC: {mac}")
        else:
            print(f"Failed to fetch devices: {res.text}")

if __name__ == "__main__":
    controller = OmadaController()
    controller.login()
    controller.get_devices()
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Device Stuck in `Adopting` or `Pending` State** | Southbound TCP ports 29811–29814 blocked by host firewall or device is on a different L3 subnet without Inform URL. | 1. SSH into AP/Switch (default `admin`/`admin`).<br>2. Run: `set-inform http://<Controller_IP>:29812/inform`.<br>3. In host OS, open ports: `sudo ufw allow 29810:29814/tcp && sudo ufw allow 29810/udp`. |
| **Controller Service Fails to Start: `MongoDB Error`** | Improper shutdown left lock file `mongod.lock` intact or database journal corrupted. | 1. Stop service: `sudo tesseract stop` or `systemctl stop omada`.<br>2. Remove lock: `sudo rm -f /opt/tplink/EAPController/data/db/mongod.lock`.<br>3. Repair: `mongod --dbpath /opt/tplink/EAPController/data/db --repair`.<br>4. Restart service. |
| **Wi-Fi Clients Experience Roaming Drops** | Fast Roaming (802.11k/v/r) disabled or 2.4GHz/5GHz transmit power set too high, preventing handoff. | In Controller Settings $\rightarrow$ Wireless Networks $\rightarrow$ Advanced, enable **802.11r Fast Roaming** and reduce 2.4GHz Tx power to Medium/Low. |
| **SSL / HTTPS Security Warning on Port 8043** | Controller using default self-signed SSL certificate. | In Controller Settings $\rightarrow$ Maintenance $\rightarrow$ **SSL Certificate**, import custom Let's Encrypt / Enterprise PKCS#12 certificate. |

---

## Command Line Syntax & Omada CLI Recipes

```bash
# 1. Inspect Omada Controller Daemon Logs (Linux)
tail -f /opt/tplink/EAPController/logs/server.log

# 2. SSH into EAP / Switch and Set L3 Adoption Inform URL
ssh admin@192.168.1.105 "set-inform http://192.168.1.50:29812/inform"

# 3. Restart Omada Controller Service on Linux
sudo systemctl restart tpeap.service
```

### Essential File Locations
- **Controller Root Directory**: `/opt/tplink/EAPController/` (Linux) or `C:\Program Files (x86)\TP-LINK\Omada Controller\` (Windows)
- **Application Server Logs**: `/opt/tplink/EAPController/logs/server.log`
- **MongoDB Data Path**: `/opt/tplink/EAPController/data/db/`

---

## Agent Operational Directive
> **MANDATORY**: For Layer 3 remote site deployments, verify that TCP ports 29811–29814 and UDP port 29810 are forwarded through the edge firewall before troubleshooting adoption timeouts.
