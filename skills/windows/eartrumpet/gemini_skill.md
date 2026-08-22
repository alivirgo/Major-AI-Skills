---
title: "EarTrumpet Windows Audio Engine AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot EarTrumpet WinUI flyouts, per-app volume sliders, peak level meters, and system tray integration."
category: "Per-App Audio Routing & Volume Control"
tags: ["eartrumpet", "winui-flyout", "peak-meters-ui", "gemini", "audio-sliders", "system-tray-audio"]
---

# EarTrumpet Windows Audio Engine AI Skill Guide (Gemini)

## Overview & Engine Architecture
EarTrumpet provides a native Windows 11 fluent interface featuring the **WinUI / XAML Islands Audio Mixer Flyout**, **Dynamic Per-App Volume Sliders**, **Real-Time Visual Peak Level Meters**, and **Device Context Menus (Right-Click Endpoint Redirection)**. Gemini acts as an AI Windows Interface Specialist and Audio Systems Auditor, specializing in **multimodal Volume Flyout inspection**, **peak audio clipping analysis**, **active vs dormant audio stream identification**, and **system tray icon duplication diagnostics**.

### Visual Analytics & Audio Interface Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 EarTrumpet Visual Operations                │
│                                                             │
│  Mixer Flyout & UI Presentation                             │
│  ├── Fluent Acrylic / Mica Flyout (Windows 11 Design System)│
│  ├── Per-App Volume Sliders (0-100% Granular Control)       │
│  └── Real-Time Peak Audio Meter Bars (Green/Yellow/Red HUD) │
│                                                             │
│  Device Context & Routing UI                                │
│  ├── Multi-Endpoint Dropdowns (Speakers, Headset, Digital)  │
│  ├── App-Specific Right-Click Device Redirector Menu        │
│  └── Master Volume Slider & Mute Toggle Controls            │
│                                                             │
│  Taskbar & System Tray Integration                         │
│  ├── System Tray Icon Status (Dual Speaker Icon Resolution) │
│  └── Quick Action Flyout Shortcuts (Middle-Click to Mute)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Mixer Flyout Inspection**: Analyze screenshots of the EarTrumpet flyout to identify active vs muted applications, verify audio peak meter bounce activity, and detect unexpected background audio consumers.
2. **Dual System Tray Icon Remediation**: Guide users through disabling the default Windows volume icon in *Taskbar Settings $\rightarrow$ Turn system icons on or off* to eliminate duplicate tray speaker icons.
3. **Per-App Device Routing Verification**: Review application context menus to ensure individual programs are assigned to the intended playback endpoint (*e.g. Discord assigned to Headset while Spotify plays on Desktop Speakers*).
4. **Volume Normalization & Peak Clipping Triage**: Inspect visual peak meter levels to ensure master output does not peg constantly at $100\%$ ($0\text{ dBFS}$ digital clipping).

---

## Production Python Automation: Automated Windows Default Audio Endpoint Inspector

Run this script to inspect available audio playback endpoints and determine the current default Windows audio device:

```python
"""
Windows Audio Playback Endpoint Inspector
Enumerates connected audio playback hardware devices and identifies the system default output.
"""

import sys

def inspect_audio_endpoints():
    print("--- [INSPECTING WINDOWS AUDIO PLAYBACK ENDPOINTS] ---")
    try:
        from pycaw.pycaw import AudioUtilities
        
        devices = AudioUtilities.GetAllDevices()
        print(f"Found {len(devices)} Audio Device(s):\n")

        for dev in devices:
            # Check for output endpoints
            dev_name = getattr(dev, "FriendlyName", "Audio Endpoint")
            dev_state = getattr(dev, "State", "Unknown")
            dev_id = getattr(dev, "id", "")

            print(f"• Endpoint: {dev_name:<36} | State: {dev_state}")

        print("\n✅ Audio hardware endpoints listed successfully.")

    except ImportError:
        print("Notice: 'pycaw' library required (run: pip install pycaw).")
    except Exception as e:
        print(f"Failed to query audio devices: {e}")

if __name__ == "__main__":
    inspect_audio_endpoints()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Two Speaker Icons Appear in System Tray** | Default Windows volume icon and EarTrumpet icon both enabled simultaneously. | In Windows Settings $\rightarrow$ Personalization $\rightarrow$ Taskbar $\rightarrow$ Other system tray icons, toggle **Volume** to Off. |
| **Peak Meter Bounces but No Sound Output** | Application routed to inactive or disconnected audio endpoint (e.g. unpowered monitor HDMI). | Right-click the app icon in EarTrumpet $\rightarrow$ Select output device icon $\rightarrow$ Switch to active **Speakers / Headphones**. |
| **Middle-Click Does Not Mute Application** | Middle-click shortcut disabled in EarTrumpet settings. | Right-click EarTrumpet tray icon $\rightarrow$ Settings $\rightarrow$ Enable **Middle-click on app to mute/unmute**. |
| **Flyout Opens Stuttery on Multi-Monitor High-DPI** | Windows DWM scaling disparity between $4\text{K } 150\%$ and $1080\text{p } 100\%$ displays. | In Windows Display Settings, align monitor scaling factors or restart `explorer.exe`. |

---

## Command Line Syntax & Server Control

```powershell
# Query EarTrumpet UWP App Manifest Details
Get-AppxPackage -Name "*EarTrumpet*" | Select-Object Name, Version, InstallLocation

# Relaunch Windows Explorer to Refresh Tray Icons
Stop-Process -Name "explorer" -Force
```

### Key Configuration Locations
- **Settings Store**: `%LOCALAPPDATA%\Packages\41808File-Save.EarTrumpet_10tokenms02j\`

---

## Agent Operational Directive
> **MANDATORY**: When users report seeing two volume speaker icons in their Windows taskbar, instruct them to hide the native Windows Volume tray icon under Taskbar Settings.
