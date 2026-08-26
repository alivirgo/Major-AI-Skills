---
title: "Sniffnet Network Traffic Monitor AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, configure, and troubleshoot Sniffnet network traffic charts, protocol breakdowns, and ASN geolocation."
category: "Cross-Platform Network Traffic Monitor"
tags: ["sniffnet", "network-monitoring", "gemini", "traffic-graphs", "protocol-analysis", "asn-lookup"]
---

# Sniffnet Network Traffic Monitor AI Skill Guide (Gemini)

## Overview & Engine Architecture
Sniffnet provides real-time, zero-copy network traffic monitoring with intuitive graphical visualizations across network adapters. Gemini acts as an AI Network Traffic Analyst and Security Auditor, specializing in **multimodal bandwidth graph analysis**, **protocol distribution diagnostics (TCP, UDP, ICMP, DNS, TLS)**, **suspicious ASN / country traffic triage**, and **network anomaly detection**.

### Visual Analytics & Packet Aggregation Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Sniffnet Visual Processing Stack            │
│                                                             │
│  Traffic Aggregation Layer                                  │
│  ├── Per-Host IP & Port Flow Tracker (Bytes/sec, Pkts/sec)  │
│  ├── Transport Protocol Breakdown (TCP vs UDP vs QUIC)      │
│  └── ASN (Autonomous System Number) & Geolocation Mapping   │
│                                                             │
│  Visualization & Notification Engine                        │
│  ├── Real-Time Vector Bandwidth Waveform Visualizer         │
│  ├── Application Protocol Identification (HTTP, SSH, NTP)   │
│  └── Visual & Audio Event Notification System               │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Traffic Chart Interpretation**: Analyze screenshots of Sniffnet real-time bandwidth charts to detect abnormal traffic bursts, sustained background uploads, and micro-burst packet floods.
2. **Protocol & Port Distribution Auditing**: Inspect protocol breakdown pies to identify unexpected non-standard port traffic (*e.g. UDP traffic on port 4444 or plain HTTP on external IPs*).
3. **Country & ASN Geolocation Triage**: Verify external remote IP addresses against legitimate CDN providers (Cloudflare, Fastly, AWS CloudFront) vs suspicious geographic destinations.
4. **Adapter Selection Diagnostics**: Guide users to select the correct physical adapter (Wi-Fi, Ethernet, Tailscale/VPN virtual tunnel adapter).

---

## Production Python Automation: Automated Port Scan & Traffic Detector

Run this script to monitor local network sockets and detect unexpected outbound network connections in real-time:

```python
"""
Real-Time Network Socket & Connection Auditor
Monitors active TCP/UDP connections and resolves remote hostnames.
"""

import socket
import psutil
import time

def audit_active_connections():
    print(f"{'PID':<8} {'Process Name':<20} {'Local Address':<22} {'Remote Address':<22} {'Status':<12}")
    print("=" * 88)

    connections = psutil.net_connections(kind="inet")
    for conn in connections:
        if conn.status == psutil.CONN_ESTABLISHED:
            pid = conn.pid or "-"
            pname = "-"
            if conn.pid:
                try:
                    pname = psutil.Process(conn.pid).name()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pname = "System/Protected"

            l_addr = f"{conn.laddr.ip}:{conn.laddr.port}"
            r_addr = f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "-"
            
            print(f"{str(pid):<8} {pname[:18]:<20} {l_addr:<22} {r_addr:<22} {conn.status:<12}")

if __name__ == "__main__":
    audit_active_connections()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Bandwidth Graph Flatlines at 0 KB/s** | Selected network interface is inactive, or traffic is routed through an unselected VPN/WireGuard tunnel. | 1. In Sniffnet Settings, switch adapter dropdown to the active interface (e.g. `eth0` / `wlan0` / `utun3`).<br>2. Look for the interface showing active IP addresses. |
| **Spike in UDP Port 443 Traffic (QUIC / HTTP/3)** | Modern web browsers utilizing HTTP/3 over UDP rather than standard TCP TLS. | 1. Confirm traffic is destined for known CDN ASNs (Google, Cloudflare).<br>2. This is expected modern web behavior (HTTP/3 / QUIC protocol). |
| **High Background Data Usage When Idle** | Background cloud sync daemons (OneDrive, Dropbox, Steam) or OS telemetry. | 1. Filter Sniffnet view by highest bytes transferred.<br>2. Inspect remote host domain names.<br>3. Terminate or pause background synchronization services. |
| **Sniffnet App Window Renders with Graphical Glitches** | Iced GUI / WGPU graphics driver incompatibility with local GPU hardware acceleration. | Launch with software rendering fallback: `WGPU_BACKEND=gl sniffnet` or update graphics drivers. |

---

## Command Line Syntax & Configuration

```bash
# Launch Sniffnet with Explicit OpenGL Graphics Backend
WGPU_BACKEND=gl sniffnet

# List Active Network Adapters via PowerShell
Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, LinkSpeed
```

### Essential File Locations
- **Windows User Settings**: `%APPDATA%\sniffnet`
- **Linux Configuration**: `~/.config/sniffnet/`
- **macOS Preferences**: `~/Library/Application Support/sniffnet`

---

## Agent Operational Directive
> **MANDATORY**: When diagnosing flatlined network graphs in Sniffnet, verify whether the user has active VPN/Tailscale tunnels and instruct them to select the corresponding virtual tunnel adapter in the interface dropdown.
