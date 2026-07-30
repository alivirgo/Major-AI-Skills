---
title: "Everything AI Skill Guide for Claude"
description: "Comprehensive SEO-optimized skill specification for Claude to diagnose, manage, troubleshoot, and automate Everything on Windows."
keywords: "Claude AI, Anthropic Claude, Claude Code CLI, Claude prompt for Everything, Troubleshooting with Claude, Claude AI skills, Claude integration, Everything, Windows utilities, AI troubleshooting, productivity tools, Claude Code, Codex, LM Studio, OpenClaw, Antigravity, VS Code"
author: "AI Systems Engineering Team"
---

# Everything AI Skill Guide for Claude

## Overview
This document serves as the official operational skill guide for **Everything** on **Windows**, specifically engineered for **Claude**.

- **Application Name**: Everything
- **Category**: Real-Time File Search & Indexing Engine
- **Platform**: Windows
- **Target AI Agent**: Claude
- **AI Operating Persona**: Anthropic's Claude, specializing in safe, analytical, step-by-step diagnostic reasoning, system safety, and clear structured troubleshooting logs.

> **Core Purpose**: Instant real-time search utility indexing file names across all NTFS and ReFS drives instantly.

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
When interacting with Everything, Claude must understand its underlying technical framework:

Monitors NTFS USN Change Journal, maintaining an in-memory index of file metadata with near-zero CPU/RAM overhead.

---

## Key Features and Operational Capabilities
The Claude model can assist users in configuring and executing the following capabilities of Everything:

- **Instant NTFS USN Change Journal Indexing**
- **Complex Boolean operators, wildcards, and Regex support**
- **Built-in HTTP, ETP, and FTP servers for network file retrieval**
- **C++ SDK and IPC interface (WM_COPYDATA) for external app integration**

### Claude Processing and Execution Guidelines
When a user issues commands or requests help regarding Everything, Claude must execute the following protocol:
1. **Context Identification**: Instantly recognize references to Everything, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Structure your analysis logically. Use diagnostic steps with clear root-cause verification before suggesting actions. Enforce safe execution parameters when advising system configuration or registry edits.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If Everything encounters operational failures, Claude must analyze issues using the resolution pathways below:

#### [Issue] Everything service not responding
- **Root Cause**: Background service stopped or USN journal index corrupted.
- **Resolution Pathway**: Run 'Everything.exe -svc-start' or navigate to Options -> Indexes -> Force Rebuild.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The Claude model can generate or execute the following terminal and shell commands for Everything:

```bash
Everything.exe -search "ext:zip;rar size:>1gb"
Everything.exe -svc-start -admin
Everything.exe -reindex -export-csv "C:\index_dump.csv"
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, Claude should point users to the following file locations:

- `%APPDATA%\Everything\Everything.ini`
- `%APPDATA%\Everything\Everything.db`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: Windows
- **Optimization Strategy**: Claude-Native Vector Search

### Knowledge Base FAQ

**Q: How does Claude troubleshoot Everything issues on Windows?**
A: Claude inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can Claude generate automated CLI commands for Everything?**
A: Yes, Claude utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment across Claude Code, Codex, LM Studio, OpenClaw, Antigravity, and VS Code.*
