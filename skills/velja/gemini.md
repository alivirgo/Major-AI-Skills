---
title: "Velja macOS Smart Browser Picker & URL Router AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Velja prompt modals, browser selector lists, routing rule tables, and tracking filters."
category: "Smart Browser Picker & URL Router"
tags: ["velja", "macos-browser-picker", "browser-modal", "gemini", "routing-rules-ui", "tracking-stripper-ui"]
---

# Velja macOS Smart Browser Picker & URL Router AI Skill Guide (Gemini)

## Overview & Engine Architecture
Velja presents a minimalist native macOS prompt modal when opening ambiguous links, offering instant keyboard navigation across installed browsers, browser profiles, and native app hand-offs. Gemini acts as an AI macOS UX & Privacy Reviewer, specializing in **multimodal Velja prompt dialog inspection**, **routing rules table validation**, **tracking parameter filter audits**, and **browser icon presentation checks**.

### Visual Analytics & Browser Selector Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Velja Visual Operations Stack               │
│                                                             │
│  Modal Prompt & Browser Picker Hierarchy                    │
│  ├── Floating Link Interception Modal (URL Preview & Domain)│
│  ├── Installed Browser Grid (Numbered 1-9 Shortcuts, Icons) │
│  │    ├── Safari (Personal Profile)                         │
│  │    ├── Google Chrome (Work Profile)                      │
│  │    └── Native Hand-Off Button (Open in App: Figma/Zoom)  │
│  └── Alternative Browser Trigger (Hold ⌥/⇧ Key Overlays)    │
│                                                             │
│  Settings & Privacy Rule Panels                             │
│  ├── Routing Rules Table (Domain Pattern $\rightarrow$ Target Browser)│
│  └── Tracking Parameter Stripper Checklist (UTM, Facebook...)│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Modal Dialog Review**: Analyze screenshots of Velja's link selection modal to verify domain string legibility, sanitized URL previews, and browser profile badge clarity.
2. **Routing Rules Table Validation**: Inspect routing rule tables to ensure higher-priority subdomains (*e.g. `work.github.com`*) appear above catch-all root domain rules (*`*.github.com`*).
3. **Privacy & Tracking Parameter Checklist Auditing**: Verify that tracking parameter stripping is active for general browsing while whitelisting sensitive developer/auth domains.
4. **Keyboard Navigation Optimization**: Ensure each installed browser is assigned a distinct single-key shortcut (`1`, `2`, `3`) for rapid link dispatch.

---

## Production Python Automation: Automated Velja Settings & Rule Table Auditor

Execute this script to audit Velja's preference plist and list all active domain routing rules:

```python
"""
Velja macOS Routing Rules & Preference Auditor
Reads com.sindresorhus.Velja.plist and prints configured domain-to-browser rules.
"""

import os
import plistlib
import json

PREF_PATH = os.path.expanduser("~/Library/Preferences/com.sindresorhus.Velja.plist")

def audit_velja_configuration():
    if not os.path.exists(PREF_PATH):
        print(f"Error: Velja preferences '{PREF_PATH}' not found.")
        print("Note: Launch Velja to generate initial configuration preferences.")
        return

    print("--- [AUDITING VELJA BROWSER ROUTING & PRIVACY SETTINGS] ---")
    try:
        with open(PREF_PATH, "rb") as f:
            prefs = plistlib.load(f)

        remove_tracking = prefs.get("removeTrackingParameters", True)
        hide_menu_bar   = prefs.get("hideMenubarIcon", False)
        default_browser = prefs.get("defaultBrowser", "System Default")

        print(f"• Default Primary Browser:    {default_browser}")
        print(f"• Strip Tracking Parameters:  {'✅ ENABLED' if remove_tracking else '⚠️ DISABLED'}")
        print(f"• Menu Bar Icon Visibility:   {'HIDDEN' if hide_menu_bar else 'VISIBLE'}")

        # Inspect Custom Rules
        raw_rules = prefs.get("rules", [])
        print(f"\n--- [CONFIGURED ROUTING RULES ({len(raw_rules)})] ---")
        if raw_rules:
            for r in raw_rules:
                pattern = r.get("url", r.get("pattern", "Wildcard"))
                browser = r.get("browser", {}).get("name", "Custom Browser")
                print(f"• Pattern: {pattern:<30} -> Target: {browser}")
        else:
            print("*No custom domain rules configured (using default browser prompt).*")

    except Exception as e:
        print(f"Error reading plist: {e}")

if __name__ == "__main__":
    audit_velja_configuration()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Modal Prompt Shows Truncated / Illegible URL** | Display resolution or scaling setting compressing Velja's floating modal dialog. | Hover over the URL bar in the Velja prompt to view the expanded full path tooltip. |
| **Duplicate Browser Icons in Picker List** | Multiple versions of the same browser installed in `/Applications/` and `~/Applications/`. | In Velja Settings $\rightarrow$ **Browsers**, remove duplicate entries and link to the primary `/Applications/` binary. |
| **Holding Modifier Key Fails to Override Browser** | Modifier key shortcut in Velja conflicts with a global macOS shortcut. | In Velja Settings $\rightarrow$ **General**, change the alternative modifier key from `Option` (`⌥`) to `Shift` (`⇧`). |
| **Prompt Appears on Wrong Display** | macOS Mission Control setting "Displays have separate Spaces" unconfigured. | Ensure mouse cursor is on the active display when clicking links. |

---

## Command Line Syntax & Server Control

```bash
# Launch Velja Settings Directly
open "velja://"

# Query Active Default HTTP Handler via duti
duti -d http
```

### Key Configuration Locations
- **Preferences Plist**: `~/Library/Preferences/com.sindresorhus.Velja.plist`
- **Application Binary**: `/Applications/Velja.app`

---

## Agent Operational Directive
> **MANDATORY**: When configuring domain routing rules in Velja, order specific subdomain and internal VPN regex patterns before catch-all wildcards to prevent routing collisions.
