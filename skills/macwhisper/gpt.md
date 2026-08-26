---
title: "MacWhisper On-Device Speech-to-Text AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize MacWhisper, whisper.cpp Core ML bindings, macOS Shortcuts STT actions, and JSON transcript pipelines."
category: "Local AI Audio Transcription & Speech-to-Text"
tags: ["macwhisper", "whisper-cpp", "coreml", "shortcuts-automation", "gpt-codex", "speech-recognition"]
---

# MacWhisper On-Device Speech-to-Text AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
MacWhisper delivers scriptable on-device audio transcription through **macOS Shortcuts integration**, **AppleScript handlers**, and low-level **`whisper.cpp`** CLI bindings. GPT/Codex acts as a Principal Speech Recognition Engineer and macOS Automation Developer, delivering **macOS Shortcuts STT automation workflows**, **batch audio transcribing scripts (`whisper-cli`)**, **automated JSON transcript parsing pipelines**, and **LLM summarization post-processors**.

### Developer Architecture & Whisper.cpp Processing Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 MacWhisper Developer Platform               │
│                                                             │
│  Automation & Shortcut Ingress                              │
│  ├── macOS Shortcuts Actions (Transcribe File, Transcribe Mic│
│  ├── AppleScript Dispatcher (`osascript` Audio Trigger)     │
│  └── Drop Folder Watcher (Automatic Media Transcription)    │
│                                                             │
│  Whisper.cpp Core & Model Pipeline                          │
│  ├── GGML / GGUF Quantized Quantized Weights (`ggml-*.bin`) │
│  ├── Core ML Apple Neural Engine Compiled Graph (`.mlmodelc`)│
│  └── JSON Structured Transcript Stream (`--output-json`)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **macOS Shortcuts & Automator Scripting**: Author shell and Python scripts to trigger automated transcription of new voice memos or meeting recordings using Shortcuts CLI (`shortcuts run ...`).
2. **`whisper.cpp` CLI Pipeline Automation**: Construct high-performance command-line pipelines invoking native `whisper-cli` with Core ML acceleration flags.
3. **Structured JSON Transcript Processing**: Parse, filter, and structure raw Whisper JSON output containing word-level confidence scores and segment probabilities.
4. **Automated LLM Meeting Minutes Extraction**: Chain MacWhisper transcript outputs into automated summarization prompts extracting action items, key decisions, and timestamps.

---

## Production Python Automation: Automated Transcript Ingestion & LLM Action Item Extractor

Save this script as `process_meeting_transcript.py` to parse MacWhisper JSON exports and extract structured action items:

```python
"""
MacWhisper JSON Transcript Ingestion & Action Item Extractor
Parses segment timecodes, speaker labels, and formats structured meeting notes.
"""

import sys
import os
import json
import re

def process_transcript(json_path: str, output_md: str):
    if not os.path.exists(json_path):
        print(f"Error: Transcript file '{json_path}' not found.")
        return

    print(f"Loading MacWhisper Transcript: {json_path}...")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Extract segments (supports MacWhisper and standard Whisper JSON schema)
    segments = data.get("segments", [])
    if not segments:
        print("Error: No transcript segments found in JSON.")
        return

    full_text = []
    action_items = []
    
    # Action item regex trigger phrases
    action_triggers = [
        r"(?:i will|we will|we need to|action item|assigned to|please make sure to|todo)\s+(.*)",
        r"(?:follow up on|schedule a meeting for)\s+(.*)"
    ]

    for seg in segments:
        start_time = seg.get("start", 0.0)
        mins = int(start_time // 60)
        secs = int(start_time % 60)
        timestamp = f"[{mins:02d}:{secs:02d}]"
        speaker = seg.get("speaker", "Speaker")
        text = seg.get("text", "").strip()

        full_text.append(f"**{timestamp} {speaker}:** {text}")

        # Check for action item keywords
        for trigger in action_triggers:
            match = re.search(trigger, text, re.IGNORECASE)
            if match:
                action_items.append((timestamp, text))
                break

    # Build Markdown Summary Report
    with open(output_md, "w", encoding="utf-8") as f:
        f.write("# Meeting Transcript & Action Items Report\n\n")
        f.write(f"**Source File:** `{os.path.basename(json_path)}`  \n")
        f.write(f"**Total Segments:** {len(segments)}  \n\n")

        f.write("## 🎯 Detected Action Items & Commitments\n\n")
        if action_items:
            for ts, item in action_items:
                f.write(f"- {ts} {item}\n")
        else:
            f.write("*No direct action items detected in transcript conversation.*\n")

        f.write("\n## 📝 Full Timestamped Transcript\n\n")
        f.write("\n\n".join(full_text) + "\n")

    print(f"✅ Generated structured report: {output_md}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 process_meeting_transcript.py <transcript.json> [output.md]")
        sys.exit(1)
    out_file = sys.argv[2] if len(sys.argv) > 2 else "meeting_summary.md"
    process_transcript(sys.argv[1], out_file)
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`shortcuts run "Transcribe with MacWhisper"` Hangs** | Target audio file path passed without file URI scheme or contains unescaped special characters. | Pass absolute POSIX path: `shortcuts run "Transcribe" -i "/Users/user/audio.m4a"`. |
| **`whisper.cpp: error loading Core ML model`** | Core ML `.mlmodelc` compiled for a different macOS version or ANE architecture mismatch. | Re-generate Core ML model using `models/generate-coreml-model.sh` in the whisper.cpp repo. |
| **JSON Export Missing `speaker` Field** | Transcription was executed with Speaker Diarization disabled in export settings. | In MacWhisper Settings $\rightarrow$ **Diarization**, enable speaker detection before processing. |
| **High Memory Spike During Batch Folder Transcribing** | Loop spawning multiple simultaneous Whisper instances without releasing memory. | Run batch processing sequentially using a single worker thread queue. |

---

## Command Line Syntax & Batch Processing

```bash
# Run Apple macOS Shortcut for Automated Speech-to-Text
shortcuts run "Transcribe Audio" -i "interview.m4a"

# Run whisper.cpp CLI with Core ML Acceleration
whisper-cli -m models/ggml-large-v3-turbo.bin -f audio.wav --output-srt --output-json
```

### Essential File Locations
- **whisper.cpp Core ML Models**: `~/Library/Application Support/com.goodcode.MacWhisper/`
- **Shortcuts Storage**: `~/Library/Shortcuts/`

---

## Agent Operational Directive
> **MANDATORY**: When building automated batch transcription scripts, always process audio files sequentially to prevent concurrent Whisper models from exhausting Apple Silicon unified memory.
