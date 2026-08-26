---
title: "ShareX Advanced Screen Capture & Automation AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot ShareX Image Annotator, Task Settings dialogs, Hotkey matrices, and Destination Uploader lists."
category: "Screen Capture, OCR, Video Recording & Sharing"
tags: ["sharex", "image-annotator-ui", "task-settings-dialog", "gemini", "hotkey-matrix", "destination-uploaders"]
---

# ShareX Advanced Screen Capture & Automation AI Skill Guide (Gemini)

## Overview & Engine Architecture
ShareX provides an expansive desktop capture and media routing interface featuring the **Main Dashboard (Capture History, Image Previewer)**, the **Image Annotator Canvas (Step numbers, Blur, Pixelate, Speech Bubbles, Highlights)**, **Task Settings (After Capture / After Upload automation trees)**, and the **Custom Destination Settings Manager**. Gemini acts as an AI Media Workflow Specialist and Image Annotation Auditor, specializing in **multimodal annotation quality review**, **Task Settings workflow sequence verification**, **destination upload security audits**, and **hotkey trigger management**.

### Visual Analytics & Screen Capture Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 ShareX Visual Operations                    │
│                                                             │
│  Capture & Annotation Viewports                             │
│  ├── Region Selection HUD (Pixel Coordinates, Magnifier Loup│
│  ├── Image Annotator (Stickers, Blur/Pixelate, Vector Shapes│
│  └── Pin to Screen Floating Viewport (Multi-Image Overlays) │
│                                                             │
│  Workflow Configuration & Task Trees                        │
│  ├── After Capture Tasks (Copy to Clipboard, Save to File)  │
│  ├── After Upload Tasks (Shorten URL, Copy Link to Clipbrd) │
│  └── Hotkey Settings Grid (Custom Workflows & Keybinds)     │
│                                                             │
│  Destination & Service Management                           │
│  ├── Image / Text / File Destinations (Imgur, S3, FTP, S3)  │
│  └── Custom Uploader Builder Dialog (`.sxcu` Inspector)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Image Annotator Inspection**: Analyze screenshots within the ShareX Image Annotator to verify redaction coverage (*e.g. confirming passwords, API tokens, or PII are thoroughly obscured with Blur/Pixelate tools*).
2. **Task Settings Workflow Sequence Auditing**: Review the "After Capture Tasks" and "After Upload Tasks" checkmark matrices to prevent accidental public uploads of private captures.
3. **Hotkey Settings Verification**: Audit configured hotkeys to ensure dedicated combinations exist for Fullscreen (`Ctrl + PrintScreen`), Window (`Alt + PrintScreen`), and OCR extraction (`Win + Shift + T`).
4. **Scrolling Capture Edge Detection Calibration**: Guide users in adjusting vertical and horizontal scroll overlap parameters to eliminate duplicated text lines during website captures.

---

## Production Python Automation: Automated ShareX Capture History & Metadata Auditor

Run this script to inspect recent screenshot captures and file paths recorded in ShareX's `History.json`:

```python
"""
ShareX Capture History & File Manifest Auditor
Parses ShareX History.json to extract recent captures, timestamps, and upload destination URLs.
"""

import sys
import os
import json

HISTORY_PATH = os.path.expandvars(r"%USERPROFILE%\Documents\ShareX\History.json")

def audit_sharex_history(history_file: str = HISTORY_PATH):
    if not os.path.exists(history_file):
        print(f"Error: ShareX history file not found at '{history_file}'.")
        return

    print(f"--- [AUDITING SHAREX CAPTURE HISTORY: {history_file}] ---")
    try:
        with open(history_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        entries = data if isinstance(data, list) else data.get("History", [])
        print(f"Total Recorded Captures: {len(entries)}\n")

        print("Recent 5 Capture Events:")
        for item in entries[-5:]:
            filename = item.get("FileName", "Unknown")
            timestamp = item.get("DateTime", "Unknown Time")
            filepath = item.get("FilePath", "")
            url = item.get("URL", "No Upload URL")

            print(f"• [{timestamp}] {filename}")
            print(f"    Path: {filepath}")
            if url != "No Upload URL":
                print(f"    URL:  {url}")

        print("\n✅ ShareX capture history parsed successfully.")

    except Exception as e:
        print(f"Failed to parse history: {e}")

if __name__ == "__main__":
    audit_sharex_history()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **ShareX Automatically Uploads Private Screenshots** | "Upload image to host" is checked in "After capture tasks". | In Main Window $\rightarrow$ Click **After capture tasks** $\rightarrow$ Uncheck **Upload image to host** to keep captures strictly local. |
| **Annotator Blur Tool Leaves Text Readable** | Blur radius is too low for high-resolution 4K text. | In Annotator toolbar, increase **Blur Radius** to $\ge 20\text{px}$ or use the **Pixelate** tool with large block sizes. |
| **Magnifier Loupe Stutters During Region Selection** | Hardware acceleration conflict with multi-monitor mixed refresh rates ($144\text{Hz}$ + $60\text{Hz}$). | In *Application settings $\rightarrow$ General*, uncheck **Use hardware acceleration for region capture**. |
| **Scrolling Capture Stitches Distorted / Overlapping Images** | Web page has a sticky fixed header or dynamic floating navigation bar. | In Scrolling Capture window, adjust **Top margin crop** to exclude the fixed sticky navbar from the stitching engine. |

---

## Command Line Syntax & Server Control

```bash
# Launch ShareX GUI
"C:\Program Files\ShareX\ShareX.exe"

# Open ShareX Image Annotator with Specific Image File
"C:\Program Files\ShareX\ShareX.exe" -ImageEditor "C:\Images\screenshot.png"
```

### Key Configuration Locations
- **Application Config**: `%USERPROFILE%\Documents\ShareX\ApplicationConfig.json`
- **Capture Output**: `%USERPROFILE%\Documents\ShareX\Screenshots\`

---

## Agent Operational Directive
> **MANDATORY**: For security compliance, always verify that "Upload image to host" is disabled in After Capture Tasks unless the user explicitly requests automated remote sharing.
