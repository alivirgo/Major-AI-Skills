---
title: "Shottr macOS Screen Capture & Annotation AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Shottr editor HUDs, annotation toolbars, pixelation filters, and on-screen pixel rulers."
category: "Screen Capture & Image Annotation Utility"
tags: ["shottr", "macos-screen-capture", "annotation-hud", "gemini", "pixel-ruler", "color-picker"]
---

# Shottr macOS Screen Capture & Annotation AI Skill Guide (Gemini)

## Overview & Engine Architecture
Shottr provides a low-latency annotation canvas featuring vector callouts, smart pixelation tools, automatic object/text erasing, a sub-pixel color sampler, and on-screen measurement rulers. Gemini acts as an AI Technical Art Reviewer and Visual Interface Auditor, specializing in **multimodal Shottr annotation viewport inspection**, **redaction/blur safety verification**, **pixel measurement accuracy checks**, and **color contrast evaluations**.

### Visual Analytics & Annotation Canvas Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Shottr Visual Operations Stack              │
│                                                             │
│  Editor HUD & Canvas Presentation                           │
│  ├── Main Annotation Viewport (Retina 2x/1x Bitmap Canvas)  │
│  ├── Vector Markup Toolbar (Arrows, Text, Callout Bubbles)  │
│  ├── Step Counter Badges (Auto-Incrementing Numbered Pins)  │
│  └── Live OCR Text Selection Bounding Boxes                 │
│                                                             │
│  Measurement & Redaction Overlays                           │
│  ├── Pixel Ruler HUD (Width x Height Delta Markers)         │
│  ├── Magnifier & Hex Color Sampler (`#RRGGBB` / `NSColor`)  │
│  └── Blur & Mosaic Pixelation Shaders (Irreversible Masks)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Annotation Canvas Inspection**: Analyze screenshots within Shottr's editor to ensure vector arrows clearly point to target UI elements, step badge numbers follow logical sequences, and callout text is legible against background colors.
2. **Redaction & Privacy Safety Auditing**: Verify that sensitive information (*API keys, passwords, personal identifiable information / PII*) is completely obscured by irreversible pixelation/solid blackout masks rather than translucent blur filters.
3. **Pixel Ruler & Alignment Diagnostics**: Validate on-screen spacing, padding, and alignment metrics across design mockups.
4. **Color Picker & Contrast Validation**: Evaluate sampled hex colors against WCAG AAA contrast ratios for accessibility.

---

## Production Python Automation: Automated Image Redaction & Blackout Verification

Execute this script to verify that sensitive rectangular regions in an annotated screenshot are completely stripped of original RGB pixel data:

```python
"""
Screenshot Redaction & Information Leakage Auditor
Inspects bounding boxes in an image to verify complete pixel blackouts.
"""

import sys
import os
from PIL import Image

def verify_redaction(image_path: str, bbox: tuple):
    """
    bbox format: (left, top, right, bottom)
    """
    if not os.path.exists(image_path):
        print(f"Error: Image file '{image_path}' not found.")
        return

    img = Image.open(image_path).convert("RGB")
    cropped = img.crop(bbox)
    pixels = list(cropped.getdata())

    # Check if all pixels within the redaction box are identical (e.g. solid black #000000)
    unique_colors = set(pixels)
    print(f"--- [AUDITING REDACTION BOX: {bbox}] ---")
    print(f"Total Pixels in Box: {len(pixels)}")
    print(f"Unique Colors Detected: {len(unique_colors)}")

    if len(unique_colors) == 1:
        color = list(unique_colors)[0]
        print(f"✅ PASS: Solid opaque mask detected (RGB: {color}). Zero data leakage.")
    elif len(unique_colors) < 10:
        print("⚠️ NOTICE: Pixelated mask detected. Ensure text characters cannot be reconstructed.")
    else:
        print("🚨 FAIL: High color variance inside redaction box! Mask may be translucent or missing.")

if __name__ == "__main__":
    if len(sys.argv) < 6:
        print("Usage: python3 verify_redaction.py <screenshot.png> <left> <top> <right> <bottom>")
        sys.exit(1)

    box = (int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]))
    verify_redaction(sys.argv[1], box)
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Pixelated Text Remains Partially Legible** | Pixelation grid cell size configured too small, allowing character shapes to remain distinguishable. | In Shottr Editor, select **Erase / Blackout** instead of blur, or increase pixelation block size in preferences. |
| **Annotation Tools Render Blurry on 4K External Display** | Shottr canvas bitmap buffer rendered at 1x scale on an uncalibrated display. | In Shottr Preferences $\rightarrow$ **General**, verify **Capture in Retina 2x resolution** is enabled. |
| **Color Picker Shows Shifted Hex Values in Chrome** | Browser color profile (sRGB vs Display P3) causing color space translation shifts. | In Shottr Settings $\rightarrow$ **Color Picker**, select default color space format (**sRGB Hex**). |
| **Auto-Save Overwrites Original Screenshot** | Direct overwrite setting enabled in Shottr auto-export workflow. | In Preferences $\rightarrow$ **Saving**, set destination to a dedicated `~/Screenshots/` folder with timestamped filenames. |

---

## Command Line Syntax & Server Control

```bash
# Launch Shottr
open -a Shottr

# Inspect Shottr File Preferences
defaults read cc.ffitch.shottr
```

### Key Configuration Locations
- **Preferences Plist**: `~/Library/Preferences/cc.ffitch.shottr.plist`
- **Default Screenshots Folder**: Configurable inside `cc.ffitch.shottr.plist`

---

## Agent Operational Directive
> **MANDATORY**: For security-critical documents and screenshots, always enforce solid opaque blackout masks rather than translucent blur filters to guarantee that OCR engines cannot reconstruct redacted credentials.
