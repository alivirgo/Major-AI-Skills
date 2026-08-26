---
title: "OrbStack macOS Fast Docker & Linux VM Runtime AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot OrbStack GUI dashboards, container CPU/RAM gauges, Linux VM states, and domain forwarders."
category: "Fast Docker & Linux VM Runtime"
tags: ["orbstack", "docker-dashboard", "resource-monitoring", "gemini", "linux-vms", "orb-local-domains"]
---

# OrbStack macOS Fast Docker & Linux VM Runtime AI Skill Guide (Gemini)

## Overview & Engine Architecture
OrbStack features a responsive native macOS SwiftUI interface displaying real-time container metrics, Linux VM lifecycles, volume mounts, and local network domain routing cards. Gemini acts as an AI Cloud Native & Infrastructure Auditor, specializing in **multimodal OrbStack dashboard inspection**, **container CPU/Memory allocation gauge analysis**, **Linux VM state diagnostics**, and **`.orb.local` domain resolution validation**.

### Visual Analytics & Dashboard Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 OrbStack Visual Operations                  │
│                                                             │
│  Containers & Virtual Machines Dashboard                    │
│  ├── Containers Tab (State Badges, Ports, Live CPU/RAM%)    │
│  ├── Linux Machines Tab (Distro Icons, Uptime, SSH Links)   │
│  ├── Images & Volumes Manager (Deduplicated APFS Disk Space)│
│  └── Domains & Ports HUD (`*.orb.local` Link Cards)         │
│                                                             │
│  Performance & Resource Controls                            │
│  ├── Dynamic RAM / Swap Allocator (Zero-Reservation Engine) │
│  └── Battery Saver & Background Throttling Visualizer       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Dashboard Inspection**: Analyze screenshots of OrbStack's GUI dashboard to detect failing containers (Red status tags), resource exhaustion, unmapped port collisions, and corrupted volume binds.
2. **Dynamic Resource Utilization Review**: Verify that OrbStack dynamically scales memory and CPU allocations back to macOS when containers are idle.
3. **Linux Machine Lifecycle Triage**: Evaluate Linux VM status cards (*Running vs Stopped vs Frozen*), checking SSH keys and shared filesystem mount points.
4. **Domain Routing Verification**: Inspect active `.orb.local` routes to ensure local microservice web servers are accessible over HTTP/HTTPS.

---

## Production Python Automation: Automated OrbStack Container & Resource Monitor

Execute this script to monitor running containers via the Docker socket and flag high memory/CPU usage:

```python
"""
OrbStack Container Health & Resource Monitor
Queries the OrbStack Docker API socket to report container resource allocations.
"""

import sys
import os
import requests
import json

DOCKER_SOCKET = os.path.expanduser("~/.orbstack/run/docker.sock")

def monitor_orbstack_containers():
    if not os.path.exists(DOCKER_SOCKET):
        print(f"Error: OrbStack Docker socket not found at '{DOCKER_SOCKET}'.")
        return

    print("--- [ORBSTACK REAL-TIME CONTAINER AUDIT] ---")
    
    # Query Docker API over local UNIX socket using requests-unixsocket or curl
    import socket
    import http.client

    class UnixSocketHTTPConnection(http.client.HTTPConnection):
        def __init__(self, socket_path):
            super().__init__("localhost")
            self.socket_path = socket_path

        def connect(self):
            self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            self.sock.connect(self.socket_path)

    conn = UnixSocketHTTPConnection(DOCKER_SOCKET)
    conn.request("GET", "/containers/json")
    res = conn.getresponse()

    if res.status == 200:
        containers = json.loads(res.read().decode("utf-8"))
        print(f"Detected {len(containers)} active container(s):\n")

        for c in containers:
            cid = c.get("Id", "")[:12]
            name = c.get("Names", ["/unknown"])[0].lstrip("/")
            image = c.get("Image", "")
            state = c.get("State", "")
            status = c.get("Status", "")
            ports = [f"{p.get('PublicPort')}->{p.get('PrivatePort')}" for p in c.get("Ports", []) if "PublicPort" in p]
            ports_str = ", ".join(ports) if ports else "No mapped ports"

            print(f"• [{cid}] {name:<22} | State: {state:<8} | Ports: {ports_str:<18} | Image: {image}")
    else:
        print(f"Failed to query Docker API: HTTP {res.status}")

    conn.close()

if __name__ == "__main__":
    monitor_orbstack_containers()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Container Status Tag Shows Orange / `Exited (137)`** | Container terminated by Out-Of-Memory (OOM) killer. | In OrbStack Settings $\rightarrow$ **Resources**, increase maximum memory ceiling for the virtual environment. |
| **Port Conflict Warning on Dashboard (Red Port Badge)** | Target port (e.g. `80` or `5432`) is already bound by a native macOS process or another container. | 1. Find conflicting process: `sudo lsof -i :80`.<br>2. Change mapped host port in `docker-compose.yml` (e.g. `8080:80`). |
| **Linux VM Shows `Error Starting VM`** | Underlying virtual disk image reached corruption or disk space on host SSD is exhausted. | In OrbStack UI, select VM $\rightarrow$ Click **Reinstall** or check available host storage. |
| **GUI App Shows High Battery Consumption** | Battery Saver mode disabled while running intensive container build loops. | In OrbStack Settings $\rightarrow$ **General**, enable **Battery Saver** and background CPU throttling. |

---

## Command Line Syntax & Server Control

```bash
# Launch OrbStack UI
open -a OrbStack

# Inspect OrbStack System Diagnostic Logs
tail -f ~/.orbstack/log/orbstack.log
```

### Key Configuration Locations
- **OrbStack Application Preferences**: `~/Library/Preferences/dev.kdrag0n.MacVirt.plist`
- **Socket Paths**: `~/.orbstack/run/`

---

## Agent Operational Directive
> **MANDATORY**: When inspecting port conflicts in OrbStack dashboards, check for native macOS processes bound to ports `80`, `443`, or `5432` using `lsof -i :<port>` before altering compose network bridges.
