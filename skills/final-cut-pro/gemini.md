---
title: "Apple Final Cut Pro NLE AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Final Cut Pro Magnetic Timelines, Video Scopes, Color Wheels/Curves, and Motion Template browsers."
category: "Professional macOS Video Editing"
tags: ["final-cut-pro", "magnetic-timeline-ui", "video-scopes-fcpx", "gemini", "color-wheels-fcp", "motion-templates-ui"]
---

# Apple Final Cut Pro NLE AI Skill Guide (Gemini)

## Overview & Engine Architecture
Final Cut Pro provides an efficient, visual editing canvas centered around the **Magnetic Timeline (Primary Storyline with connected audio/video shelves)**, **Integrated Video Scopes (Waveform, Vectorscope, Histogram)**, **Color Inspector (Color Wheels, Color Curves, Hue/Saturation Curves, Color Board)**, and the **Motion 5 Templates & Generators browser**. Gemini acts as an AI Video Editor Reviewer and macOS Creative Workflow Auditor, specializing in **multimodal Magnetic Timeline collision review**, **exposure & HDR grading verification**, **connected clip sync diagnostics**, and **Motion graphics alignment**.

### Visual Analytics & Creative Editing Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Final Cut Pro Visual Operations             │
│                                                             │
│  Editing & Magnetic Timeline Viewports                      │
│  ├── Magnetic Timeline (Primary Storyline, Connected Clips) │
│  ├── Roles Color Matrix (Video=Blue, Audio=Green, Music=Gold│
│  └── Angle Editor (Multi-Angle Multicam Grid Viewer)        │
│                                                             │
│  Color Grading & Video Scopes                               │
│  ├── Video Scopes HUD (Waveform IRE Scale, Vectorscope 360°)│
│  ├── Color Wheels (Master, Shadows, Midtones, Highlights)   │
│  └── Color Curves & Hue vs Saturation Eye-Dropper HUD       │
│                                                             │
│  Effects, Audio & Motion Graphics                           │
│  ├── Motion Templates Browser (Titles, Transitions, Gen.)  │
│  └── Audio Inspector (Voice Isolation AI & Noise Removal)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Magnetic Timeline Inspection**: Analyze screenshots of the Magnetic Timeline to detect accidental ripple gaps, unassigned audio Roles (Dialogue, Effects, Music), connected clip pin displacements, and disabled clip indicators (greyed out).
2. **Video Scope Exposure & Dynamic Range Review**: Evaluate Waveform monitors to verify that video signals stay within $0-100\text{ IRE}$ for SDR or reach up to $1000\text{ nits}$ for HDR10/PQ deliverables without clipping.
3. **Color Wheels & Color Curve Diagnostics**: Inspect Color Inspector wheels to ensure white balance balance corrections neutralize color casts in the shadows while preserving warm skin tone highlights.
4. **Voice Isolation & Audio Level Compliance**: Review audio waveforms and peak meters, ensuring dialogue levels average between $-12\text{dB}$ and $-6\text{dB}$ with Voice Isolation AI applied to noisy field recordings.

---

## Production Python Automation: Automated Final Cut Pro Library (`.fcpbundle`) Storage Auditor

Final Cut Pro Libraries are macOS package directories. Run this script to audit internal storage consumption (Original Media, High-Res Render Files, Proxies) inside a `.fcpbundle` package:

```python
"""
Final Cut Pro Library (.fcpbundle) Storage & Render Cache Auditor
Scans .fcpbundle package directories to calculate disk space consumed by render caches vs original media.
"""

import sys
import os

def audit_fcp_library(library_path: str):
    if not os.path.exists(library_path):
        print(f"Error: Library path '{library_path}' not found.")
        return

    print(f"--- [AUDITING FINAL CUT PRO LIBRARY STORAGE: {library_path}] ---")
    
    total_size = 0
    render_size = 0
    original_size = 0
    proxy_size = 0

    for root, dirs, files in os.walk(library_path):
        for f in files:
            fp = os.path.join(root, f)
            try:
                sz = os.path.getsize(fp)
                total_size += sz

                if "Render Files" in root or "High Quality Media" in root:
                    render_size += sz
                elif "Original Media" in root:
                    original_size += sz
                elif "Proxy Media" in root:
                    proxy_size += sz
            except Exception:
                continue

    def to_gb(b):
        return b / (1024 * 1024 * 1024)

    print(f"• Total Library Size:      {to_gb(total_size):>8.2f} GB")
    print(f"• Original Media Size:    {to_gb(original_size):>8.2f} GB")
    print(f"• Generated Render Files: {to_gb(render_size):>8.2f} GB ({render_size/max(total_size,1)*100:.1f}%)")
    print(f"• Proxy Media Size:       {to_gb(proxy_size):>8.2f} GB\n")

    if render_size > (total_size * 0.4) and render_size > 10 * 1024 * 1024 * 1024:
        print("🚨 WARNING: Render cache files consume over 40% of library storage!")
        print("💡 Recommendation: In Final Cut Pro, run File -> Delete Generated Library Files -> Delete Render Files (All).")
    else:
        print("✅ Library storage distribution is healthy.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 audit_fcp_library.py <PathToLibrary.fcpbundle>")
        sys.exit(1)
    audit_fcp_library(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Connected Clip Moves When Editing Primary Storyline** | Connected clip pin is attached to an upstream cut that was rippled or trimmed. | Hold the grave accent / tilde key (`` ` ``) while dragging primary storyline clips to move them without displacing connected B-roll. |
| **Audio Roles Output Collides in Final Mix** | Sub-roles (e.g. Dialogue vs Effects) not separated into discrete Audio Lanes. | In Timeline Index $\rightarrow$ Roles tab, click **Show Audio Lanes** to expand isolated tracks for mixing. |
| **Waveform Monitor Shows Crushed Blacks ($<0\text{ IRE}$)** | Log footage imported without applying appropriate Camera LUT in Inspector. | In Info Inspector $\rightarrow$ Set View to **Extended** $\rightarrow$ Under **Camera LUT**, select matching camera profile (e.g. Sony S-Log3 / Apple Log). |
| **Title Text Appears Pixelated on 4K Export** | Title Motion Template originally created at 1080p without scalable vector text. | In Motion 5, open the Title template and set Project Resolution to **4K UHD (3840x2160)**. |

---

## Command Line Syntax & Server Control

```bash
# Launch Final Cut Pro Directly
open -a "Final Cut Pro"

# Inspect Active Final Cut Pro Bundle Memory Usage via macOS ps
ps aux | grep -i "Final Cut Pro"
```

### Key Configuration Locations
- **FCP Preferences**: `~/Library/Preferences/com.apple.FinalCut.plist`
- **Application Support**: `~/Library/Application Support/Final Cut Pro/`

---

## Agent Operational Directive
> **MANDATORY**: When inspecting bloated Final Cut Pro library bundles, guide users to run "Delete Generated Library Files" to eliminate cached render files before advising hardware storage upgrades.
