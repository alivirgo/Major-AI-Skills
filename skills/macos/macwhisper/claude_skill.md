---
title: "MacWhisper AI Skill Guide for Claude"
description: "Comprehensive SEO-optimized skill specification for Claude to diagnose, manage, troubleshoot, and automate MacWhisper on macOS."
keywords: "Claude AI, Anthropic Claude, Claude prompt for MacWhisper, Troubleshooting with Claude, Claude AI skills, Claude integration, MacWhisper, macOS utilities, AI troubleshooting, productivity tools"
author: "AI Systems Engineering Team"
---

# MacWhisper AI Skill Guide for Claude

## Overview
This document serves as the official operational skill guide for **MacWhisper** on **macOS**, specifically engineered for **Claude**.

- **Application Name**: MacWhisper
- **Category**: Local AI Audio Transcription & Speech-to-Text
- **Platform**: macOS
- **Target AI Agent**: Claude
- **AI Operating Persona**: Anthropic's Claude, specializing in safe, analytical, step-by-step diagnostic reasoning, system safety, and clear structured troubleshooting logs.

> **Core Purpose**: On-device AI speech transcription app using OpenAI's Whisper model optimized for Apple Silicon (CoreML / Metal acceleration) with 100% offline privacy.

---

## Architectural Deep Dive
When interacting with MacWhisper, Claude must understand its underlying technical framework:

Swift application binding OpenAI Whisper.cpp / CoreML C++ library, utilizing Apple Neural Engine (ANE) for 30x real-time transcription speeds.

---

## Key Features and Operational Capabilities
The Claude model can assist users in configuring and executing the following capabilities of MacWhisper:

- **Drag-and-drop audio/video transcription (MP3, WAV, MP4, MOV)**
- **Real-time microphone dictation & system audio recording**
- **SRT, VTT, CSV, PDF, and TXT subtitle export options**
- **Automatic language translation to English**
- **Speaker diarization (speaker separation and tagging)**

### Claude Processing and Execution Guidelines
When a user issues commands or requests help regarding MacWhisper, Claude must execute the following protocol:
1. **Context Identification**: Instantly recognize references to MacWhisper, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Structure your analysis logically. Use diagnostic steps with clear root-cause verification before suggesting actions. Enforce safe execution parameters when advising system configuration or registry edits.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If MacWhisper encounters operational failures, Claude must analyze issues using the resolution pathways below:

#### [Issue] Transcription runs extremely slowly or freezes
- **Root Cause**: MacWhisper running unoptimized Large v3 model on insufficient Unified Memory.
- **Resolution Pathway**: Switch to 'Medium' or 'Small' CoreML model under MacWhisper Settings -> AI Models for 8GB/16GB Macs.

#### [Issue] System audio transcription fails to record
- **Root Cause**: Missing macOS Audio Recording or Screen Recording permissions.
- **Resolution Pathway**: Grant Screen & System Audio Recording access in System Settings -> Privacy & Security.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The Claude model can generate or execute the following terminal and shell commands for MacWhisper:

```bash
open -a MacWhisper
open -a MacWhisper "recording.mp3"
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, Claude should point users to the following file locations:

- `~/Library/Application Support/com.goodcode.MacWhisper/`
- `~/Library/Caches/com.goodcode.MacWhisper/`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: macOS
- **Optimization Strategy**: Claude-Native Vector Search

### Knowledge Base FAQ

**Q: How does Claude troubleshoot MacWhisper issues on macOS?**
A: Claude inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can Claude generate automated CLI commands for MacWhisper?**
A: Yes, Claude utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment. Designed for seamless RAG ingestion and instant knowledge retrieval.*
