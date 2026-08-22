---
title: "FFmpeg Media Engineering AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot FFmpeg video artifacts, macroblocking, interlacing, and complex filtergraphs."
category: "Multimedia Transcoding & Stream Processing Engine"
tags: ["ffmpeg", "video-diagnostics", "filtergraphs", "gemini", "artifact-analysis", "deinterlacing"]
---

# FFmpeg Media Engineering AI Skill Guide (Gemini)

## Overview & Engine Architecture
FFmpeg is the foundational multimedia engine for video and audio processing across the internet. Gemini acts as an AI Video Quality Analyst and Filtergraph Architect, specializing in **multimodal video compression artifact diagnosis (macroblocking, banding, ringing)**, **interlaced field remediation (YADIF/Bwdif)**, **complex visual overlay filtergraphs**, and **perceptual quality metric evaluation (VMAF, SSIM, PSNR)**.

### Visual Processing Pipeline & Filter Structure

```
┌─────────────────────────────────────────────────────────────┐
│                 FFmpeg Video Processing Stack               │
│                                                             │
│  Input & Demuxing Stream                                    │
│  ├── Container Streams (Audio, Video, Subtitles, Data)      │
│  └── Stream Selection & Mapping Syntax (`-map 0:v:0`)       │
│                                                             │
│  Filtergraph Subsystem (`libavfilter`)                      │
│  ├── Simple Filters (`-vf scale=1920:1080,fps=60`)          │
│  ├── Complex Multi-Stream Graphs (`-filter_complex`)        │
│  └── Quality Metric Computations (libvmaf, ssim, psnr)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Visual Compression Triage**: Evaluate screenshots and video frame sequences to identify compression artifacts: 8x8 DCT macroblocking, 8-bit color banding, comb-like interlacing lines, and motion judder.
2. **Deinterlacing & Telecine Remediation**: Configure adaptive deinterlacers (`-vf yadif=mode=1:parity=-1:deint=1` or `bwdif`) and inverse telecine (`pullup`, `decimate`) for broadcast content.
3. **Complex Filtergraph Construction**: Build multi-stream overlays, Picture-in-Picture (PiP), side-by-side video comparisons, color lut applications, and animated text overlays.
4. **VMAF Perceptual Quality Benchmarking**: Script automated video quality scoring pipelines comparing encoded video against the uncompressed reference file using `libvmaf`.

---

## Production Python Automation: Automated Video Quality Benchmark (VMAF / SSIM)

Execute this script to calculate VMAF and SSIM scores comparing a compressed transcode against the pristine source:

```python
"""
FFmpeg VMAF & SSIM Quality Benchmark Pipeline
Compares distorted/encoded video against reference source.
"""

import sys
import subprocess
import json
import re

def compute_vmaf_score(reference: str, distorted: str):
    # Scale and synchronize streams for VMAF evaluation
    filter_graph = (
        "[1:v][0:v]scale2ref=flags=bicubic[dist][ref]; "
        "[dist]setpts=PTS-STARTPTS[distpts]; "
        "[ref]setpts=PTS-STARTPTS[refpts]; "
        "[distpts][refpts]libvmaf=log_fmt=json:log_path=vmaf_output.json:model=version=vmaf_v0.6.1"
    )

    cmd = [
        "ffmpeg", "-i", reference, "-i", distorted,
        "-filter_complex", filter_graph,
        "-f", "null", "-"
    ]

    print(f"Running VMAF Analysis: {distorted} vs {reference}...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    # Parse VMAF log file
    try:
        with open("vmaf_output.json", "r", encoding="utf-8") as f:
            vmaf_data = json.load(f)
            mean_vmaf = vmaf_data["pooled_metrics"]["vmaf"]["mean"]
            print(f"--- [PERCEPTUAL QUALITY RESULT] ---")
            print(f"Mean VMAF Score: {mean_vmaf:.2f} / 100.0")
            if mean_vmaf >= 93.0:
                print("Rating: Excellent (Imperceptible compression artifacts)")
            elif mean_vmaf >= 80.0:
                print("Rating: Good (Acceptable for web streaming)")
            else:
                print("Rating: Poor (Noticeable visual degradation)")
    except Exception as e:
        print(f"Could not read VMAF log: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python vmaf_benchmark.py <reference.mp4> <transcoded.mp4>")
        sys.exit(1)
    compute_vmaf_score(sys.argv[1], sys.argv[2])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Horizontal Comb Lines During Fast Motion (Interlacing)** | Video source is interlaced (1080i/480i) and displayed on a progressive scan monitor without deinterlacing. | Apply motion-adaptive deinterlacing: `-vf bwdif=mode=1` or `-vf yadif=mode=1`. |
| **Color Banding / Stepping in Dark Gradients / Skies** | 8-bit quantization steps are too coarse in flat gradients. | 1. Encode in 10-bit color: `-c:v libx264 -pix_fmt yuv420p10le`.<br>2. Add subtle temporal dithering before encoding: `-vf deband`.<br>3. Lower CRF value (e.g. 18–20). |
| **Severe Pixelation / Macroblocking during High Motion** | Encoder bitrate budget is constrained, or VBR buffer size is too small (`-bufsize`). | 1. Increase video bitrate or decrease CRF.<br>2. Ensure `-bufsize` is set to 1.5x–2x the `-maxrate`.<br>3. Use `-preset slow` for advanced motion estimation. |
| **Filtergraph Error: `Filter scale has an unconnected output`** | Complex filtergraph syntax error; an intermediate labeled pad was left unmapped. | 1. Ensure all `[tag]` outputs are consumed by subsequent filter inputs or mapped via `-map "[tag]"`.<br>2. Verify semicolons between parallel filter statements. |

---

## Command Line Syntax & Filtergraph Recipes

```bash
# 1. Side-by-Side Video Comparison (Original vs Compressed)
ffmpeg -i reference.mp4 -i encoded.mp4 -filter_complex "[0:v]pad=iw*2:ih[bg]; [bg][1:v]overlay=w" -c:v libx264 -crf 18 comparison.mp4

# 2. Picture-in-Picture (PiP) Overlay with Rounded Corners & Border
ffmpeg -i main.mp4 -i overlay.mp4 -filter_complex "[1:v]scale=480:-1[pip]; [0:v][pip]overlay=main_w-overlay_w-20:main_h-overlay_h-20" -c:a copy pip_output.mp4

# 3. High-Quality Animated GIF with Two-Pass Palette Generation
ffmpeg -i input.mp4 -vf "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 output.gif
```

---

## Agent Operational Directive
> **MANDATORY**: When diagnosing visual compression defects, check bit depth (10-bit eliminates gradient banding) and scan mode (apply `bwdif` deinterlacing to interlaced sources). Use two-pass palette generation for GIF exports.
