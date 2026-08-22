---
title: "Sandboxie-Plus Application Isolation AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Sandboxie-Plus SandMan UI, Sandbox trees, Box Options security tabs, and Yellow [#] window indicators."
category: "Application Sandboxing & Isolation Engine"
tags: ["sandboxie-plus", "sandman-ui", "box-options-dialog", "gemini", "sandbox-tree", "yellow-brackets-hud"]
---

# Sandboxie-Plus Application Isolation AI Skill Guide (Gemini)

## Overview & Engine Architecture
Sandboxie-Plus provides an intuitive security and virtualization management console featuring the **SandMan Qt6 UI Dashboard**, **Live Sandbox Process Hierarchy Tree**, the **Box Options Security & Resource Configuration Dialog**, and visual container cues like the **Yellow `[#]` Title Bar Border Indicators**. Gemini acts as an AI Sandbox Security Reviewer and Application Isolation Specialist, specializing in **multimodal SandMan UI inspection**, **process isolation state verification**, **Resource Access policy auditing**, and **sandboxed window indicator diagnostics**.

### Visual Analytics & Isolation Console Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Sandboxie-Plus Visual Operations            │
│                                                             │
│  SandMan Management Console                                 │
│  ├── Sandbox Group & Box Tree (Running PIDs, Memory, CPU)   │
│  ├── Live Message Log (Driver Events, Security Denials)     │
│  └── Quick Action Toolbar (Terminate All, Empty Sandbox)    │
│                                                             │
│  Box Options Configuration Viewports                        │
│  ├── File & Registry Options (Direct / Write-Only Paths)    │
│  ├── Network Restrictions (Block Inbound/Outbound Traffic)  │
│  └── Security Hardening (AppContainer, Drop Admin Rights)   │
│                                                             │
│  Visual Sandboxing Indicators                               │
│  ├── Yellow Title Bar Brackets `[#] Application Name [#]`   │
│  └── Custom Color Window Border Highlighting (Red/Green/Blue│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal SandMan UI Inspection**: Analyze screenshots of the SandMan management console to identify active sandboxed processes, detect unhandled `SBIE` error popups, and evaluate memory utilization per sandbox container.
2. **Yellow Indicator Verification**: Confirm that sandboxed applications display the signature `[#]` brackets in the window title bar and colored border frame to guarantee isolation status.
3. **Resource Access Rule Auditing**: Review Box Options dialog tabs (*File Paths, Registry Paths, IPC Objects*) to ensure sensitive personal directories (`%USERPROFILE%\Documents`, `%APPDATA%`) are protected with Read-Only or Write-Restricted policies.
4. **Driver & Service Status Diagnostics**: Inspect the SandMan status bar to verify the `SbieDrv` kernel driver and `SbieSrv` service are running in active green status.

---

## Production Python Automation: Automated `Sandboxie.ini` Policy Configurator

Run this script to inspect and add a new security-hardened isolation box to `Sandboxie.ini`:

```python
"""
Sandboxie.ini Declarative Box Generator
Parses Sandboxie.ini and configures a secure sandbox profile with network and disk restrictions.
"""

import sys
import os
import configparser

def configure_secure_box(ini_path: str, box_name: str = "HardenedBox"):
    print(f"--- [CONFIGURING SECURE SANDBOX PROFILE: {box_name}] ---")

    if not os.path.exists(ini_path):
        print(f"Error: Sandboxie.ini not found at '{ini_path}'.")
        return

    # Use RawConfigParser to preserve casing and non-standard INI options
    config = configparser.RawConfigParser(strict=False)
    config.read(ini_path)

    if not config.has_section(box_name):
        config.add_section(box_name)
        print(f"• Created new sandbox section: [{box_name}]")

    # Configure Isolation Policies
    config.set(box_name, "Enabled", "y")
    config.set(box_name, "BoxType", "Enhanced")
    config.set(box_name, "BlockInternetAccess", "y")
    config.set(box_name, "DropAdminRights", "y")
    config.set(box_name, "AutoDelete", "y")
    config.set(box_name, "BorderColor", "#FF0000,on,6") # Red border 6px

    with open(ini_path, "w", encoding="utf-8") as f:
        config.write(f)

    print(f"✅ Sandbox profile [{box_name}] configured successfully.")
    print("Policies applied: BlockInternetAccess=y, DropAdminRights=y, AutoDelete=y, Red Border.")

if __name__ == "__main__":
    ini_file = sys.argv[1] if len(sys.argv) > 1 else r"C:\Program Files\Sandboxie-Plus\Sandboxie.ini"
    configure_secure_box(ini_file)
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Window Does Not Show Yellow `[#]` Brackets** | Application is running on the host system outside of Sandboxie containment. | Terminate process and relaunch explicitly via right-click $\rightarrow$ **Run Sandboxed**. |
| **SandMan Log Shows `SBIE1307 Program cannot access the Internet`** | Normal security block triggered by `BlockInternetAccess=y` policy. | If internet is required, open Box Options $\rightarrow$ **Network Options** $\rightarrow$ Check **Allow Internet Access**. |
| **Sandboxed App Windows Show Invisible / Transparent Text** | Hardware GPU acceleration conflict with Sandboxie window hooking. | In Box Options $\rightarrow$ Compatibility, enable **Open WinClass** or disable hardware acceleration inside the app. |
| **SandMan GUI Shows Driver Icon with Red Cross** | `SbieDrv` driver stopped or failed to load during Windows boot. | In SandMan, select *Maintenance $\rightarrow$ Driver $\rightarrow$ Start Driver*. |

---

## Command Line Syntax & Server Control

```bash
# Launch SandMan GUI
"C:\Program Files\Sandboxie-Plus\SandMan.exe"

# Query SbieDrv Kernel Driver Service Status via PowerShell
Get-Service -Name "SbieDrv"
```

### Key Configuration Locations
- **Configuration File**: `C:\Program Files\Sandboxie-Plus\Sandboxie.ini`
- **Sandbox Root Storage**: `C:\Sandbox\`

---

## Agent Operational Directive
> **MANDATORY**: Always look for the Yellow `[#]` title bar brackets and colored perimeter border to visually verify that an untrusted executable is executing under active Sandboxie isolation.
