---
title: "Flow Launcher AI Skill Guide for Claude"
description: "Comprehensive SEO-optimized skill specification for Claude to diagnose, manage, troubleshoot, and automate Flow Launcher on Windows."
keywords: "Claude AI, Anthropic Claude, Claude prompt for Flow Launcher, Troubleshooting with Claude, Claude AI skills, Claude integration, Flow Launcher, Windows utilities, AI troubleshooting, productivity tools"
author: "AI Systems Engineering Team"
---

# Flow Launcher AI Skill Guide for Claude

## Overview
This document serves as the official operational skill guide for **Flow Launcher** on **Windows**, specifically engineered for **Claude**.

- **Application Name**: Flow Launcher
- **Category**: Productivity Application & File Launcher
- **Platform**: Windows
- **Target AI Agent**: Claude
- **AI Operating Persona**: Anthropic's Claude, specializing in safe, analytical, step-by-step diagnostic reasoning, system safety, and clear structured troubleshooting logs.

> **Core Purpose**: Extensible, open-source application launcher for Windows with deep Everything and Python integration.

---

## Architectural Deep Dive
When interacting with Flow Launcher, Claude must understand its underlying technical framework:

C# / WPF framework with isolated Python runtime environment for plugins and IPC connection to Voidtools Everything.

---

## Key Features and Operational Capabilities
The Claude model can assist users in configuring and executing the following capabilities of Flow Launcher:

- **Instant app launching and Everything file search integration**
- **Rich C# and Python plugin ecosystem with auto-updating**
- **Web search triggers, bookmark queries, and inline calculator**
- **Customizable themes, keybindings, and action keywords**
- **Direct shell command execution via '>' prefix**

### Claude Processing and Execution Guidelines
When a user issues commands or requests help regarding Flow Launcher, Claude must execute the following protocol:
1. **Context Identification**: Instantly recognize references to Flow Launcher, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Structure your analysis logically. Use diagnostic steps with clear root-cause verification before suggesting actions. Enforce safe execution parameters when advising system configuration or registry edits.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If Flow Launcher encounters operational failures, Claude must analyze issues using the resolution pathways below:

#### [Issue] Python plugins crash or fail to load
- **Root Cause**: Flow Launcher cannot locate a valid Python interpreter in PATH.
- **Resolution Pathway**: Specify exact python.exe path under Flow Launcher Settings -> Plugin Store -> Python Settings.

#### [Issue] Local file search unresponsive
- **Root Cause**: Everything IPC service lost connection.
- **Resolution Pathway**: Ensure Everything service is running in background and IPC is enabled.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The Claude model can generate or execute the following terminal and shell commands for Flow Launcher:

```bash
Flow.Launcher.exe
Flow.Launcher.exe --hide
Flow.Launcher.exe --query "g github flow launcher"
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, Claude should point users to the following file locations:

- `%APPDATA%\FlowLauncher\Settings\Settings.json`
- `%APPDATA%\FlowLauncher\Plugins`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: Windows
- **Optimization Strategy**: Claude-Native Vector Search

### Knowledge Base FAQ

**Q: How does Claude troubleshoot Flow Launcher issues on Windows?**
A: Claude inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can Claude generate automated CLI commands for Flow Launcher?**
A: Yes, Claude utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment. Designed for seamless RAG ingestion and instant knowledge retrieval.*
