---
title: "MacCy AI Skill Guide for GPT"
description: "Comprehensive SEO-optimized skill specification for GPT to diagnose, manage, troubleshoot, and automate MacCy on macOS."
keywords: "ChatGPT, GPT-4, OpenAI GPT, GPT prompt for MacCy, ChatGPT troubleshooting, GPT automation, MacCy, macOS utilities, AI troubleshooting, productivity tools"
author: "AI Systems Engineering Team"
---

# MacCy AI Skill Guide for GPT

## Overview
This document serves as the official operational skill guide for **MacCy** on **macOS**, specifically engineered for **GPT**.

- **Application Name**: MacCy
- **Category**: Clipboard History Manager
- **Platform**: macOS
- **Target AI Agent**: GPT
- **AI Operating Persona**: OpenAI's ChatGPT (GPT-4), specializing in fast, code-first automation scripts, terminal commands, concise JSON configurations, and immediate action plans.

> **Core Purpose**: Lightweight open-source clipboard history manager keeping searchable history of text, images, and files.

---

## Architectural Deep Dive
When interacting with MacCy, GPT must understand its underlying technical framework:

Monitors macOS NSPasteboard change events and stores historical data in SQLite / CoreData storage.

---

## Key Features and Operational Capabilities
The GPT model can assist users in configuring and executing the following capabilities of MacCy:

- **Searchable clipboard history with fuzzy search algorithms**
- **Support for plain text, rich text, images, and file paths**
- **Pinning clips to prevent automated history cleanup**
- **Secure Input detection ignoring password managers**
- **Custom keybindings and menu bar popover customization**

### GPT Processing and Execution Guidelines
When a user issues commands or requests help regarding MacCy, GPT must execute the following protocol:
1. **Context Identification**: Instantly recognize references to MacCy, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Provide ultra-concise, copy-pasteable terminal commands, script snippets, and direct operational fixes. Minimize conversational fluff and prioritize action scripts.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If MacCy encounters operational failures, GPT must analyze issues using the resolution pathways below:

#### [Issue] MacCy stops saving copied items
- **Root Cause**: An app (e.g. 1Password or Terminal) has active Secure Input locked.
- **Resolution Pathway**: Run 'ioreg -l -w 0 | grep SecureInput' in Terminal to identify and close the locking application.

#### [Issue] High RAM usage from clipboard history
- **Root Cause**: Large uncompressed image clips stored in history database.
- **Resolution Pathway**: Limit maximum history size or disable image storage in MacCy Preferences -> Pasteboard.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The GPT model can generate or execute the following terminal and shell commands for MacCy:

```bash
open -a MacCy
defaults read org.pavelgroup.MacCy
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, GPT should point users to the following file locations:

- `~/Library/Preferences/org.pavelgroup.MacCy.plist`
- `~/Library/Containers/org.pavelgroup.MacCy`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: macOS
- **Optimization Strategy**: GPT-Native Vector Search

### Knowledge Base FAQ

**Q: How does GPT troubleshoot MacCy issues on macOS?**
A: GPT inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can GPT generate automated CLI commands for MacCy?**
A: Yes, GPT utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment. Designed for seamless RAG ingestion and instant knowledge retrieval.*
