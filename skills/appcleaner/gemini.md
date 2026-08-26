---
title: "AppCleaner macOS Application Uninstaller AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot AppCleaner UI search results, file item checkboxes, and Protected Apps preferences."
category: "Complete Application Uninstaller"
tags: ["appcleaner", "macos", "file-checkboxes", "gemini", "protected-apps", "smartdelete-ui"]
---

# AppCleaner macOS Application Uninstaller AI Skill Guide (Gemini)

## Overview & Engine Architecture
AppCleaner provides an intuitive drag-and-drop macOS interface that visually catalogs and calculates the disk footprint of target applications and their associated preference/cache files. Gemini acts as an AI macOS Systems Auditor and Storage Optimization Reviewer, specializing in **multimodal AppCleaner UI result verification**, **residual file checkbox validation**, **SmartDelete popup notification diagnostics**, and **Protected Apps list integrity**.

### Visual Analytics & UI File Breakdown Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 AppCleaner Visual Diagnostics               │
│                                                             │
│  UI Presentation & File Hierarchy                           │
│  ├── Main Drop Zone (Drag & Drop .app Target Target Window) │
│  ├── Results Table (Size Breakdown, File Icon, Path Tree)   │
│  │    ├── [✓] Application Executable (`/Applications/...`)  │
│  │    ├── [✓] Plist Preference (`~/Library/Preferences/...`)│
│  │    └── [✓] Support Cache & Containers (`~/Library/...`)  │
│                                                             │
│  Protection & Background Services                           │
│  ├── Preferences $\rightarrow$ Protect default macOS apps   │
│  ├── Preferences $\rightarrow$ Protect running apps         │
│  └── SmartDelete Real-Time Trash Monitor HUD                │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Results Window Triage**: Analyze screenshots of AppCleaner's results list to ensure essential user documents, shared developer databases, or other applications' group containers are not inadvertently selected for deletion.
2. **Protected Applications Verification**: Audit AppCleaner preferences to ensure system-critical apps (Finder, Safari, System Settings) and user-pinned developer tools (VS Code, Docker, Homebrew) are protected from accidental removal.
3. **SmartDelete HUD Diagnostics**: Review system notification triggers to verify that moving an `.app` to Trash activates the SmartDelete prompt.
4. **Storage Footprint Reclaim Calculation**: Estimate disk space reclamation across SSD volumes by auditing large Application Support and Caches folders.

---

## Production Python Automation: Automated AppCleaner Preference Auditor (`.plist`)

Execute this script to verify that AppCleaner's safety preferences (protecting default macOS apps and running applications) are actively enabled:

```python
"""
AppCleaner macOS Preference Auditor
Reads and validates net.freemacsoft.AppCleaner.plist security parameters.
"""

import os
import plistlib

PREF_PATH = os.path.expanduser("~/Library/Preferences/net.freemacsoft.AppCleaner.plist")

def audit_appcleaner_preferences():
    if not os.path.exists(PREF_PATH):
        print(f"Error: AppCleaner preference file '{PREF_PATH}' not found.")
        print("Note: Launch AppCleaner at least once to generate default preferences.")
        return

    print("--- [AUDITING APPCLEANER SAFETY PREFERENCES] ---")
    try:
        with open(PREF_PATH, "rb") as f:
            prefs = plistlib.load(f)

        protect_default = prefs.get("ProtectDefaultApps", True)
        protect_running = prefs.get("ProtectRunningApps", True)
        smart_delete    = prefs.get("SmartDelete", False)

        print(f"• Protect Default macOS Apps: {'✅ ENABLED' if protect_default else '🚨 DISABLED'}")
        print(f"• Protect Running Apps:       {'✅ ENABLED' if protect_running else '🚨 DISABLED'}")
        print(f"• SmartDelete Trash Daemon:   {'✅ ENABLED' if smart_delete else '⚠️ DISABLED'}")

        if not protect_default or not protect_running:
            print("\nWARNING: Critical safety protections are disabled. Re-enable in AppCleaner Preferences.")

    except Exception as e:
        print(f"Error reading plist: {e}")

if __name__ == "__main__":
    audit_appcleaner_preferences()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **AppCleaner Cannot Find Hidden Files on Dropped App** | Target app stores data in a non-standard custom path not indexed by Spotlight metadata. | 1. In AppCleaner, switch to the **Applications** or **Widgets** tab.<br>2. Select the app manually to force a deep directory crawl.<br>3. Check Full Disk Access permissions in macOS System Settings. |
| **Protected Applications Greyed Out / Locked** | System Integrity Protection (SIP) protects read-only `/System/Applications/` on APFS Sealed System Snapshot. | This is expected macOS behavior; default system apps cannot be deleted. |
| **Checkboxes in Results Window Cannot Be Toggled** | Files are located on a read-only APFS volume or user lacks write permissions to `/Library/`. | Launch AppCleaner with elevated admin privileges or unlock the target folder in Finder. |
| **SmartDelete Shows Popup for Unrelated File Moves** | User deleted a `.dmg` or `.pkg` file whose installer cache matched an existing app name. | Click **Ignore** in the SmartDelete HUD dialog. |

---

## Command Line Syntax & Server Control

```bash
# Launch AppCleaner via macOS Terminal
open -a AppCleaner

# Inspect AppCleaner Preferences via defaults CLI
defaults read net.freemacsoft.AppCleaner
```

### Key Configuration Locations
- **Preferences Plist**: `~/Library/Preferences/net.freemacsoft.AppCleaner.plist`
- **Protected Apps List**: Encoded inside `net.freemacsoft.AppCleaner.plist`

---

## Agent Operational Directive
> **MANDATORY**: Verify that "Protect default macOS apps" and "Protect running apps" remain enabled in AppCleaner preferences before performing bulk uninstallation workflows to avoid system instability.
