---
title: "TP-Link Omada SDN Controller AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Omada Controller web dashboards, topology maps, Wi-Fi RF heatmaps, and Switch Port profiles."
category: "Enterprise SDN Network Controller"
tags: ["omada-controller", "network-dashboard", "topology-map", "gemini", "rf-heatmap", "switch-port-profiles"]
---

# TP-Link Omada SDN Controller AI Skill Guide (Gemini)

## Overview & Engine Architecture
Omada SDN Controller provides an enterprise web interface featuring real-time **Dashboard health widgets**, dynamic **Topology Maps (Gateway $\rightarrow$ Switch $\rightarrow$ EAP $\rightarrow$ Client)**, **Wi-Fi RF spectrum heatmaps**, and **JetStream Switch Port visual tables (PoE status, VLAN tags, link speeds)**. Gemini acts as an AI Enterprise Network Administrator and WLAN Engineer, specializing in **multimodal Omada dashboard inspection**, **network topology link validation**, **Wi-Fi co-channel interference & RF heatmap diagnostics**, and **switch port profile auditing**.

### Visual Analytics & SDN Management Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Omada Visual Operations Stack               │
│                                                             │
│  Network Health & Dashboard Viewports                       │
│  ├── Gateway / WAN Utilization (Multi-WAN Throughput Graph) │
│  ├── Switch Port Matrix (PoE Watts, 10G/1G Speed LED Colors)│
│  ├── Access Point Status Grid (Channel Utilization & Retries│
│  └── Connected Clients HUD (SSID, Band, Signal RSSI, IP)    │
│                                                             │
│  Topology, Floorplans & RF Heatmaps                         │
│  ├── Automated L2/L3 Network Topology Tree Visualization    │
│  ├── 2.4GHz / 5GHz / 6GHz Simulated RF Signal Coverage Map  │
│  └── Rogue AP & Channel Spectrum Analysis Graphs            │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Dashboard Health Triage**: Analyze screenshots of the Omada Controller overview dashboard to identify WAN failover states, high channel utilization ($>60\%$), excessive packet drop rates, and rogue AP alerts.
2. **Topology & Uplink Validation**: Verify that switch-to-switch and switch-to-AP uplinks are operating at expected link speeds ($10\text{G SFP+}$ or $2.5\text{G/1G RJ45}$) without STP (Spanning Tree) blocking loops.
3. **Wi-Fi RF Heatmap & Channel Planning**: Review 2.4GHz and 5GHz channel allocation grids to prevent overlapping adjacent channels (enforcing 2.4GHz channels 1, 6, 11 and non-DFS 5GHz channels).
4. **Switch Port Profile & PoE Budget Auditing**: Inspect visual switch faceplates, verifying that PoE wattages remain within total switch capacity and port VLAN profiles (Trunk vs Access) match connected endpoints.

---

## Production Python Automation: Automated Omada Wi-Fi Channel & RF Interference Auditor

Run this script to scan for co-channel interference and compute optimal Wi-Fi channel assignments across deployed access points:

```python
"""
Omada WLAN RF Channel & Co-Channel Interference Auditor
Analyzes access point channel assignments and flags overlapping frequency channels.
"""

import sys

# Sample AP Data extracted from Omada Controller API
SAMPLE_APS = [
    {"name": "EAP670_Lobby", "band_2g_ch": 1, "band_5g_ch": 36, "tx_power_2g": 20, "tx_power_5g": 25},
    {"name": "EAP670_Office1", "band_2g_ch": 1, "band_5g_ch": 36, "tx_power_2g": 20, "tx_power_5g": 25}, # Collision
    {"name": "EAP650_Cafeteria", "band_2g_ch": 6, "band_5g_ch": 44, "tx_power_2g": 14, "tx_power_5g": 22},
    {"name": "EAP650_Warehouse", "band_2g_ch": 11, "band_5g_ch": 149, "tx_power_2g": 17, "tx_power_5g": 24}
]

def audit_rf_plan(ap_list):
    print("--- [AUDITING OMADA WLAN RF FREQUENCY ALLOCATIONS] ---")
    
    ch_2g = {}
    ch_5g = {}

    for ap in ap_list:
        c2 = ap["band_2g_ch"]
        c5 = ap["band_5g_ch"]
        ch_2g.setdefault(c2, []).append(ap["name"])
        ch_5g.setdefault(c5, []).append(ap["name"])

    print("\n[2.4 GHz Frequency Band Analysis]")
    for ch, aps in ch_2g.items():
        status = "⚠️ CO-CHANNEL COLLISION" if len(aps) > 1 else "✅ CLEAR"
        print(f"• Channel {ch:>2}: {status:<24} | APs: {', '.join(aps)}")

    print("\n[5.0 GHz Frequency Band Analysis]")
    for ch, aps in ch_5g.items():
        status = "⚠️ CO-CHANNEL COLLISION" if len(aps) > 1 else "✅ CLEAR"
        print(f"• Channel {ch:>2}: {status:<24} | APs: {', '.join(aps)}")

    print("\n💡 Recommendation: Re-assign adjacent APs to non-overlapping channels (1, 6, 11 on 2.4GHz; 36, 44, 149, 157 on 5GHz).")

if __name__ == "__main__":
    audit_rf_plan(SAMPLE_APS)
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Topology Map Shows Red Broken Link Icon** | Uplink port on switch disabled by STP loop protection or VLAN misconfiguration. | 1. In Switch settings $\rightarrow$ Ports $\rightarrow$ Check **STP Status**.<br>2. Ensure uplink port profile is set to **All** (Trunk) with native VLAN 1. |
| **Switch Faceplate Shows Flashing Amber PoE LED** | Connected PoE device (e.g. PTZ Camera / Wi-Fi 7 AP) exceeded port PoE power limit. | In Switch Settings $\rightarrow$ Check total PoE Budget watt consumption $\rightarrow$ Set port PoE priority to High. |
| **Wi-Fi Clients Show Low RSSI ($-85\text{dBm}$) Next to AP** | Client connected to distant AP due to aggressive "sticky client" behavior. | In EAP Settings $\rightarrow$ Advanced $\rightarrow$ Enable **RSSI Threshold** (e.g. kick clients with RSSI $<-75\text{dBm}$). |
| **Dashboard WAN Status Flashes Yellow** | Multi-WAN gateway detected high packet loss on primary ISP line and triggered failover. | In Gateway Settings $\rightarrow$ Multi-WAN, verify WAN health check IP (change DNS ping target to `8.8.8.8`). |

---

## Command Line Syntax & Server Control

```bash
# Launch Omada Web Management Portal in Browser
open "https://localhost:8043"

# Query Controller Service Status on Linux Host
systemctl status tpeap.service
```

### Key Configuration Locations
- **Controller Web Interface**: `https://<ip>:8043`
- **Application Logs**: `/opt/tplink/EAPController/logs/`

---

## Agent Operational Directive
> **MANDATORY**: When reviewing Omada Wi-Fi deployments, enforce the use of non-overlapping channels (1, 6, 11 for 2.4GHz) and configure RSSI thresholds ($-75\text{dBm}$) to eliminate sticky-client roaming degradation.
