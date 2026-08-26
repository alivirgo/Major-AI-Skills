---
title: "AutoHotkey v2 Desktop Automation AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot AutoHotkey v2 Window Spy (WindowSpy.ahk), control classes, screen coordinates, and custom Gui layouts."
category: "Desktop Automation & Custom Scripting Engine"
tags: ["autohotkey-v2", "window-spy", "window-coordinates", "gemini", "gui-layout-ahk", "win32-controls", "au3-spy"]
---

# AutoHotkey v2 Desktop Automation AI Skill Guide (Gemini)

## Overview & Engine Architecture
AutoHotkey v2 provides an interactive diagnostic and graphical user interface system powered by **Window Spy (`WindowSpy.ahk`)**, Win32 control introspection (**`ClassNN`, Control HWND, Styles**), multi-coordinate spaces (**Screen vs Window vs Client**), and the **AHK v2 Native Gui Framework**. Gemini acts as an AI Windows Interface Automation Specialist and GUI Layout Auditor, specializing in **multimodal Window Spy screenshot analysis**, **Win32 coordinate space mapping**, **Control identification diagnostics**, and **responsive AHK Gui design**.

### Visual Analytics & Window Inspection Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 AutoHotkey v2 Visual Operations             │
│                                                             │
│  Window Spy & Inspection Viewports                          │
│  ├── Window Spy HUD (`ahk_class`, `ahk_exe`, `ahk_id` HWND) │
│  ├── Coordinate Matrix (Screen, Window, Client Pixel Scales)│
│  └── Focused Control Inspector (ClassNN, Text, Position)    │
│                                                             │
│  AHK v2 Gui Framework & Controls                            │
│  ├── Gui Object Container (Dark Mode Background, Margins)   │
│  ├── Interactive Controls (ListView, TreeView, Edit, Button)│
│  └── Non-Client & Layered Window Effects (GDI+, Acrylic Blur│
│                                                             │
│  System Tray & Process Telemetry                            │
│  ├── System Tray Menu (Pause Script, Suspend Hotkeys, Exit) │
│  └── Active Hook Status & Key History / Script Info Viewers │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Window Spy Screenshot Analysis**: Analyze screenshots of `WindowSpy.ahk` to extract precise window titles, `ahk_class`, `ahk_exe` process names, and child control `ClassNN` identifiers.
2. **Coordinate Mode Disambiguation**: Audit scripts to ensure `CoordMode("Mouse", "Client")` vs `CoordMode("Pixel", "Screen")` is declared explicitly before issuing mouse clicks or color searches.
3. **AHK v2 Gui Component Hierarchy Design**: Build clean, modern Windows desktop interfaces using v2 `Gui` objects, responsive layout grids, and event callbacks (`btn.OnEvent("Click", Handler)`).
4. **Window Matching Mode Calibration**: Configure `SetTitleMatchMode(2)` (Sub-string match) or `SetTitleMatchMode("RegEx")` to eliminate brittle exact-title matching bugs.

---

## Production Python Automation: Automated AHK v2 Script Linter & v1 Syntax Detector

Run this script to scan `.ahk` files for legacy v1 syntax patterns (e.g. `%var%` assignments, legacy commands) that cause fatal syntax errors in AHK v2:

```python
"""
AutoHotkey v2 Syntax & Legacy v1 Migration Linter
Scans .ahk files to detect legacy v1 syntax patterns incompatible with the v2 interpreter.
"""

import sys
import os
import re

V1_PATTERNS = [
    (r"^\s*IfEqual\b", "Legacy 'IfEqual' statement (use 'if (a == b)')"),
    (r"^\s*StringReplace\b", "Legacy 'StringReplace' command (use 'StrReplace()')"),
    (r"^\s*StringSplit\b", "Legacy 'StringSplit' command (use 'StrSplit()')"),
    (r"^\s*Gui,\s*Add\b", "Legacy v1 'Gui, Add' command (use 'myGui := Gui()' and 'myGui.Add()')"),
    (r"^\s*MsgBox,\s*[^,\n]+,", "Legacy comma-delimited 'MsgBox, ...' (use 'MsgBox(\"...\")')"),
    (r":=\s*%[a-zA-Z0-9_]+%", "Legacy dynamic variable reference '%var%' on RHS of assignment"),
]

def lint_ahk_script(script_path: str):
    if not os.path.exists(script_path):
        print(f"Error: Script '{script_path}' not found.")
        return

    print(f"--- [LINTING AUTOHOTKEY V2 SCRIPT: {script_path}] ---")
    
    with open(script_path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    issues_found = 0
    for line_num, line in enumerate(lines, 1):
        for pattern, description in V1_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                print(f"🚨 Line {line_num:>3}: {description}")
                print(f"   Code: {line.strip()}")
                issues_found += 1

    if issues_found == 0:
        print("✅ No legacy v1 syntax detected. Script conforms to AutoHotkey v2 standards.")
    else:
        print(f"\n⚠️  Found {issues_found} incompatible legacy v1 pattern(s). Please refactor to AHK v2.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 lint_ahk.py <script.ahk>")
        sys.exit(1)
    lint_ahk_script(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`Click` Clicks Wrong Location on Screen** | Default `CoordMode` is "Client" in v2, but coordinates were extracted relative to "Screen" in Window Spy. | Declare `CoordMode("Mouse", "Screen")` or `CoordMode("Mouse", "Window")` at top of function. |
| **`WinActive` Fails to Detect Target Window** | Window title contains hidden special characters or active tab changes title dynamically. | Match by process executable and class instead: `WinActive("ahk_exe chrome.exe ahk_class Chrome_WidgetWin_1")`. |
| **Custom Gui Appears with White Titlebar in Dark Mode** | Windows DWM immersive dark mode attribute not set on window handle. | Apply DWM dark mode attribute via `DllCall("dwmapi\DwmSetWindowAttribute", "Ptr", myGui.Hwnd, "Int", 20, "Int*", 1, "Int", 4)`. |
| **ControlClick Fails on Chrome / Electron Apps** | Electron applications render with DirectComposition / Canvas without exposing discrete Win32 ClassNN controls. | Use UI Automation (UIA-v2 library) or image searching (`ImageSearch`) to target UI elements inside Electron. |

---

## Command Line Syntax & Server Control

```bash
# Launch AutoHotkey v2 Window Spy Utility
"C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe" "C:\Program Files\AutoHotkey\WindowSpy.ahk"

# Test Script Execution in Debug Mode
"C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe" /ErrorStdOut "C:\Scripts\MyTool.ahk"
```

### Key Configuration Locations
- **Window Spy Tool**: `C:\Program Files\AutoHotkey\WindowSpy.ahk`
- **Compiler Base**: `C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe`

---

## Agent Operational Directive
> **MANDATORY**: When matching windows in AutoHotkey v2 scripts, combine `ahk_exe <process.exe>` with `ahk_class <ClassName>` rather than relying solely on dynamic window title strings.
