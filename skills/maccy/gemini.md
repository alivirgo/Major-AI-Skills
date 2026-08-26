---
title: "Maccy macOS Clipboard History Manager AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Maccy popup menus, pinned clipboard items, rich text formatting previews, and Menu Bar states."
category: "Clipboard History Manager"
tags: ["maccy", "macos", "clipboard-ui", "gemini", "pinned-items", "menu-bar-diagnostics"]
---

# Maccy macOS Clipboard History Manager AI Skill Guide (Gemini)

## Overview & Engine Architecture
Maccy provides a keyboard-first, native macOS popup menu that renders searchable clipboard clips, rich text previews, image thumbnails, and persistent pinned headers. Gemini acts as an AI macOS Productivity Specialist and UI Systems Auditor, specializing in **multimodal Maccy popup menu inspection**, **pinned vs dynamic history validation**, **rich text/code snippet formatting verification**, and **Menu Bar status icon state analysis**.

### Visual Analytics & UI Hierarchy Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Maccy Visual Operations Stack               │
│                                                             │
│  Popup Menu Presentation Hierarchy                          │
│  ├── Search Header Input (Real-Time Fuzzy Filter)           │
│  ├── Pinned Items Section (Numbered 1-9 Shortcuts, Red Pins)│
│  ├── Dynamic History List (Numbered Shortcuts, Timestamps)  │
│  │    ├── Text Clips (Formatted Syntax & Line Breaks)       │
│  │    ├── Image Thumbnails (Aspect Ratio & Byte Size)       │
│  │    └── File Path Links (POSIX URIs & Finder Icons)       │
│  └── Preview Panel (Side-by-Side Expanded Text/Image HUD)   │
│                                                             │
│  Menu Bar & Preference Controls                             │
│  ├── Menu Bar Icon (Paperclip Indicator / Active State)     │
│  └── Popup Positioning (At Cursor vs Centered on Screen)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Popup Menu Inspection**: Analyze screenshots of Maccy's popup menu to verify that search queries correctly highlight fuzzy matches, pinned headers retain their sticky positions, and preview panels expand cleanly without truncation.
2. **Formatting & Syntax Highlighting Review**: Ensure copied JSON, Python, and SQL snippets preserve line indentations and escape characters when rendered in Maccy's side preview panel.
3. **Menu Bar Status & Appearance Tuning**: Guide users in configuring popup positioning (*At Cursor / Menu Icon / Window Center*) and menu bar visibility settings.
4. **Fuzzy Search & Filtering Diagnostics**: Troubleshoot character matching sensitivity and regex search parameters in Maccy preferences.

---

## Production Python Automation: Automated Maccy Preference Auditor (`.plist`)

Execute this script to audit and optimize Maccy's visual display preferences (history size, popup location, and preview panel toggles):

```python
"""
Maccy macOS Settings & Display Preference Auditor
Audits org.pavelm.Maccy.plist for optimal UI layout and history retention.
"""

import os
import plistlib

PREF_PATH = os.path.expanduser(
    "~/Library/Containers/org.pavelm.Maccy/Data/Library/Preferences/org.pavelm.Maccy.plist"
)

def audit_maccy_settings():
    if not os.path.exists(PREF_PATH):
        # Fallback to standard Preferences directory if not sandboxed
        alt_path = os.path.expanduser("~/Library/Preferences/org.pavelm.Maccy.plist")
        if os.path.exists(alt_path):
            pref_file = alt_path
        else:
            print(f"Error: Maccy preferences not found at '{PREF_PATH}'.")
            return
    else:
        pref_file = PREF_PATH

    print(f"--- [AUDITING MACCY UI SETTINGS: {pref_file}] ---")
    try:
        with open(pref_file, "rb") as f:
            prefs = plistlib.load(f)

        history_size   = prefs.get("historySize", 200)
        paste_on_select = prefs.get("pasteOnSelect", True)
        show_preview   = prefs.get("previewPosition", "right")
        popup_pos      = prefs.get("popupPosition", "cursor")

        print(f"• History Size Limit:     {history_size} items")
        print(f"• Auto-Paste on Select:   {'✅ ENABLED' if paste_on_select else '⚠️ DISABLED (Manual Cmd+V required)'}")
        print(f"• Preview Panel Position: {show_preview}")
        print(f"• Popup Spawn Location:   {popup_pos}")

    except Exception as e:
        print(f"Error reading plist: {e}")

if __name__ == "__main__":
    audit_maccy_settings()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Maccy Menu Closes Immediately Upon Opening** | Focus lost due to another floating panel or menu bar daemon claiming active window state. | In Maccy Preferences $\rightarrow$ **Appearance**, set *Popup position* to **Screen center**. |
| **Preview Panel Overlaps Screen Edge** | Multi-monitor display boundary causing the side preview panel to render offscreen. | In Maccy Preferences $\rightarrow$ **Appearance**, set Preview position to **Left** or **Bottom**. |
| **Menu Bar Icon Missing** | User unchecked "Show in menu bar" in preferences. | 1. Trigger Maccy via global hotkey (`⌘ + Shift + C`).<br>2. Open Preferences (`⌘ + ,`).<br>3. Check **Show in menu bar**. |
| **Pinned Items Lost After Restart** | CoreData SQLite write-ahead log (WAL) failed to flush before system shutdown. | Pin items and select *Quit* from Maccy menu once to force clean SQLite WAL checkpoint. |

---

## Command Line Syntax & Server Control

```bash
# Launch Maccy via Terminal
open -a Maccy

# Reset Maccy Display Preferences to Defaults
defaults delete org.pavelm.Maccy
```

### Key Configuration Locations
- **Sandboxed Preferences**: `~/Library/Containers/org.pavelm.Maccy/Data/Library/Preferences/org.pavelm.Maccy.plist`
- **Application Support CoreData**: `~/Library/Containers/org.pavelm.Maccy/Data/Library/Application Support/Maccy/`

---

## Agent Operational Directive
> **MANDATORY**: For large displays and multi-monitor setups, recommend setting Maccy's popup position to `At cursor` and preview panel to `Right` to optimize visual scanning ergonomics.
