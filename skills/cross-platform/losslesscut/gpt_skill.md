---
title: "LosslessCut Stream Editor AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize LosslessCut batch pipelines, .llc project schemas, and automated silence trimming."
category: "Lossless Video/Audio Trimmer & Stream Editor"
tags: ["losslesscut", "silence-cutter", "stream-copy", "gpt-codex", "llc-schema", "media-automation"]
---

# LosslessCut Stream Editor AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
LosslessCut is an Electron-based GUI wrapping FFmpeg's stream-copying capabilities. GPT/Codex acts as a Principal Media Automation Developer and Tooling Architect, delivering **automated silence-detection and cutting scripts**, **LosslessCut `.llc` project format generators**, **batch EDL/CSV converters**, and **headless stream manipulation utilities**.

### Pipeline Architecture & Developer Layer

```
┌─────────────────────────────────────────────────────────────┐
│                 LosslessCut Developer Stack                 │
│                                                             │
│  Data Formats & Segment Manifests                           │
│  ├── `.llc` JSON Project Schema (Cut Segment Arrays)        │
│  ├── CSV / TSV / EDL (Edit Decision List) Import/Export     │
│  └── Chapter Markers & Metadata Extraction                  │
│                                                             │
│  Automation & Pipeline Interfaces                           │
│  ├── Automated Silence Detection (`silencedetect` filter)   │
│  ├── Headless Batch Trimmer & Concat Multiplexer            │
│  └── Electron CLI Launch Flags (`lossless-cut --open ...`)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Automated Silence Removal**: Author Python scripts combining FFmpeg's `silencedetect` audio filter with LosslessCut `.llc` manifest generation to automatically strip dead silence from podcasts and tutorials.
2. **EDL & CSV Format Conversion**: Script converters between Premiere/DaVinci Edit Decision Lists (`.edl`), YouTube timestamp chapters, and LosslessCut `.llc` formats.
3. **Lossless Multi-Segment Concat Slicing**: Build end-to-end automation pipelines that slice 20+ highlights from a raw recording and concatenate them into a single file with zero generational quality loss.
4. **Header Healing & Muxing**: Remediate damaged container timebases and missing audio track headers before batch slicing.

---

## Production Python Automation: Auto-Silence Detector & LosslessCut Project Generator

Run this script to scan a video/audio file for silence ($<-30\text{dB}$ for $>0.8\text{s}$) and automatically generate a LosslessCut project file containing all active speech segments:

```python
"""
Automated Silence Detector & LosslessCut Project Generator
Uses FFmpeg silencedetect to build a non-destructive .llc project.
"""

import sys
import os
import subprocess
import re
import json

def detect_speech_segments(media_path: str, noise_threshold_db: float = -30.0, min_silence_sec: float = 0.8):
    # 1. Run FFmpeg silencedetect
    cmd = [
        "ffmpeg", "-i", media_path,
        "-af", f"silencedetect=noise={noise_threshold_db}dB:d={min_silence_sec}",
        "-f", "null", "-"
    ]
    
    print(f"Scanning {media_path} for active speech segments...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    
    # 2. Parse Silence Start and End Timestamps
    silence_starts = []
    silence_ends = []
    
    for line in res.stderr.splitlines():
        if "silence_start:" in line:
            match = re.search(r"silence_start:\s*([\d\.]+)", line)
            if match:
                silence_starts.append(float(match.group(1)))
        elif "silence_end:" in line:
            match = re.search(r"silence_end:\s*([\d\.]+)", line)
            if match:
                silence_ends.append(float(match.group(1)))

    # Get total media duration
    dur_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", media_path]
    dur_res = subprocess.run(dur_cmd, capture_output=True, text=True)
    total_duration = float(dur_res.stdout.strip()) if dur_res.stdout else 0.0

    # 3. Calculate Speech Invert Segments
    speech_segments = []
    current_time = 0.0

    for s_start, s_end in zip(silence_starts, silence_ends):
        if s_start > current_time:
            speech_segments.append((current_time, s_start))
        current_time = s_end

    if current_time < total_duration:
        speech_segments.append((current_time, total_duration))

    print(f"Identified {len(speech_segments)} active speech segments.")
    return speech_segments

def generate_llc_file(media_path: str, segments: list, output_llc: str):
    project_json = {
        "version": 1,
        "mediaFileName": os.path.basename(media_path),
        "cutSegments": [
            {"start": start, "end": end, "name": f"Speech_Chunk_{i+1}", "color": "#2196f3"}
            for i, (start, end) in enumerate(segments)
        ]
    }
    with open(output_llc, "w", encoding="utf-8") as f:
        json.dump(project_json, f, indent=2)
    print(f"Successfully created LosslessCut project: {output_llc}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python auto_silence_cut.py <input_video.mp4>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    llc_target = f"{input_file}-proj.llc"
    speech = detect_speech_segments(input_file)
    generate_llc_file(input_file, speech, llc_target)
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`Error: Segment export failed with exit code 1`** | Output filename contains forbidden OS characters or target path is write-protected. | 1. In LosslessCut Settings, check **Output file name template**.<br>2. Ensure path does not contain illegal characters (`:`, `?`, `*`, `"`).<br>3. Verify disk space for combined segment size. |
| **Concatenated Output Has Desynced Audio** | Individual spliced segments had differing timebase fractions or initial audio PTS offsets. | 1. In LosslessCut, enable **Merge with standard concat demuxer**.<br>2. Ensure all segments originated from the exact same source file.<br>3. Set Audio Stream handling to `Copy`. |
| **Imported CSV Timestamps Shift by Several Seconds** | CSV was formatted in NTSC Drop-Frame timecode (29.97 DF) while LosslessCut parsed it as decimal seconds. | Convert all timestamps to raw decimal seconds (`SS.MMM` or `HH:MM:SS.mmm`) prior to generating `.llc` JSON or CSV imports. |
| **LosslessCut Fails to Launch on Linux Wayland** | Electron Chromium hardware acceleration incompatibility on Wayland display servers. | Launch with ozone platform flags: `lossless-cut --ozone-platform=wayland --enable-features=UseOzonePlatform`. |

---

## Command Line Syntax & Batch Processing

```bash
# Launch LosslessCut with Pre-Generated Project
lossless-cut "C:\Media\Podcast.mp4" "C:\Media\Podcast.mp4-proj.llc"

# Batch Merge Cut Segments via Concat Protocol
ffmpeg -f concat -safe 0 -i cut_manifest.txt -c copy -movflags +faststart final_cut.mp4
```

### Essential File Locations
- **Windows User Settings**: `%APPDATA%\lossless-cut`
- **Linux User Settings**: `~/.config/lossless-cut`

---

## Agent Operational Directive
> **MANDATORY**: When generating LosslessCut manifests, format cut segments into standard `.llc` JSON schemas with floating-point seconds. Always specify `-avoid_negative_ts make_zero` when executing downstream FFmpeg concat operations.
