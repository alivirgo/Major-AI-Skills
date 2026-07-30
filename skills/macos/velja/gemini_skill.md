---
title: "Velja AI Skill Guide for Gemini"
description: "Comprehensive SEO-optimized skill specification for Gemini to diagnose, manage, troubleshoot, and automate Velja on macOS."
keywords: "Google Gemini, Gemini Advanced, Gemini AI skills, Gemini prompt for Velja, Gemini troubleshooting, Google AI, Velja, macOS utilities, AI troubleshooting, productivity tools, Claude Code, Codex, LM Studio, OpenClaw, Antigravity, VS Code"
author: "AI Systems Engineering Team"
---

# Velja AI Skill Guide for Gemini

## Overview
This document serves as the official operational skill guide for **Velja** on **macOS**, specifically engineered for **Gemini**.

- **Application Name**: Velja
- **Category**: Smart Browser Picker & URL Router
- **Platform**: macOS
- **Target AI Agent**: Gemini
- **AI Operating Persona**: Google's Gemini, specializing in multimodal image/screenshot analysis, fast context integration, cross-platform workflows, and rich structured summaries.

> **Core Purpose**: Intelligent browser picker routing specific links to specific browsers or web apps automatically.

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
When interacting with Velja, Gemini must understand its underlying technical framework:

Registers as macOS http/https Launch Services default handler (LSSetDefaultHandlerForURLScheme).

---

## Key Features and Operational Capabilities
The Gemini model can assist users in configuring and executing the following capabilities of Velja:

- **Domain and URL pattern matching routing rules**
- **App-specific routing (e.g., Figma links to Figma App)**
- **Automatic tracking parameter removal (UTM, gclid stripping)**

### Gemini Processing and Execution Guidelines
When a user issues commands or requests help regarding Velja, Gemini must execute the following protocol:
1. **Context Identification**: Instantly recognize references to Velja, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Focus on visual error diagnosis from screenshots, cross-platform app ecosystems, contextual awareness, and clear structured tabular breakdowns.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If Velja encounters operational failures, Gemini must analyze issues using the resolution pathways below:

#### [Issue] Links open in wrong browser
- **Root Cause**: Not set as default browser.
- **Resolution Pathway**: Set Velja as Default Browser in System Settings.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The Gemini model can generate or execute the following terminal and shell commands for Velja:

```bash
open -a Velja
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, Gemini should point users to the following file locations:

- `~/Library/Preferences/com.sindresorhus.Velja.plist`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: macOS
- **Optimization Strategy**: Gemini-Native Vector Search

### Knowledge Base FAQ

**Q: How does Gemini troubleshoot Velja issues on macOS?**
A: Gemini inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can Gemini generate automated CLI commands for Velja?**
A: Yes, Gemini utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment across Claude Code, Codex, LM Studio, OpenClaw, Antigravity, and VS Code.*
