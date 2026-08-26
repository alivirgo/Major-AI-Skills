---
title: "Velja macOS Smart Browser Picker & URL Router AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Velja, duti LaunchServices scripts, plist rule deployment, and macOS URL handling."
category: "Smart Browser Picker & URL Router"
tags: ["velja", "duti-cli", "plist-scripting", "macos-automation", "gpt-codex", "url-dispatch"]
---

# Velja macOS Smart Browser Picker & URL Router AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Velja provides automated browser dispatch configurable via **`duti` LaunchServices binding**, **`defaults` / `plistlib` rule deployment**, and the **`velja://` URL scheme**. GPT/Codex acts as a Principal macOS Automation Architect and Systems Engineer, delivering **automated dotfile browser routing installers**, **`duti` handler automation scripts**, **programmatic plist rule generators**, and **URL query stripping engines**.

### Developer Architecture & System Configuration Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Velja Developer Platform                    │
│                                                             │
│  LaunchServices Registration Tier                           │
│  ├── `duti` CLI Handler Tool (`duti -s ... http`)           │
│  ├── CoreServices Framework Ingress Binding                 │
│  └── Custom URL Scheme Engine (`velja://`)                  │
│                                                             │
│  Declarative Configuration Subsystem                        │
│  ├── `com.sindresorhus.Velja.plist` Configuration Map       │
│  ├── Rule Serialization Format (Regex Patterns & App BIDs)  │
│  └── Automated Dotfiles Bootstrap Pipelines                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Automated `duti` Protocol Registration**: Construct idempotent shell scripts registering Velja for `http`, `https`, and `mailto` protocols across new macOS machine setups.
2. **Programmatic Plist Rule Generation**: Write Python scripts using `plistlib` to generate and deploy structured routing rules directly into `com.sindresorhus.Velja.plist`.
3. **URL Scheme Automation**: Formulate `velja://` and `open -a Velja` commands to test link dispatch programmatically.
4. **Browser Profile Argument Handling**: Configure launch arguments for Chromium and Gecko browsers (`--profile-directory`, `-P`) to route links to discrete browser user contexts.

---

## Production Python Automation: Automated Velja Rule Generator & Plist Deployer

Save this script as `deploy_velja_rules.py` to programmatically inject custom routing rules into Velja's preference file:

```python
"""
Velja Declarative Routing Rules Deployer (Python 3)
Generates and writes structured domain routing rules into com.sindresorhus.Velja.plist.
"""

import sys
import os
import plistlib
import subprocess

PREF_PATH = os.path.expanduser("~/Library/Preferences/com.sindresorhus.Velja.plist")

def deploy_custom_rules():
    print("--- [DEPLOYING DECLARATIVE VELJA ROUTING RULES] ---")

    # 1. Terminate Velja to prevent in-memory overwrite
    subprocess.run(["killall", "Velja"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    prefs = {}
    if os.path.exists(PREF_PATH):
        try:
            with open(PREF_PATH, "rb") as f:
                prefs = plistlib.load(f)
        except Exception as e:
            print(f"Warning: Could not read existing plist: {e}")

    # 2. Define Custom Routing Rules
    custom_rules = [
        {
            "id": "rule-work-github",
            "url": "https://github.com/enterprise-org/*",
            "browser": {
                "bundleIdentifier": "com.google.Chrome",
                "name": "Google Chrome"
            },
            "enabled": True
        },
        {
            "id": "rule-figma-app",
            "url": "https://www.figma.com/file/*",
            "browser": {
                "bundleIdentifier": "com.figma.Desktop",
                "name": "Figma"
            },
            "enabled": True
        },
        {
            "id": "rule-personal-default",
            "url": "*",
            "browser": {
                "bundleIdentifier": "com.apple.Safari",
                "name": "Safari"
            },
            "enabled": True
        }
    ]

    prefs["rules"] = custom_rules
    prefs["removeTrackingParameters"] = True
    prefs["hideMenubarIcon"] = False

    # 3. Write Updated Preferences
    with open(PREF_PATH, "wb") as f:
        plistlib.dump(prefs, f)

    print(f"✅ Successfully wrote {len(custom_rules)} rules to: {PREF_PATH}")

    # 4. Relaunch Velja
    subprocess.run(["open", "-a", "Velja"])
    print("🚀 Velja relaunched with updated rules!")

if __name__ == "__main__":
    deploy_custom_rules()
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`duti` Command Not Found in Terminal** | `duti` utility not installed on macOS host. | Install via Homebrew: `brew install duti`. |
| **Plist Edits Overwritten on System Reboot** | macOS `cfprefsd` preference daemon cached old values in memory. | Flush preference daemon cache: `killall cfprefsd` before restarting Velja. |
| **Target App Fails to Open URL: `Application not found`** | Target `bundleIdentifier` in rule does not match the installed application's actual bundle ID. | Check bundle ID: `defaults read /Applications/AppName.app/Contents/Info.plist CFBundleIdentifier`. |
| **Wildcard Matching Fails on Subdomains** | Pattern syntax missing leading `*://*.` wildcard prefix. | Use standard wildcard syntax: `https://*.domain.com/*`. |

---

## Command Line Syntax & Batch Processing

```bash
# 1. Set Velja for HTTP and HTTPS via duti
duti -s com.sindresorhus.Velja http
duti -s com.sindresorhus.Velja https

# 2. Flush macOS Preference Daemon Cache
killall cfprefsd

# 3. Test URL Routing via macOS open CLI
open "https://github.com/enterprise-org/repo"
```

### Essential File Locations
- **Preferences Plist**: `~/Library/Preferences/com.sindresorhus.Velja.plist`
- **Application Bundle**: `/Applications/Velja.app`

---

## Agent Operational Directive
> **MANDATORY**: When writing automated configuration scripts for Velja, always terminate `Velja` and flush `cfprefsd` (`killall cfprefsd`) to ensure plist changes are loaded into memory upon restart.
