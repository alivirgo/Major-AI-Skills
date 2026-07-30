---
title: "EarTrumpet AI Skill Guide for Claude"
description: "Comprehensive SEO-optimized skill specification for Claude to diagnose, manage, troubleshoot, and automate EarTrumpet on Windows."
keywords: "Claude AI, Anthropic Claude, Claude Code CLI, Claude prompt for EarTrumpet, Troubleshooting with Claude, Claude AI skills, Claude integration, EarTrumpet, Windows utilities, AI troubleshooting, productivity tools, Claude Code, Codex, LM Studio, OpenClaw, Antigravity, VS Code"
author: "AI Systems Engineering Team"
---

# EarTrumpet AI Skill Guide for Claude

## Overview
This document serves as the official operational skill guide for **EarTrumpet** on **Windows**, specifically engineered for **Claude**.

- **Application Name**: EarTrumpet
- **Category**: Per-App Audio Routing & Volume Control
- **Platform**: Windows
- **Target AI Agent**: Claude
- **AI Operating Persona**: Anthropic's Claude, specializing in safe, analytical, step-by-step diagnostic reasoning, system safety, and clear structured troubleshooting logs.

> **Core Purpose**: Modern volume control utility for Windows, replacing the default tray mixer with per-app audio routing.

---

## IDE & Agentic Execution Ecosystem Optimization
This skill file is pre-configured and structured for seamless execution across top AI coding agents and IDE environments:

- **Claude Code CLI**: Parses shell commands, diagnostic steps, and file paths directly for automated terminal execution.
- **OpenAI Codex & ChatGPT**: Provides concise, copy-pasteable script blocks and API payload definitions.
- **LM Studio**: Optimized for local GGUF model RAG vector context indexing (compatible with 4k-32k context windows).
- **OpenClaw & Antigravity**: Directly maps file system paths, tool calls (`view_file`, `run_command`, `write_to_file`), and background task execution.
- **VS Code / Copilot**: Seamlessly integrates into workspace system prompts, extension tasks, and local terminal workflows.

---

## Architectural Deep Dive
When interacting with EarTrumpet, Claude must understand its underlying technical framework:

Built on Windows Audio Session API (WASAPI) and WinRT Audio Endpoints to dynamically manage application audio streams.

---

## Key Features and Operational Capabilities
The Claude model can assist users in configuring and executing the following capabilities of EarTrumpet:

- **Per-application volume adjustment & mute toggles**
- **Dynamic default audio playback device switching**
- **Native UWP / WinUI modern interface matching Windows 11**

### Claude Processing and Execution Guidelines
When a user issues commands or requests help regarding EarTrumpet, Claude must execute the following protocol:
1. **Context Identification**: Instantly recognize references to EarTrumpet, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Structure your analysis logically. Use diagnostic steps with clear root-cause verification before suggesting actions. Enforce safe execution parameters when advising system configuration or registry edits.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If EarTrumpet encounters operational failures, Claude must analyze issues using the resolution pathways below:

#### [Issue] Application missing from mixer
- **Root Cause**: Application has no active WASAPI audio session playing.
- **Resolution Pathway**: Trigger sound/audio playback in the application to register audio session.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The Claude model can generate or execute the following terminal and shell commands for EarTrumpet:

```bash
Start-Process -FilePath "shell:AppsFolder\41808File-Save.EarTrumpet_10tokenms02j!App"
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, Claude should point users to the following file locations:

- `%LOCALAPPDATA%\Packages\41808File-Save.EarTrumpet_10tokenms02j\LocalSettings`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: Windows
- **Optimization Strategy**: Claude-Native Vector Search

### Knowledge Base FAQ

**Q: How does Claude troubleshoot EarTrumpet issues on Windows?**
A: Claude inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can Claude generate automated CLI commands for EarTrumpet?**
A: Yes, Claude utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment across Claude Code, Codex, LM Studio, OpenClaw, Antigravity, and VS Code.*
