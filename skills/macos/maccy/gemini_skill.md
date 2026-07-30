---
title: "MacCy AI Skill Guide for Gemini"
description: "Comprehensive SEO-optimized skill specification for Gemini to diagnose, manage, troubleshoot, and automate MacCy on macOS."
keywords: "Google Gemini, Gemini Advanced, Gemini AI skills, Gemini prompt for MacCy, Gemini troubleshooting, Google AI, MacCy, macOS utilities, AI troubleshooting, productivity tools, Claude Code, Codex, LM Studio, OpenClaw, Antigravity, VS Code"
author: "AI Systems Engineering Team"
---

# MacCy AI Skill Guide for Gemini

## Overview
This document serves as the official operational skill guide for **MacCy** on **macOS**, specifically engineered for **Gemini**.

- **Application Name**: MacCy
- **Category**: Clipboard History Manager
- **Platform**: macOS
- **Target AI Agent**: Gemini
- **AI Operating Persona**: Google's Gemini, specializing in multimodal image/screenshot analysis, fast context integration, cross-platform workflows, and rich structured summaries.

> **Core Purpose**: Lightweight open-source clipboard history manager keeping searchable history of text, images, and files.

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
When interacting with MacCy, Gemini must understand its underlying technical framework:

Monitors macOS NSPasteboard change events and stores historical data in SQLite storage.

---

## Key Features and Operational Capabilities
The Gemini model can assist users in configuring and executing the following capabilities of MacCy:

- **Searchable clipboard history with fuzzy search**
- **Secure Input detection ignoring password managers**
- **Pinning clips to prevent cleanup**

### Gemini Processing and Execution Guidelines
When a user issues commands or requests help regarding MacCy, Gemini must execute the following protocol:
1. **Context Identification**: Instantly recognize references to MacCy, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Focus on visual error diagnosis from screenshots, cross-platform app ecosystems, contextual awareness, and clear structured tabular breakdowns.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If MacCy encounters operational failures, Gemini must analyze issues using the resolution pathways below:

#### [Issue] Clips not saving
- **Root Cause**: Secure Input lock active by password manager.
- **Resolution Pathway**: Run 'ioreg -l -w 0 | grep SecureInput' to find locking app.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The Gemini model can generate or execute the following terminal and shell commands for MacCy:

```bash
open -a MacCy
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, Gemini should point users to the following file locations:

- `~/Library/Preferences/org.pavelgroup.MacCy.plist`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: macOS
- **Optimization Strategy**: Gemini-Native Vector Search

### Knowledge Base FAQ

**Q: How does Gemini troubleshoot MacCy issues on macOS?**
A: Gemini inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can Gemini generate automated CLI commands for MacCy?**
A: Yes, Gemini utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment across Claude Code, Codex, LM Studio, OpenClaw, Antigravity, and VS Code.*
