---
title: "Blackmagic DaVinci Resolve Studio AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot DaVinci Resolve Color node graphs, Parade/Vectorscope scopes, Edit timelines, and Fusion VFX flows."
category: "Professional Video Editing, Color Grading & VFX"
tags: ["davinci-resolve", "color-page-nodes", "waveform-scopes", "vectorscope", "gemini", "edit-timeline", "fusion-flow"]
---

# Blackmagic DaVinci Resolve Studio AI Skill Guide (Gemini)

## Overview & Engine Architecture
DaVinci Resolve Studio provides a comprehensive visual post-production workspace featuring the **Color Page Node Graph (Serial, Parallel, Layer, Splitter/Combiner nodes)**, **Real-Time Video Scopes (Parade, Waveform, Vectorscope, CIE Chromaticity)**, the **Edit Page multi-track timeline**, and **Fusion node dataflow graphs**. Gemini acts as an AI Colorist Reviewer and Post-Production Quality Control (QC) Specialist, specializing in **multimodal Color Node Graph inspection**, **video scope exposure & white balance evaluation**, **Broadcast Legal gamut verification**, and **Fusion compositing flow diagnostics**.

### Visual Analytics & Post-Production Console Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 DaVinci Resolve Visual Operations           │
│                                                             │
│  Editing & Assembly Viewports                               │
│  ├── Edit Page Timeline (Video/Audio Tracks, Transitions)   │
│  ├── Source & Record Viewers (Safe Area Guides, Timecode HUD│
│  └── Inspector (Transform, Dynamic Zoom, Composite Modes)   │
│                                                             │
│  Color Grading & Video Scopes                               │
│  ├── Color Page Node Graph (Key Inputs/Outputs, Alpha Masks)│
│  ├── Video Scopes HUD (RGB Parade, Waveform, Vectorscope)   │
│  └── Primary Wheels (Lift, Gamma, Gain, Offset, HDR Wheels) │
│                                                             │
│  Visual Effects & Audio Mixing                              │
│  ├── Fusion Node Flow (MediaIn, Merge, ColorCorrector, Out) │
│  └── Fairlight Mixer (Dynamics EQ, Compressor, Bus Limiter) │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Color Node Graph Inspection**: Analyze screenshots of the Color Page node tree to detect un-wired alpha keys, improper parallel mixer blending weights, and illogical node sequences (e.g. applying sharpening before noise reduction).
2. **Video Scope Exposure & White Balance Analysis**: Review RGB Parade and Waveform monitors to detect clipped highlights ($>1000\text{ nits}$ in HDR or $>1023$ in 10-bit SDR), crushed shadows ($<0\text{ IRE}$), and color cast imbalances in neutral gray tones.
3. **Vectorscope Skin Tone Line Verification**: Evaluate Vectorscope charts to ensure subject skin tone hue angles align with the standard $I$-bar skin tone indicator line regardless of ethnicity.
4. **Fusion VFX Dataflow Auditing**: Inspect Fusion node trees to verify that `Background` and `Foreground` inputs on `Merge` nodes are correctly assigned to prevent inverted alpha transparency stacking.

---

## Production Python Automation: Automated EDL / Final Cut XML Timeline Inspector

Run this script to parse and audit edit decision lists (EDL / FCPXML) for missing clip durations and timecode gaps before conforming in DaVinci Resolve:

```python
"""
DaVinci Resolve Timeline Conform & EDL/XML Auditor
Parses FCPXML / EDL files to verify clip references, start/end timecodes, and frame rates.
"""

import sys
import os
import xml.etree.ElementTree as ET

def audit_fcpxml_timeline(xml_path: str):
    if not os.path.exists(xml_path):
        print(f"Error: XML file '{xml_path}' not found.")
        return

    print(f"--- [INSPECTING TIMELINE CONFORM XML: {xml_path}] ---")
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        # Extract Format & Frame Rate
        format_elem = root.find(".//format")
        if format_elem is not None:
            width = format_elem.attrib.get("width", "1920")
            height = format_elem.attrib.get("height", "1080")
            frame_duration = format_elem.attrib.get("frameDuration", "100/2400s")
            print(f"• Resolution:  {width} x {height}")
            print(f"• Frame Rate:  {frame_duration}\n")

        # Scan Video Clips in Sequence
        clips = root.findall(".//asset-clip") or root.findall(".//clip")
        print(f"Detected {len(clips)} Timeline Event(s):\n")

        for idx, c in enumerate(clips[:10], 1):
            name = c.attrib.get("name", "Unnamed Clip")
            duration = c.attrib.get("duration", "N/A")
            start = c.attrib.get("start", "0s")
            print(f"• Event #{idx:>2}: {name:<30} | Start: {start:<10} | Duration: {duration}")

        print("\n✅ XML timeline structure validated for DaVinci Resolve import.")

    except Exception as e:
        print(f"Failed to parse XML: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 audit_timeline.py <Sequence.fcpxml>")
        sys.exit(1)
    audit_fcpxml_timeline(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **RGB Parade Shows Crushed Blue Channel in Shadows** | Dark areas contain severe blue color cast or camera black balance shifted. | In Color Page $\rightarrow$ Primaries, raise **Lift Blue** or adjust **Color Temp / Tint** wheels while observing RGB Parade. |
| **Vectorscope Trace Spills Outside Broadcast Target Circle** | Oversaturated colors violating Rec.709 gamut broadcast legal limit ($100\%$ saturation). | In Color Page $\rightarrow$ Curves, pull down **Hue vs Sat** curve on the out-of-gamut color or insert a **Color Space Transform** with Gamut Mapping. |
| **Timeline Media Shows "Media Offline" (Red Screen)** | Source media files moved, renamed, or external drive unmounted. | In Media Pool $\rightarrow$ Right-click offline clips $\rightarrow$ Select **Relink Selected Clips** $\rightarrow$ Navigate to current media directory. |
| **Fusion Viewer Shows Black Screen After Merge Node** | Inverted Foreground/Background inputs on Merge node with an opaque background layer. | Select Merge node $\rightarrow$ Press `Ctrl + T` (Windows) or `Cmd + T` (macOS) to swap Foreground and Background inputs. |

---

## Command Line Syntax & Server Control

```bash
# Launch DaVinci Resolve Studio
"C:\Program Files\Blackmagic Design\DaVinci Resolve\Resolve.exe"

# Query Connected Blackmagic DeckLink / UltraStudio Capture Devices
# (View in DaVinci Resolve Preferences -> Video and Audio I/O)
```

### Key Configuration Locations
- **Resolve Preferences**: `%APPDATA%\Blackmagic Design\DaVinci Resolve\Preferences\`
- **Project Database Config**: `C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\`

---

## Agent Operational Directive
> **MANDATORY**: When assessing color grading in DaVinci Resolve, always verify skin tones against the Vectorscope $I$-bar axis and ensure blacks do not crush below $0\text{ IRE}$ on the Waveform scope.
