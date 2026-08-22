---
title: "MacWhisper On-Device Speech-to-Text AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot MacWhisper transcript viewers, audio waveforms, speaker tags, and subtitle exports."
category: "Local AI Audio Transcription & Speech-to-Text"
tags: ["macwhisper", "speech-to-text", "audio-waveform", "gemini", "speaker-diarization", "srt-subtitles"]
---

# MacWhisper On-Device Speech-to-Text AI Skill Guide (Gemini)

## Overview & Engine Architecture
MacWhisper features a streamlined native macOS interface offering real-time transcript editing, interactive audio waveform scrubbers, speaker diarization labeling, and multi-format subtitle exporters. Gemini acts as an AI Audio & Speech Systems Reviewer, specializing in **multimodal MacWhisper transcript viewer inspection**, **audio waveform timeline synchronization**, **speaker diarization consistency audits**, and **subtitle layout validation**.

### Visual Analytics & Transcription Interface Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 MacWhisper Visual Operations                │
│                                                             │
│  Transcript & Waveform Inspection                           │
│  ├── Interactive Audio Waveform Timeline (Scrub & Playback) │
│  ├── Synchronized Text Paragraph Blocks (Timecode Chips)    │
│  └── Speaker Diarization Badges (Speaker 1, Speaker 2...)   │
│                                                             │
│  Model & Export Configuration                               │
│  ├── Model Manager HUD (Download Progress, VRAM Indicators) │
│  ├── Export Format Selector (SRT, VTT, PDF, CSV, Word, JSON)│
│  └── Subtitle Segment Splitter (Character / Line Limit)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Transcript Inspection**: Analyze screenshots of MacWhisper transcript viewports to detect timestamp desynchronization, phonetic misspellings of specialized technical jargon, and missing sentence punctuation.
2. **Audio Waveform & Segment Alignment**: Correlate visual speech energy bursts on the waveform timeline with active subtitle timecode ranges.
3. **Speaker Diarization Review**: Validate that speaker tag switches match distinct conversational voice turns without erratic mid-sentence speaker flips.
4. **Subtitle Formatting & Line Breaking**: Ensure generated SRT and VTT files respect cartographic broadcasting standards (maximum 37-42 characters per line, maximum 2 lines per subtitle card).

---

## Production Python Automation: Automated SRT Subtitle Formatter & Line-Wrap Auditor

Execute this script to validate and auto-wrap long subtitle lines in an exported SRT file to meet broadcast standards:

```python
"""
SRT Subtitle Formatting & Character Limit Auditor
Validates subtitle line lengths and wraps segments exceeding 42 characters per line.
"""

import sys
import os
import re

MAX_CHARS_PER_LINE = 42
MAX_LINES_PER_CARD = 2

def audit_and_format_srt(srt_file: str, output_file: str):
    if not os.path.exists(srt_file):
        print(f"Error: Subtitle file '{srt_file}' not found.")
        return

    print(f"--- [AUDITING SUBTITLE BROADCAST COMPLIANCE: {srt_file}] ---")
    
    with open(srt_file, "r", encoding="utf-8") as f:
        content = f.read()

    blocks = content.strip().split("\n\n")
    formatted_blocks = []
    issues_found = 0

    for block in blocks:
        lines = block.split("\n")
        if len(lines) < 3:
            formatted_blocks.append(block)
            continue

        idx = lines[0]
        timecode = lines[1]
        raw_text = " ".join(lines[2:])

        # Wrap text to max characters per line
        words = raw_text.split()
        wrapped_lines = []
        current_line = []
        current_len = 0

        for word in words:
            if current_len + len(word) + (1 if current_line else 0) <= MAX_CHARS_PER_LINE:
                current_line.append(word)
                current_len += len(word) + (1 if len(current_line) > 1 else 0)
            else:
                wrapped_lines.append(" ".join(current_line))
                current_line = [word]
                current_len = len(word)
        if current_line:
            wrapped_lines.append(" ".join(current_line))

        if len(wrapped_lines) > MAX_LINES_PER_CARD:
            issues_found += 1

        new_block = f"{idx}\n{timecode}\n" + "\n".join(wrapped_lines)
        formatted_blocks.append(new_block)

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n\n".join(formatted_blocks) + "\n")

    print(f"Audit Complete! Re-formatted {len(blocks)} subtitle cards.")
    if issues_found:
        print(f"⚠️ Warning: {issues_found} cards exceeded {MAX_LINES_PER_CARD} lines (consider splitting timecodes).")
    else:
        print("✅ All subtitle cards meet 42-char broadcast readability standards.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 audit_srt.py <subtitles.srt> [output_formatted.srt]")
        sys.exit(1)
    out = sys.argv[2] if len(sys.argv) > 2 else "formatted_" + os.path.basename(sys.argv[1])
    audit_and_format_srt(sys.argv[1], out)
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Subtitle Text Overflows Screen Edges in Video Player** | Subtitle cards exported without character wrapping constraints (>80 characters on a single line). | 1. In MacWhisper Export $\rightarrow$ **SRT Options**, set *Max Characters per Line* to **42**.<br>2. Set *Max Lines* to **2**. |
| **Speaker Tags Display as `Unknown Speaker`** | Audio quality too degraded or signal-to-noise ratio too low for acoustic clustering. | In MacWhisper, double-click the speaker label chip on the transcript to manually rename and merge speakers. |
| **Model Download Progress Bar Stalls at 99%** | Network timeout during final Core ML / ANE model compilation step. | Allow 1-2 minutes for Apple Neural Engine compilation. If hung, delete incomplete file in `~/Library/Application Support/com.goodcode.MacWhisper/` and re-download. |
| **Transcript Text Lacks Capitalization and Punctuation** | Model variant selected was an un-punctuated base model or language was set to generic code without casing. | Ensure target language is set to **English** (or specific source language) and select **Large-v3-Turbo**. |

---

## Command Line Syntax & Server Control

```bash
# Launch MacWhisper
open -a MacWhisper

# Verify Apple Silicon Neural Engine Availability
sysctl hw.optional.arm64
```

### Key Configuration Locations
- **Model Files**: `~/Library/Application Support/com.goodcode.MacWhisper/`
- **Application Preferences**: `~/Library/Preferences/com.goodcode.MacWhisper.plist`

---

## Agent Operational Directive
> **MANDATORY**: When exporting SRT/VTT subtitles from MacWhisper for video production, enforce a maximum constraint of 42 characters per line and 2 lines per card to guarantee professional viewer legibility.
