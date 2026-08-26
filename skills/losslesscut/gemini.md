---
title: "LosslessCut Stream Editor AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot LosslessCut workflows, Smart Cut GOP boundaries, and timeline keyframes."
category: "Lossless Video/Audio Trimmer & Stream Editor"
tags: ["losslesscut", "keyframe-diagnostics", "smart-cut", "gemini", "video-timeline", "lossless-editing"]
---

# LosslessCut Stream Editor AI Skill Guide (Gemini)

## Overview & Engine Architecture
LosslessCut enables instant, non-destructive video and audio trimming without re-encoding by directly manipulating packet bitstreams. Gemini acts as an AI Video Quality Analyst and Editing Assistant, specializing in **multimodal timeline keyframe inspection**, **Smart Cut boundary verification**, **audio waveform synchronization**, and **lossless multi-segment batch export**.

### Timeline Architecture & Keyframe Mechanics

```
┌─────────────────────────────────────────────────────────────┐
│                 LosslessCut Timeline Stack                  │
│                                                             │
│  Visual Timeline & Waveform Layer                           │
│  ├── Scrubbing Engine (Keyframe Snapping vs Normal Seek)    │
│  ├── Multi-Segment In/Out Marker Tags (Start/End Segments)  │
│  └── Audio Waveform & Peak Meter Analysis                   │
│                                                             │
│  Stream Processing Layer                                    │
│  ├── Stream Copy Engine (Lossless direct bitstream transfer)│
│  ├── Smart Cut Partial Re-encoder (Boundary GOP synthesis)  │
│  └── Format Remuxer (Change container MP4/MKV/MOV/TS)       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Keyframe Inspection**: Analyze screenshots of the LosslessCut timeline to verify whether cut markers are placed on Keyframe indicators (`K` icon) or intermediate delta frames.
2. **Audio Waveform Beat/Silence Detection**: Direct users to precise zero-crossing audio points and silence gaps between spoken phrases to avoid clipped words or audio pops.
3. **Smart Cut Quality Assurance**: Troubleshoot Smart Cut re-encoding parameters (CRF, preset, pixel format) to ensure seamless visual transitions between re-encoded boundary segments and untouched pass-through GOPs.
4. **Segment JSON Configuration**: Construct `.llc` JSON files to programmatically load complex highlight reels with predefined cut ranges.

---

## Production Python Automation: LosslessCut Project File Generator (`.llc`)

Execute this script to generate a LosslessCut project file (`.llc`) from a list of start/end timestamps, ready for opening directly in the GUI:

```python
"""
LosslessCut Project File (.llc) Generator
Creates a declarative multi-segment project file for LosslessCut.
"""

import json
import os

def create_losslesscut_project(media_file: str, segments: list, output_llc_path: str):
    project_data = {
        "version": 1,
        "mediaFileName": os.path.basename(media_file),
        "cutSegments": []
    }

    for idx, (start, end, label) in enumerate(segments):
        project_data["cutSegments"].append({
            "start": float(start),
            "end": float(end),
            "name": label or f"Segment_{idx+1}",
            "color": "#4caf50"
        })

    os.makedirs(os.path.dirname(os.path.abspath(output_llc_path)), exist_ok=True)
    with open(output_llc_path, "w", encoding="utf-8") as f:
        json.dump(project_data, f, indent=2)

    print(f"Successfully generated LosslessCut project: {output_llc_path}")

if __name__ == "__main__":
    example_segments = [
        (12.5, 45.0, "Intro_Highlight"),
        (120.0, 185.2, "Product_Demo"),
        (310.4, 450.0, "Closing_Remarks")
    ]
    create_losslesscut_project("C:/Media/Presentation.mp4", example_segments, "C:/Media/Presentation.mp4-proj.llc")
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **First Frame of Trimmed Clip Shows Corrupted Smearing** | Cut point split a P-frame that references previous missing frames outside the trimmed range. | 1. Jump to the nearest previous Keyframe using `Shift + Left Arrow`.<br>2. Enable **Smart Cut** mode in export settings.<br>3. Verify keyframe indicator displays green `Keyframe` label. |
| **Audio Pop / Click at Edit Boundary** | Audio was sliced mid-waveform at high amplitude rather than at a zero-crossing point. | 1. Zoom into the audio waveform in the timeline.<br>2. Align the cut point to a natural silence gap or zero amplitude line.<br>3. Enable short audio cross-fade in export settings if available. |
| **Exported File Out of Sync When Imported into Adobe Premiere** | Target container had Variable Frame Rate (VFR); NLE requires Constant Frame Rate (CFR). | 1. Lossless cutting preserves original VFR timestamps.<br>2. If editing in Premiere/DaVinci, transcode to ProRes or CFR H.264 using FFmpeg (`-vsync cfr`). |
| **LosslessCut Viewport Displays Black Screen on HEVC/H.265** | System graphics hardware lacks native Chromium/Electron HEVC hardware decoding support. | 1. In LosslessCut Settings, enable **Enable Hardware Accelerated Decoding**.<br>2. Or set Fallback Video Player to internal software decoder. |

---

## Command Line Syntax & Batch Processing

```bash
# Launch LosslessCut with Project File
lossless-cut "C:\Media\Presentation.mp4" "C:\Media\Presentation.mp4-proj.llc"

# Batch Extract All Segments Losslessly via FFmpeg
ffmpeg -ss 12.5 -to 45.0 -i Presentation.mp4 -c copy -avoid_negative_ts 1 seg1.mp4
```

### Essential File Locations
- **Windows User Settings**: `%APPDATA%\lossless-cut`
- **macOS User Settings**: `~/Library/Application Support/lossless-cut`

---

## Agent Operational Directive
> **MANDATORY**: Inspect video timeline markers to guarantee alignment with keyframe (I-frame) boundaries. When frame-accurate precision is required on delta frames, enable Smart Cut to prevent video smearing.
