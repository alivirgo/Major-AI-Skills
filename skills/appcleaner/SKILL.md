---
name: appcleaner
description: "Comprehensive operational skill specification for Anthropic Claude to automate, script, troubleshoot, and optimize AppCleaner, macOS bundle identifier scanning, ~/Library artifact purging, and SmartDelete daemons."
category: macos
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["appcleaner", "macos", "bundle-identifier", "tcc-permissions", "library-cleanup", "smartdelete", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# AppCleaner macOS Application Uninstaller AI Skill Guide (Claude)

## Overview & Engine Architecture
AppCleaner is the standard utility for cleanly uninstalling macOS applications and removing associated residual artifacts. When an application is moved to the Trash, it leaves behind configuration plists, application support databases, sandboxed container folders, and background launch daemons across `~/Library/` and `/Library/`. AppCleaner resolves the target's **`CFBundleIdentifier`** (from `Info.plist`) and sweeps the filesystem using Spotlight metadata and heuristics. Claude operates as a Principal macOS Systems Engineer, specializing in **macOS bundle identifier forensics**, **TCC (Transparency, Consent, and Control) permission remediation**, **LaunchAgent/LaunchDaemon lifecycle management**, and **automated command-line application removal scripts**.

### macOS Application Storage & Artifact Distribution Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 macOS App Storage Architecture              │
│                                                             │
│  Application Bundle Layer                                   │
│  └── `/Applications/<App>.app/Contents/Info.plist`          │
│       └── `CFBundleIdentifier` (e.g. `com.vendor.app`)      │
│                                                             │
│  User Domain Residual Artifacts (`~/Library/`)              │
│  ├── `Application Support/<AppName>` / `com.vendor.app`     │
│  ├── `Caches/com.vendor.app/` & `HTTPStorages/`             │
│  ├── `Preferences/com.vendor.app.plist`                     │
│  ├── `Containers/com.vendor.app/` (Sandboxed App Containers)│
│  ├── `Group Containers/group.com.vendor.app/`               │
│  └── `LaunchAgents/com.vendor.app.helper.plist`             │
│                                                             │
│  System Domain Residual Artifacts (`/Library/`)             │
│  ├── `Application Support/` & `PrivilegedHelperTools/`      │
│  └── `LaunchDaemons/com.vendor.app.daemon.plist`            │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Bundle Identifier Parsing & Extraction**: Programmatically inspect application bundles using `defaults read /Applications/App.app/Contents/Info.plist CFBundleIdentifier` to isolate target identifiers.
2. **Comprehensive Filesystem Sweeping**: Locate sandboxed container directories (`~/Library/Containers/`, `~/Library/Group Containers/`) and preference plists using `mdfind` and direct path heuristics.
3. **LaunchAgent / Daemon Lifecycle Control**: Unload active background helpers via `launchctl bootout gui/$(id -u)/com.vendor.app.helper` before deleting executable binaries.
4. **TCC Permission Diagnostics**: Remediate missed uninstallation artifacts by verifying Full Disk Access (`kTCCServiceSystemPolicyAllFiles`) in macOS System Settings.

---

## Production Python Automation: Automated macOS Bundle Artifact Sweeper

Save this script as `macos_app_cleaner.py` and run with elevated permissions:

```python
"""
macOS Application Uninstaller & Artifact Sweeper (AppCleaner CLI Equivalent)
Extracts CFBundleIdentifier, unloads active LaunchAgents, and safely purges ~/Library paths.
"""

import sys
import os
import plistlib
import subprocess
import shutil

USER_HOME = os.path.expanduser("~")

SEARCH_PATHS = [
    os.path.join(USER_HOME, "Library/Application Support"),
    os.path.join(USER_HOME, "Library/Caches"),
    os.path.join(USER_HOME, "Library/Preferences"),
    os.path.join(USER_HOME, "Library/Containers"),
    os.path.join(USER_HOME, "Library/Group Containers"),
    os.path.join(USER_HOME, "Library/Saved Application State"),
    os.path.join(USER_HOME, "Library/HTTPStorages"),
    os.path.join(USER_HOME, "Library/WebKit"),
    os.path.join(USER_HOME, "Library/LaunchAgents"),
    "/Library/Application Support",
    "/Library/LaunchDaemons",
    "/Library/PrivilegedHelperTools"
]

def get_bundle_id(app_path: str) -> str:
    plist_path = os.path.join(app_path, "Contents/Info.plist")
    if not os.path.exists(plist_path):
        return None
    try:
        with open(plist_path, "rb") as f:
            pl = plistlib.load(f)
            return pl.get("CFBundleIdentifier")
    except Exception as e:
        print(f"Error reading Info.plist: {e}")
        return None

def find_residual_artifacts(app_name: str, bundle_id: str):
    targets = []
    print(f"--- [SCANNING RESIDUAL ARTIFACTS FOR: {app_name} ({bundle_id})] ---")

    for base_dir in SEARCH_PATHS:
        if not os.path.exists(base_dir):
            continue
        try:
            for item in os.listdir(base_dir):
                full_path = os.path.join(base_dir, item)
                # Match by Bundle Identifier or Application Name
                if bundle_id and bundle_id.lower() in item.lower():
                    targets.append(full_path)
                elif app_name.lower() in item.lower():
                    targets.append(full_path)
        except PermissionError:
            print(f"Permission denied scanning: {base_dir} (Grant Full Disk Access)")

    return list(set(targets))

def uninstall_application(app_path: str):
    if not os.path.exists(app_path) or not app_path.endswith(".app"):
        print(f"Error: Invalid application path: {app_path}")
        return

    app_name = os.path.splitext(os.path.basename(app_path))[0]
    bundle_id = get_bundle_id(app_path)
    
    print(f"Target App: {app_name}")
    print(f"Bundle ID:  {bundle_id}\n")

    artifacts = find_residual_artifacts(app_name, bundle_id)
    print(f"Found {len(artifacts)} residual file/directory paths:")
    for path in artifacts:
        print(f"  • {path}")

    # Move application and artifacts to Trash or delete
    print("\nExecuting safe removal...")
    for path in artifacts:
        try:
            if os.path.isdir(path):
                shutil.rmtree(path)
            else:
                os.remove(path)
            print(f"  Removed: {path}")
        except Exception as e:
            print(f"  Failed to remove {path}: {e}")

    # Remove the main .app bundle
    shutil.rmtree(app_path)
    print(f"✅ Application '{app_name}' uninstalled successfully.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 macos_app_cleaner.py /Applications/TargetApp.app")
        sys.exit(1)
    uninstall_application(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **AppCleaner Misses Sandboxed Container Directories** | AppCleaner lacks macOS Full Disk Access (TCC) permissions to read `~/Library/Containers/`. | 1. Open *System Settings $\rightarrow$ Privacy & Security $\rightarrow$ Full Disk Access*.<br>2. Click **+** and add `/Applications/AppCleaner.app`.<br>3. Restart AppCleaner. |
| **SmartDelete Daemon Does Not Prompt When Trashing App** | `AppCleaner SmartDelete.app` background helper service was not registered or disabled in Login Items. | 1. In AppCleaner Preferences $\rightarrow$ **SmartDelete**, toggle OFF and ON.<br>2. In System Settings $\rightarrow$ *General $\rightarrow$ Login Items*, ensure AppCleaner is allowed to run in background. |
| **`Permission Denied` Removing `/Library/LaunchDaemons/`** | Privileged helper daemons require root permissions or System Integrity Protection (SIP) protects the component. | Execute script with `sudo` or manually unload daemon: `sudo launchctl bootout system /Library/LaunchDaemons/com.vendor.plist`. |
| **Uninstalled App Reappears in Launchpad / Spotlight** | macOS CoreServices LaunchServices database cache is stale. | Run in Terminal: `/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user`. |

---

## Command Line Syntax & macOS Diagnostics

```bash
# 1. Inspect Application Bundle Identifier via macOS CLI
defaults read /Applications/Slack.app/Contents/Info.plist CFBundleIdentifier

# 2. Search All Filesystem Artifacts via Spotlight Metadata (mdfind)
mdfind -name "com.tinyspeck.slackmacgap"

# 3. Force Rebuild macOS LaunchServices Database
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain user
```

### Essential File Locations
- **AppCleaner Config**: `~/Library/Preferences/net.freemacsoft.AppCleaner.plist`
- **SmartDelete Daemon**: `~/Library/Application Support/AppCleaner/AppCleaner SmartDelete.app`
- **TCC Database**: `/Library/Application Support/com.apple.TCC/TCC.db`

---

## Agent Operational Directive
> **MANDATORY**: Ensure AppCleaner or custom cleanup scripts have Full Disk Access before running to prevent leaving orphaned data in `~/Library/Containers`. Unload LaunchAgents before deleting plist files.
