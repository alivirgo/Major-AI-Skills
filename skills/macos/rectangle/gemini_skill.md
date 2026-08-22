---
title: "Rectangle macOS Window Manager AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Rectangle Preferences, shortcut customization matrices, drag-to-snap zones, and Menu Bar controls."
category: "Keyboard & Drag Window Manager"
tags: ["rectangle", "macos-window-manager", "shortcuts-matrix", "gemini", "drag-snap-zones", "menu-bar-ui"]
---

# Rectangle macOS Window Manager AI Skill Guide (Gemini)

## Overview & Engine Architecture
Rectangle delivers a clean macOS interface providing configurable hotkey matrices, drag-to-edge snapping overlay zones, display cycle shortcuts, and custom margin padding sliders. Gemini acts as an AI macOS Ergonomics Specialist and UI Systems Reviewer, specializing in **multimodal Rectangle preference panel inspection**, **keyboard shortcut collision audits**, **screen-edge drag snapping zone diagnostics**, and **Menu Bar status controls**.

### Visual Analytics & Window Tiling Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Rectangle Visual Operations                 │
│                                                             │
│  Tiling Matrix & Snapping Visuals                           │
│  ├── Halves & Quarters Grid (Left, Right, Top, Bottom, 4 Corners│
│  ├── Thirds & Sixths Grid (Left Third, Center Third, Right) │
│  ├── Maximize / Almost Maximize / Center Display Layouts    │
│  └── Drag-to-Edge Cursor Snapping Preview Overlays          │
│                                                             │
│  Preference Controls & Layout Tuning                        │
│  ├── Shortcut Recorder Matrix (Modifier Key Badges: ⌃⌥⇧⌘)   │
│  ├── Gap Size Slider (Inner & Outer Screen Margin Pixels)   │
│  └── Menu Bar Icon HUD (Quick Tiling Command Dropdown)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Preference Panel Inspection**: Analyze screenshots of the Rectangle Preferences window to detect unassigned hotkeys, conflicting modifier keys (e.g. `⌃⌥` vs `⌘⌥`), and invalid gap values.
2. **Drag-to-Edge Snap Zone Triage**: Validate screen edge trigger footprints (screen corners for quarters; edges for halves; top edge for maximize) across multi-display setups.
3. **Ergonomic Hotkey Matrix Mapping**: Propose consistent keyboard shortcut schemes matching user muscle memory (*e.g. Spectacle layout vs Magnet layout vs Default Rectangle*).
4. **Display Cycling & Multi-Monitor Diagnostics**: Troubleshoot next/previous display cycling hotkeys (`⌃⌥⌘ $\rightarrow$`).

---

## Production Python Automation: Automated Rectangle Shortcut & Gap Preference Auditor

Execute this script to audit and adjust Rectangle's gap sizes and shortcut presets directly from the command line:

```python
"""
Rectangle macOS Configuration & Gap Auditor
Inspects com.knollsoft.Rectangle.plist for optimal window gap and behavior settings.
"""

import os
import plistlib

PREF_PATH = os.path.expanduser("~/Library/Preferences/com.knollsoft.Rectangle.plist")

def audit_rectangle_settings():
    if not os.path.exists(PREF_PATH):
        print(f"Error: Rectangle preferences '{PREF_PATH}' not found.")
        print("Note: Launch Rectangle to generate default preferences.")
        return

    print("--- [AUDITING RECTANGLE WINDOW MANAGER SETTINGS] ---")
    try:
        with open(PREF_PATH, "rb") as f:
            prefs = plistlib.load(f)

        gap_size        = prefs.get("gapSize", 0.0)
        snap_to_edges   = prefs.get("snapToEdges", True)
        subsequent_cycle = prefs.get("subsequentExecutionMode", 0) # 0 = Same size, 1 = Halves to Thirds
        launch_on_login = prefs.get("launchOnLogin", True)

        print(f"• Window Gap Size:            {gap_size} px")
        print(f"• Drag-to-Edge Snapping:      {'✅ ENABLED' if snap_to_edges else '⚠️ DISABLED'}")
        print(f"• Repeated Execution Cycle:   {'Halves -> Thirds' if subsequent_cycle == 1 else 'Standard'}")
        print(f"• Launch at Login:            {'✅ ENABLED' if launch_on_login else '⚠️ DISABLED'}")

        if gap_size > 0:
            print(f"\n💡 Notice: Outer screen gaps of {gap_size}px are active around tiled windows.")

    except Exception as e:
        print(f"Error reading plist: {e}")

if __name__ == "__main__":
    audit_rectangle_settings()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Drag Snapping Overlays Do Not Appear on Edge** | Drag-to-edge snapping is disabled in preferences or cursor moved too quickly. | In Rectangle Preferences $\rightarrow$ **Settings**, ensure **Snap windows by dragging to screen edges** is checked. |
| **Shortcut Modifier Symbols Display Inconsistently** | User configured a combination that conflicts with macOS global input methods (e.g. Option key dead keys). | Use standard modifier pairs such as `Control + Option` (`⌃⌥`) or `Command + Option` (`⌘⌥`). |
| **Menu Bar Icon Missing from Status Bar** | User selected "Hide menu bar icon" in preferences. | Launch Terminal $\rightarrow$ Run `defaults write com.knollsoft.Rectangle hideMenubarIcon -bool false` $\rightarrow$ Restart Rectangle. |
| **Window Resizes but Fails to Center on Screen** | Target window has a fixed aspect ratio or fixed minimum width larger than 50% of the screen. | Maximize the window instead or increase display resolution. |

---

## Command Line Syntax & Server Control

```bash
# Launch Rectangle via Terminal
open -a Rectangle

# Show Hidden Menu Bar Icon
defaults write com.knollsoft.Rectangle hideMenubarIcon -bool false
```

### Key Configuration Locations
- **Preferences Plist**: `~/Library/Preferences/com.knollsoft.Rectangle.plist`
- **TCC Database Entry**: `com.knollsoft.Rectangle`

---

## Agent Operational Directive
> **MANDATORY**: For ultra-wide and 4K displays, recommend enabling "Repeated execution of half-screen shortcut cycles to thirds" in Rectangle preferences to enhance multi-tasking density.
