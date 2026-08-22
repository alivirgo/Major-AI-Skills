---
title: "TP-Link Omada SDN Controller AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize TP-Link Omada Controller, REST OpenAPI, Terraform/Ansible pipelines, and Dockerized SDN deployments."
category: "Enterprise SDN Network Controller"
tags: ["omada-controller", "omada-openapi", "ansible-omada", "docker-omada", "gpt-codex", "network-automation"]
---

# TP-Link Omada SDN Controller AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
TP-Link Omada SDN Controller provides scriptable REST OpenAPI endpoints allowing complete programmatic lifecycle management of sites, SSIDs, 802.1Q VLANs, firewall rules, and device firmware. GPT/Codex acts as a Principal Network DevOps Engineer and Infrastructure as Code (IaC) Developer, delivering **automated Omada REST OpenAPI scripts**, **Ansible network provisioning playbooks**, **Dockerized controller deployment recipes (`docker-compose.yml`)**, and **bulk configuration deployers**.

### Developer Architecture & SDN Orchestration Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Omada Developer Platform                    │
│                                                             │
│  API Ingress & Automation Subsystem                         │
│  ├── Authenticated REST OpenAPI (`/api/v2/login`, Tokens)   │
│  ├── Site Operations (`/api/v2/sites/{siteId}/...`)         │
│  └── Automated Configuration Injectors (SSIDs, VLANs, ACLs) │
│                                                             │
│  Infrastructure as Code & Container Engine                  │
│  ├── Docker Container Architecture (`mbentley/omada-controller`)│
│  ├── Ansible Playbooks (Automated Site Bootstrap)           │
│  └── Automated Firmware Upgrade & Backup Orchestrators      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **REST OpenAPI Automation**: Build comprehensive Python and TypeScript scripts authenticating with Omada Controller, maintaining CSRF token state, and managing network entities.
2. **Automated SSID & Wireless Network Provisioning**: Script programmatic creation of WPA3 Enterprise / WPA2 Personal SSIDs with rate-limiting, VLAN tagging, and scheduler rules.
3. **Dockerized Controller Deployment**: Author hardened `docker-compose.yml` configurations with persistent volume mounts, host networking, and automated backup cron jobs.
4. **Automated Site Backup & Migration**: Script routines to export daily encrypted `.tar.gz` controller backup archives to cloud object storage.

---

## Production Python Automation: Automated Omada Wireless Network (SSID) Deployer

Save this script as `deploy_omada_ssid.py` to programmatically provision a new wireless network across all EAPs in a site:

```python
"""
Omada SDN Controller: Automated Wireless Network (SSID) Deployer
Authenticates with the OpenAPI and provisions a secured WPA2/WPA3 SSID with VLAN tagging.
"""

import sys
import requests
import json
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

CONTROLLER_URL = "https://192.168.1.50:8043"
USERNAME = "admin"
PASSWORD = "SecretPassword123"

def provision_wireless_network(ssid_name: str, psk_passphrase: str, vlan_id: int = 10, site_id: str = "Default"):
    print(f"--- [PROVISIONING WIRELESS NETWORK ON OMADA CONTROLLER] ---")
    session = requests.Session()
    session.verify = False

    # 1. Authenticate
    login_url = f"{CONTROLLER_URL}/api/v2/login"
    login_res = session.post(login_url, json={"name": USERNAME, "password": PASSWORD})
    
    if login_res.status_code != 200 or login_res.json().get("errorCode") != 0:
        print(f"Authentication failed: {login_res.text}")
        return

    token = login_res.json().get("result", {}).get("token")
    session.headers.update({"Csrf-Token": token})
    print("✅ Successfully authenticated.")

    # 2. Build SSID Creation Payload
    ssid_payload = {
        "name": ssid_name,
        "wlanBand": 3, # 1 = 2.4G, 2 = 5G, 3 = Both
        "security": 3, # WPA/WPA2/WPA3 Personal
        "securityKey": psk_passphrase,
        "vlanEnable": True if vlan_id > 1 else False,
        "vlanId": vlan_id,
        "broadcast": True,
        "guestNetEnable": False
    }

    # 3. Dispatch POST Request
    create_url = f"{CONTROLLER_URL}/api/v2/sites/{site_id}/setting/wlans"
    res = session.post(create_url, json=ssid_payload)

    if res.status_code == 200 and res.json().get("errorCode") == 0:
        print(f"✅ Successfully provisioned SSID '{ssid_name}' (VLAN: {vlan_id}) across site '{site_id}'!")
    else:
        print(f"🚨 Failed to create SSID: {res.text}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 deploy_omada_ssid.py <SSID_Name> <Password> [VLAN_ID]")
        sys.exit(1)

    vlan = int(sys.argv[3]) if len(sys.argv) > 3 else 10
    provision_wireless_network(sys.argv[1], sys.argv[2], vlan)
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **API Returns `ErrorCode: -1005 (Token Expired)`** | The session `Csrf-Token` expired after idle timeout. | Re-invoke `/api/v2/login` to obtain a fresh token and re-populate the `Csrf-Token` header. |
| **Dockerized Controller Cannot Adopt Devices** | Container is running with bridge networking rather than host networking mode. | In `docker-compose.yml`, set `network_mode: "host"` so southbound UDP 29810 broadcasts reach the container. |
| **SSID Created via API Does Not Transmit on EAPs** | WLAN group not attached or EAP radios disabled in site settings. | In Controller Settings $\rightarrow$ Wireless Settings $\rightarrow$ WLAN Groups, ensure EAPs are assigned to default group. |
| **Backup Export API Fails with ErrorCode -39000** | Disk storage volume mounting `/opt/tplink/EAPController/data` is full ($100\%$ capacity). | Purge historical client logs or expand Docker persistent volume storage. |

---

## Command Line Syntax & Docker Deployment

```yaml
# docker-compose.yml: Production Omada SDN Controller Deployment
version: "3.8"
services:
  omada-controller:
    image: mbentley/omada-controller:5.14
    container_name: omada-controller
    restart: unless-stopped
    network_mode: host
    environment:
      - TZ=UTC
      - MANAGE_HTTP_PORT=8088
      - MANAGE_HTTPS_PORT=8043
      - PORTAL_HTTP_PORT=8088
      - PORTAL_HTTPS_PORT=8843
      - SHOW_SERVER_LOGS=true
      - SHOW_MONGODB_LOGS=false
    volumes:
      - ./omada-data:/opt/tplink/EAPController/data
      - ./omada-work:/opt/tplink/EAPController/work
      - ./omada-logs:/opt/tplink/EAPController/logs
```

### Essential File Locations
- **Docker Compose File**: `docker-compose.yml`
- **Persistent Data Volume**: `./omada-data/`

---

## Agent Operational Directive
> **MANDATORY**: When deploying Omada SDN Controller inside Docker containers, always use `network_mode: host` to allow southbound Layer 2 UDP 29810 device discovery broadcasts to function correctly.
