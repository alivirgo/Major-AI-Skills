---
title: "Flow Launcher Extensible Productivity AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Flow Launcher search canvas, result styling, Theme Manager, Plugin Store, and Action Keyword routing."
category: "Productivity Application & File Launcher"
tags: ["flow-launcher", "search-canvas-ui", "theme-manager-ui", "gemini", "action-keywords", "plugin-store-ui"]
---

# Flow Launcher Extensible Productivity AI Skill Guide (Gemini)

## Overview & Engine Architecture
Flow Launcher provides a modern, customizable desktop search user interface featuring the **Floating Search Canvas (Fluent Acrylic / Mica styling)**, **Result List Viewport (Icons, Glyphs, Titles, Subtitles, Badges)**, the **Plugin Store & Settings Window**, and **Action Keyword Management**. Gemini acts as an AI Desktop Productivity Specialist and UX/Plugin Auditor, specializing in **multimodal search canvas inspection**, **visual plugin layout review**, **theme customization**, and **Action Keyword conflict diagnostics**.

### Visual Analytics & Desktop Interface Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Flow Launcher Visual Operations             │
│                                                             │
│  Search Canvas & Result Presentation                        │
│  ├── Floating Search Bar (Custom Width, Auto-Hide on Blur)  │
│  ├── Result Rows (High-DPI Icons, Subtitle Metadata, Glyph) │
│  └── Context Menu Actions (`Shift + Enter` / Right Click)   │
│                                                             │
│  Settings Window & Plugin Configuration                     │
│  ├── Plugin List (Enable/Disable Toggles, Action Keyword Box│
│  ├── Plugin Store (Community Gallery & One-Click Install)   │
│  └── General & Hotkey Config (Global Activation Hotkey)     │
│                                                             │
│  Theme Manager & Visual Customization                       │
│  ├── Theme Selector (Dark, Light, Fluent, Nord, Catppuccin) │
│  └── Font & Blur Radius Adjuster (Opacity, Drop Shadow)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Search Canvas Inspection**: Analyze screenshots of the Flow Launcher search bar to verify query formatting, result ranking order, missing icon placeholders, and subtitle alignment.
2. **Action Keyword Conflict Auditing**: Review the Settings $\rightarrow$ Plugins panel to detect duplicate Action Keywords (*e.g. two plugins sharing keyword `g` causing ambiguous routing*).
3. **Theme & Styling Customization**: Guide users in customizing XAML/CSS theme color palettes, background acrylic blur intensity, and typography (e.g. Segoe UI Variable).
4. **Plugin Store Installation Verification**: Verify successful installation of community plugins and ensure required external dependencies (Python, Node.js, Everything) are recognized in the GUI.

---

## Production Python Automation: Automated Flow Launcher Settings (`Settings.json`) Inspector

Run this script to inspect installed plugins, configured hotkeys, and Action Keywords in Flow Launcher's `Settings.json`:

```python
"""
Flow Launcher Settings & Plugin Auditor
Parses Settings.json to verify plugin states, action keywords, and hotkey bindings.
"""

import sys
import os
import json

SETTINGS_PATH = os.path.expandvars(r"%APPDATA%\FlowLauncher\Settings\Settings.json")

def audit_flow_settings(settings_file: str = SETTINGS_PATH):
    if not os.path.exists(settings_file):
        print(f"Error: Flow Launcher settings not found at '{settings_file}'.")
        return

    print(f"--- [AUDITING FLOW LAUNCHER SETTINGS: {settings_file}] ---")
    try:
        with open(settings_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        hotkey = data.get("Hotkey", "Alt + Space")
        theme = data.get("Theme", "Default")
        print(f"• Global Hotkey: {hotkey}")
        print(f"• Active Theme:  {theme}\n")

        # Inspect Plugins
        plugins_data = data.get("PluginSettings", {}).get("Plugins", {})
        print(f"Configured Plugins: {len(plugins_data)} entry/entries:\n")

        keywords = {}
        for pid, pinfo in plugins_data.items():
            name = pinfo.get("Name", "Unknown Plugin")
            disabled = pinfo.get("Disabled", False)
            keyword = pinfo.get("ActionKeyword", "*")
            status = "❌ Disabled" if disabled else "✅ Enabled"

            print(f"• [{status}] {name:<26} | Keyword: '{keyword}'")

            if not disabled and keyword != "*":
                keywords.setdefault(keyword, []).append(name)

        # Detect Keyword Collisions
        collisions = {k: v for k, v in keywords.items() if len(v) > 1}
        if collisions:
            print("\n🚨 WARNING: Detected Action Keyword Collisions:")
            for k, names in collisions.items():
                print(f"  • Keyword '{k}' shared by: {', '.join(names)}")
        else:
            print("\n✅ No Action Keyword collisions detected.")

    except Exception as e:
        print(f"Failed to parse settings: {e}")

if __name__ == "__main__":
    audit_flow_settings()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Search Canvas Appears Off-Screen on Multi-Monitor** | Stored window position references a disconnected external monitor. | Press `Alt + Space` $\rightarrow$ Press `Win + Shift + Left/Right Arrow` to move launcher back to primary display. |
| **Plugin Returns Results with Missing / Broken Icons** | `IcoPath` in plugin result references a relative path that does not exist on disk. | In plugin folder, verify icon image exists (e.g. `icon.png`) and path is relative to plugin root directory. |
| **Theme Acrylic Blur Renders as Solid Gray / Black** | Windows Transparency effects disabled in OS settings. | In Windows Settings $\rightarrow$ Accessibility $\rightarrow$ Visual effects, toggle **Transparency effects** to On. |
| **Search Results Show Duplicate Entries** | Multiple plugins (e.g. Program Plugin + Explorer Plugin) indexing the same directory. | In Settings $\rightarrow$ Plugins, disable redundant indexing paths in Program or Explorer settings. |

---

## Command Line Syntax & Server Control

```bash
# Launch Flow Launcher with Specific Theme
"%LOCALAPPDATA%\FlowLauncher\Flow.Launcher.exe"

# Re-open Flow Launcher Settings Window
# (Trigger via GUI or Hotkey Alt+Space -> Type "Settings")
```

### Key Configuration Locations
- **Settings File**: `%APPDATA%\FlowLauncher\Settings\Settings.json`
- **Plugin Directory**: `%APPDATA%\FlowLauncher\Plugins\`

---

## Agent Operational Directive
> **MANDATORY**: When configuring Action Keywords in Flow Launcher, ensure that global action triggers do not collide with existing default search keywords to maintain deterministic query dispatching.
