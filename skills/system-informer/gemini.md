---
title: "System Informer Kernel & Process Diagnostics AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot System Informer process trees, color-coded process states, System Information performance HUDs, and Network connection grids."
category: "Advanced Kernel, Process & Network Inspection"
tags: ["system-informer", "process-tree-ui", "color-coded-processes", "gemini", "system-information-hud", "network-socket-table"]
---

# System Informer Kernel & Process Diagnostics AI Skill Guide (Gemini)

## Overview & Engine Architecture
System Informer provides a deep diagnostic interface featuring the **Hierarchical Process Tree with Color-Coded State Highlighting**, **System Information Multi-Graph Performance HUD (CPU, Memory Commit, GPU, Disk, Network)**, **Real-Time Network Socket Grid**, and the **Process Properties Diagnostic Suite (Threads, Handles, Memory Regions, Modules, Environment)**. Gemini acts as an AI Windows Systems Performance Auditor and Malware Triage Reviewer, specializing in **multimodal Process Tree hierarchy inspection**, **suspicious process injection detection**, **locked handle identification**, and **network connection mapping**.

### Visual Analytics & Kernel Diagnostics Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 System Informer Visual Operations           │
│                                                             │
│  Process Tree & State Color Matrix                          │
│  ├── Color Highlights (Yellow=.NET, Blue=Suspended, Red=Term│
│  ├── Process Parent-Child Hierarchy (Orphaned Process Audit)│
│  └── Verified Signer Badges (Microsoft Corporation / Untrust│
│                                                             │
│  Diagnostic Windows & Telemetry                             │
│  ├── System Information HUD (`Ctrl + I` Multi-Graph Dashboard│
│  ├── Network Tab (Local/Remote IP, Port, State, Geo-IP)     │
│  └── Disk Tab (Per-Process Read/Write Transfer Rates)       │
│                                                             │
│  Process Properties & Memory Inspector                      │
│  ├── Handles Search Tool (`Ctrl + F` File/Mutant/Section)   │
│  └── Virtual Memory Map (Page Permissions: `PAGE_EXECUTE_RW│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Process Tree Inspection**: Analyze screenshots of the System Informer process tree to evaluate parent-child relationships (*e.g. identifying anomalous spawns like `svchost.exe` without `services.exe` parent*).
2. **Color-Coded State Disambiguation**: Review process highlight colors to quickly triage system states:
  - *Yellow*: .NET Managed Runtime Process
  - *Cyan*: Windows Store (AppX / UWP) Package
  - *Blue / Light Blue*: Suspended Process or Debugged Process
  - *Green*: Newly Spawned Process
  - *Red*: Terminating / Exiting Process
3. **Suspicious Virtual Memory Analysis**: Review Process Properties $\rightarrow$ Memory tab to detect anomalous `PAGE_EXECUTE_READWRITE` (RWX) allocations characteristic of code injection.
4. **Locked File & Handle Search Triage**: Guide users through the `Find Handles or DLLs` window (`Ctrl + F`) to identify which application is holding exclusive file locks on locked volumes.

---

## Production Python Automation: Automated Network Socket & Port-to-PID Auditor

Run this script to inspect active listening network sockets, foreign endpoints, and owning process names without opening the GUI:

```python
"""
Windows Network Socket & Process Port Auditor (psutil)
Enumerates all active TCP/UDP connections and maps remote IP endpoints to local processes.
"""

import sys
import psutil

def audit_network_sockets():
    print("--- [AUDITING ACTIVE WINDOWS NETWORK CONNECTIONS] ---")

    connections = psutil.net_connections(kind="inet")
    print(f"Discovered {len(connections)} active network socket(s):\n")

    print(f"{'Proto':<6} | {'Local Address':<22} | {'Remote Address':<22} | {'State':<12} | {'PID':>6} | {'Process Name'}")
    print("-" * 95)

    for conn in connections[:20]: # Display top 20 connections
        proto = "TCP" if conn.type == 1 else "UDP"
        laddr = f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "None"
        raddr = f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "*:*"
        state = conn.status if conn.status else "NONE"
        pid = conn.pid if conn.pid else 0

        proc_name = "System / Idle"
        if pid:
            try:
                proc_name = psutil.Process(pid).name()
            except Exception:
                proc_name = "Unknown"

        print(f"{proto:<6} | {laddr:<22} | {raddr:<22} | {state:<12} | {pid:>6} | {proc_name}")

    print("\n✅ Network socket audit completed.")

if __name__ == "__main__":
    audit_network_sockets()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Process Highlighted in Dark Red Flashes Continuously** | A process is crashing and respawning rapidly in a crash loop. | Select the process $\rightarrow$ Open **Properties** $\rightarrow$ Check **Log** and parent executable arguments. |
| **Memory Region Shows `RWX` (Execute-Read-Write)** | Memory page allocated with execute permissions, potential DLL injection or JIT compiler. | Right-click memory block $\rightarrow$ Select **Read Memory** to inspect byte strings or disassemble code. |
| **Process Tree Shows Orphaned Windows Service** | `services.exe` crashed or service was manually spawned from a standalone command prompt. | Inspect process token in Properties $\rightarrow$ **Token** tab to verify `NT AUTHORITY\SYSTEM` SID. |
| **Network Tab Does Not Show Process Names** | Connection originated from a terminated ephemeral process or raw kernel driver socket. | Enable **Highlight Network Connections** in System Informer view settings. |

---

## Command Line Syntax & Server Control

```bash
# Launch System Informer directly
"C:\Program Files\SystemInformer\SystemInformer.exe"

# Open System Information Performance Charts
"C:\Program Files\SystemInformer\SystemInformer.exe" -c -sysinfo
```

### Key Configuration Locations
- **Settings Store**: `%APPDATA%\SystemInformer\settings.xml`
- **Plugin Manifests**: `C:\Program Files\SystemInformer\plugins\`

---

## Agent Operational Directive
> **MANDATORY**: When auditing suspicious processes in System Informer, always verify the Digital Signer status in Process Properties and check for anomalous `PAGE_EXECUTE_READWRITE` memory allocations.
