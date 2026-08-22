---
title: "Shottr macOS Screen Capture & Annotation AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Shottr, screencapture CLI pipelines, pngquant/WebP compression, and defaults plist scripting."
category: "Screen Capture & Image Annotation Utility"
tags: ["shottr", "screencapture-cli", "pngquant", "webp-compression", "gpt-codex", "macos-automation"]
---

# Shottr macOS Screen Capture & Annotation AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Shottr provides high-speed screen capture and annotation on macOS with automated clipboard injection and filesystem exporting. GPT/Codex acts as a Principal macOS Automation Engineer and Image Pipeline Architect, delivering **automated screen capture pipelines**, **batch image compression scripts (`pngquant` / `cwebp`)**, **`defaults` preference configuration installers**, and **automated documentation screenshot generators**.

### Developer Architecture & Image Pipeline Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Shottr Developer Platform                   │
│                                                             │
│  CLI & Capture Ingress Tier                                 │
│  ├── macOS `screencapture` Shell Engine (`-i`, `-c`, `-W`)  │
│  ├── Shottr Global Hotkey Ingress Engine                    │
│  └── Automated Documentation Screenshot Scripts             │
│                                                             │
│  Post-Processing & Optimization Pipeline                    │
│  ├── `pngquant` 8-bit Lossy PNG Color Quantization          │
│  ├── Google `cwebp` / `libwebp` High-Compression Transcoder │
│  └── Direct `pbcopy` NSPasteboard Image Insertion           │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Automated Screen Capture Shell Scripting**: Author modular bash scripts combining macOS native `screencapture` with Shottr workflows for automated UI test captures.
2. **Batch Image Compression & Optimization**: Script automated post-processing pipelines compressing raw PNG captures into lightweight WebP/OptiPNG assets for web publishing.
3. **Automated Defaults Configuration**: Manage Shottr configuration keys (`cc.ffitch.shottr`) via `defaults write` to configure default hotkeys, save paths, and formats.
4. **Clipboard Image Pipeline Automation**: Construct Python and Swift scripts reading, modifying, and rewriting image buffers directly to the macOS general pasteboard.

---

## Production Bash Automation: Automated Screen Capture & WebP Compression Pipeline

Save this script as `capture_and_compress.sh` and execute via `bash capture_and_compress.sh`:

```bash
#!/usr/bin/env bash
# ==============================================================================
# Automated Screen Capture & High-Efficiency WebP Pipeline
# Captures interactive selection, compresses with pngquant/cwebp, and copies.
# ==============================================================================
set -euo pipefail

OUTPUT_DIR="$HOME/Desktop/Screenshots"
mkdir -p "$OUTPUT_DIR"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
RAW_PNG="$OUTPUT_DIR/screenshot_${TIMESTAMP}.png"
COMPRESSED_WEBP="$OUTPUT_DIR/screenshot_${TIMESTAMP}.webp"

echo "--- [INTERACTIVE SCREENSHOT CAPTURE] ---"
echo "Select an area on your screen to capture..."

# 1. Capture Interactive Selection via macOS screencapture
if screencapture -i "$RAW_PNG"; then
    if [ ! -f "$RAW_PNG" ]; then
        echo "Capture cancelled by user."
        exit 0
    fi
    echo "✅ Captured raw screenshot: $RAW_PNG"
else
    echo "Capture failed."
    exit 1
fi

# 2. Compress Image to WebP via cwebp (if installed)
if command -v cwebp &> /dev/null; then
    echo "Compressing to WebP (Quality 85%)..."
    cwebp -q 85 "$RAW_PNG" -o "$COMPRESSED_WEBP" > /dev/null 2>&1
    
    RAW_SIZE=$(du -k "$RAW_PNG" | cut -f1)
    WEBP_SIZE=$(du -k "$COMPRESSED_WEBP" | cut -f1)
    echo "✅ Compressed: ${RAW_SIZE}KB (PNG) -> ${WEBP_SIZE}KB (WebP)"
else
    echo "Notice: 'cwebp' not found (brew install webp). Keeping raw PNG."
fi

echo "File saved in: $OUTPUT_DIR"
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`screencapture: error: could not create image`** | Script executing in a headless SSH session lacking access to active WindowServer. | Use `launchctl asuser <uid>` to execute GUI capture commands inside the active console session. |
| **WebP Image Lacks Transparency** | Encoder flags omitted alpha channel preservation during conversion. | In `cwebp` command, add `-alpha_q 100` to preserve clean alpha transparency. |
| **Shottr Plist Settings Reset on Launch** | Preferences modified while Shottr was running in memory. | Quit Shottr before running `defaults write cc.ffitch.shottr ...`. |
| **Pasted Screenshot Shows White Background in Dark Mode** | AppKit clipboard buffer copied without transparent alpha metadata. | Ensure capture tool exports in 32-bit RGBA PNG format. |

---

## Command Line Syntax & Batch Processing

```bash
# Capture Window with Drop Shadow
screencapture -w -o "$HOME/Desktop/window.png"

# Read All Shottr Configuration Keys
defaults read cc.ffitch.shottr
```

### Essential File Locations
- **Shottr Configuration**: `~/Library/Preferences/cc.ffitch.shottr.plist`
- **Application Binary**: `/Applications/Shottr.app`

---

## Agent Operational Directive
> **MANDATORY**: For web-bound documentation assets, always compress raw screenshots using `pngquant` or `cwebp` to reduce page weight by up to 70% while preserving crisp UI text edges.
