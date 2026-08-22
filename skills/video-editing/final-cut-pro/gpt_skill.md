---
title: "Apple Final Cut Pro NLE AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Apple Final Cut Pro, FCPXML DTD v1.11/v1.12, Workflow Extensions, AppleScript, and Apple Compressor CLI."
category: "Professional macOS Video Editing"
tags: ["final-cut-pro", "fcpxml-dtd", "workflow-extensions", "applescript-fcp", "compressor-cli", "gpt-codex", "video-pipeline-dev"]
---

# Apple Final Cut Pro NLE AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Apple Final Cut Pro provides programmatic workflow integration via the **FCPXML Specification (DTD v1.11 / v1.12)**, **Workflow Extensions (embedded JavaScript / WebKit HTML5 UI panels)**, **AppleScript (`tell app "Final Cut Pro"`)**, and the **Apple Compressor CLI (`compressor`)**. GPT/Codex acts as a Principal Post-Production Software Engineer and Apple Workflow Developer, delivering **programmatic FCPXML project generators**, **Workflow Extension web bridges**, **AppleScript editing automations**, and **unattended Compressor batch export pipelines**.

### Developer Architecture & FCPXML Pipeline Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Final Cut Pro Developer Platform            │
│                                                             │
│  FCPXML Schema & Interchange Engine                         │
│  ├── FCPXML DTD v1.11 / v1.12 DOM Structure Builder         │
│  ├── Rational Fraction Time Calculations (`100/2400s`)      │
│  └── Asset Track Matching & Metadata Annotation Tags        │
│                                                             │
│  Workflow Extensions & macOS Automation                     │
│  ├── FCP Workflow Extension WebKit Engine (JavaScript API)  │
│  ├── AppleScript UI & Session Ingress Scripting             │
│  └── Apple Compressor CLI Headless Batch Transcoder         │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **FCPXML v1.11 / v1.12 DOM Generator Development**: Author Python scripts constructing complete FCPXML hierarchies mapping multi-camera angles, synchronized dual-system audio, color correction effects, and markers.
2. **Apple Compressor CLI Batch Automation**: Construct bash and Python scripts orchestrating headless exports with custom `.cmprstng` settings across local and distributed render nodes.
3. **Workflow Extension Integration**: Develop HTML5/JavaScript panels communicating with Final Cut Pro via the Workflow Extension JavaScript bridge to drag-and-drop cloud media directly into active Events.
4. **Timecode Rational Fraction Math**: Implement precise fraction-based time arithmetic (e.g. converting SMPTE timecode `01:23:45:12` to exact FCPXML `frameDuration` fractions).

---

## Production Python Automation: Automated SMPTE Timecode to FCPXML Rational Fraction Converter

Save this script as `timecode_to_fcpxml.py` to calculate exact rational duration strings for Final Cut Pro XML files:

```python
"""
SMPTE Timecode to FCPXML Rational Fraction Converter
Converts standard SMPTE timecodes (HH:MM:SS:FF) into exact FCPXML fraction strings.
"""

import sys
from fractions import Fraction

FRAME_RATES = {
    "23.976": Fraction(1001, 24000),
    "24": Fraction(100, 2400),
    "25": Fraction(100, 2500),
    "29.97": Fraction(1001, 30000),
    "30": Fraction(100, 3000),
    "50": Fraction(100, 5000),
    "59.94": Fraction(1001, 60000),
    "60": Fraction(100, 6000)
}

def timecode_to_fcpxml_fraction(timecode: str, fps: str = "24") -> str:
    if fps not in FRAME_RATES:
        raise ValueError(f"Unsupported frame rate '{fps}'. Supported: {list(FRAME_RATES.keys())}")

    parts = list(map(int, timecode.split(":")))
    if len(parts) != 4:
        raise ValueError("Timecode must be in format 'HH:MM:SS:FF'")

    hours, minutes, seconds, frames = parts
    fps_val = float(fps)

    total_frames = (hours * 3600 * fps_val) + (minutes * 60 * fps_val) + (seconds * fps_val) + frames
    unit_duration = FRAME_RATES[fps]

    total_seconds_fraction = int(total_frames) * unit_duration
    fcpxml_time_str = f"{total_seconds_fraction.numerator}/{total_seconds_fraction.denominator}s"
    return fcpxml_time_str

if __name__ == "__main__":
    test_timecodes = [
        ("00:00:10:00", "24"),
        ("01:15:30:12", "24"),
        ("00:05:00:00", "23.976"),
        ("00:00:01:15", "30")
    ]

    print("--- [SMPTE TIMECODE TO FCPXML RATIONAL FRACTIONS] ---\n")
    for tc, r in test_timecodes:
        frac = timecode_to_fcpxml_fraction(tc, r)
        print(f"• Timecode: {tc} @ {r:>6} fps -> FCPXML: {frac}")
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`Compressor: error -1` on CLI Batch Export** | Compressor daemon `compressord` not initialized or target setting preset missing. | In Terminal, run: `launchctl start com.apple.compressor.transcoder` and verify preset path in `~/Library/Application Support/Compressor/Settings/`. |
| **FCPXML Throws `Unresolved Asset Reference`** | `<asset-clip>` element references an `id` that is not declared inside `<resources>`. | Ensure every `ref` attribute in `<asset-clip ref="rX">` has a corresponding `<asset id="rX">` definition in the `<resources>` block. |
| **AppleScript Fails: `Final Cut Pro got an error: User cancelled`** | Modal dialog (e.g. Missing Media warning) active in Final Cut Pro blocking AppleScript execution. | Dismiss all open dialogs or automate keystrokes (`keystroke return`) before sending script commands. |
| **Timeline Audio Drift on Long Takes** | Frame rate fraction mismatch (e.g. 23.976fps video rendered with 24.000fps XML timecode). | Use exact fractional frame durations (`1001/24000s` for 23.976fps). |

---

## Command Line Syntax & Batch Processing

```bash
# Execute Apple Compressor Batch Export via CLI
compressor -batchname "WebDelivery" -jobpath "/Volumes/Media/Export/" -settingpath "ProRes 422 4K.cmprstng"

# Validate FCPXML Syntax using xmllint
xmllint --noout --dtdvalid "http://developer.apple.com/dtd/fcpxml/1.11/fcpxml.dtd" "Project.fcpxml"
```

### Essential File Locations
- **FCPXML DTD URL**: `http://developer.apple.com/dtd/fcpxml/1.11/fcpxml.dtd`
- **Compressor CLI Binary**: `/Applications/Compressor.app/Contents/MacOS/compressor`

---

## Agent Operational Directive
> **MANDATORY**: When computing FCPXML timestamps for non-integer frame rates (23.976fps, 29.97fps, 59.94fps), always use exact NTSC rational fraction multipliers (`1001/24000s`, `1001/30000s`, `1001/60000s`) to prevent audio sync drift.
