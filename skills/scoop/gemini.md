---
title: "Scoop Windows Package Manager AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Scoop CLI output tables, package health diagnostics (scoop checkup), bucket trees, and shim directory structures."
category: "Command-Line Package Manager"
tags: ["scoop", "scoop-checkup", "terminal-tables-ui", "gemini", "shim-inspection", "bucket-management"]
---

# Scoop Windows Package Manager AI Skill Guide (Gemini)

## Overview & Engine Architecture
Scoop provides a clean, user-friendly terminal interface featuring **Formatted CLI Output Tables (`scoop list`, `scoop status`)**, the **`scoop checkup` System Health Diagnostic Engine**, structured **User-Space File Trees (`~/scoop/apps/`)**, and the **Shim Link Directory (`~/scoop/shims/`)**. Gemini acts as an AI Windows Systems Reviewer and Package Manager Auditor, specializing in **multimodal terminal output inspection**, **package upgrade health audits**, **broken shim link diagnostics**, and **storage footprint optimization**.

### Visual Analytics & Package Management Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Scoop Visual Operations                     │
│                                                             │
│  CLI Presentation & Terminal Tables                         │
│  ├── `scoop list` Table (Name, Version, Source, Updated)    │
│  ├── `scoop status` Table (Current vs Available Versions)   │
│  └── `scoop search` (Multi-Bucket Matched Query Results)    │
│                                                             │
│  System Health & Diagnostic Engine                          │
│  ├── `scoop checkup` HUD (ExecutionPolicy, PATH, 7-Zip)     │
│  ├── Git Bucket Branch Status & Upstream Commit Stream      │
│  └── Download Cache & Outdated Artifact Cleaners            │
│                                                             │
│  Filesystem Hierarchy & Shims                               │
│  ├── `~/scoop/apps/<app>/current/` (Symlinked Active Version│
│  └── `~/scoop/shims/` (Batch Wrappers & GUI Shim Binaries)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Terminal Table Inspection**: Analyze screenshots of `scoop status` and `scoop list` outputs to identify held packages (`scoop hold`), version drift, and unlinked applications.
2. **`scoop checkup` Diagnostic Triage**: Review `scoop checkup` warnings (*e.g. missing Windows Defender exclusion for Scoop root, missing Windows long path support, or absent 7-Zip helper*).
3. **Storage Footprint & Cache Optimization**: Guide users in running `scoop cleanup *` and `scoop cache rm *` to reclaim tens of gigabytes of deprecated package versions and downloaded archives.
4. **Shim Integrity Verification**: Review the `~/scoop/shims` directory to ensure that both command-line (`.shim`) and GUI (`.exe`) shims correctly point to active `current` symlinks.

---

## Production Python Automation: Automated Scoop Package Storage & Health Auditor

Run this script to inspect disk space consumed by installed Scoop applications, old versions, and cached installers:

```python
"""
Scoop Disk Space & Package Health Auditor
Calculates storage consumed by active apps vs outdated versions vs download cache.
"""

import sys
import os

SCOOP_ROOT = os.path.expandvars(r"%USERPROFILE%\scoop")

def audit_scoop_storage(scoop_dir: str = SCOOP_ROOT):
    if not os.path.exists(scoop_dir):
        print(f"Error: Scoop directory not found at '{scoop_dir}'.")
        return

    print(f"--- [AUDITING SCOOP STORAGE FOOTPRINT: {scoop_dir}] ---")

    def get_dir_size(path):
        total = 0
        if not os.path.exists(path):
            return 0
        for root, dirs, files in os.walk(path):
            for f in files:
                try:
                    total += os.path.getsize(os.path.join(root, f))
                except Exception:
                    continue
        return total

    apps_dir = os.path.join(scoop_dir, "apps")
    cache_dir = os.path.join(scoop_dir, "cache")
    buckets_dir = os.path.join(scoop_dir, "buckets")
    persist_dir = os.path.join(scoop_dir, "persist")

    apps_size = get_dir_size(apps_dir)
    cache_size = get_dir_size(cache_dir)
    buckets_size = get_dir_size(buckets_dir)
    persist_size = get_dir_size(persist_dir)
    total_size = apps_size + cache_size + buckets_size + persist_size

    def to_mb(b):
        return b / (1024 * 1024)

    print(f"• Total Scoop Storage:  {to_mb(total_size):>8.2f} MB")
    print(f"• Installed Apps:       {to_mb(apps_size):>8.2f} MB")
    print(f"• Download Cache:       {to_mb(cache_size):>8.2f} MB")
    print(f"• Git Buckets Metadata: {to_mb(buckets_size):>8.2f} MB")
    print(f"• Persisted User Data:  {to_mb(persist_size):>8.2f} MB\n")

    if cache_size > (500 * 1024 * 1024):
        print("💡 Recommendation: Run 'scoop cache rm *' to reclaim cached installer space.")
    if os.path.exists(apps_dir):
        app_names = [d for d in os.listdir(apps_dir) if os.path.isdir(os.path.join(apps_dir, d))]
        print(f"Currently managing {len(app_names)} installed package(s).")

    print("\n✅ Scoop storage audit completed successfully.")

if __name__ == "__main__":
    audit_scoop_storage()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`scoop checkup` Warns: "Windows Defender might slow down Scoop"** | Windows Defender Real-Time Protection scanning extracted binary folders during install. | Add Scoop folder exclusion in elevated PowerShell:<br>`Add-MpPreference -ExclusionPath "$env:USERPROFILE\scoop"`. |
| **`scoop list` Shows Red Asterisk Next to Version** | Package is outdated and a newer version is available in the bucket. | Run `scoop update <app_name>` or `scoop update *`. |
| **Installed Command Returns "Target not found"** | `current` symlink inside `~/scoop/apps/<app>/` broken after incomplete update. | Re-generate symlink and shims: `scoop reset <app_name>`. |
| **`scoop search` Shows No Results from Community** | Required bucket (e.g. `extras`, `nerd-fonts`) not added to local Scoop installation. | Add bucket: `scoop bucket add extras` $\rightarrow$ `scoop update`. |

---

## Command Line Syntax & Server Control

```powershell
# Run Scoop Diagnostics Health Check
scoop checkup

# List All Installed Packages with Versions
scoop list
```

### Key Configuration Locations
- **Apps Root**: `%USERPROFILE%\scoop\apps\`
- **Download Cache**: `%USERPROFILE%\scoop\cache\`

---

## Agent Operational Directive
> **MANDATORY**: When `scoop checkup` flags Windows Defender performance warnings, recommend adding `$env:USERPROFILE\scoop` to Windows Defender exclusions to prevent installation lockups.
