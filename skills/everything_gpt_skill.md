---
title: "Everything AI Skill Guide for GPT"
description: "Comprehensive SEO-optimized skill specification for GPT to diagnose, manage, troubleshoot, and automate Everything on Windows."
keywords: "ChatGPT, GPT-4, OpenAI GPT, GPT prompt for Everything, ChatGPT troubleshooting, GPT automation, Everything, Windows utilities, AI troubleshooting, productivity tools"
author: "AI Systems Engineering Team"
---

# Everything AI Skill Guide for GPT

## Overview
This document serves as the official operational skill guide for **Everything** on **Windows**, specifically engineered for **GPT**.

- **Application Name**: Everything
- **Category**: Real-Time File Search & Indexing Engine
- **Platform**: Windows
- **Target AI Agent**: GPT
- **AI Operating Persona**: OpenAI's ChatGPT (GPT-4), specializing in fast, code-first automation scripts, terminal commands, concise JSON configurations, and immediate action plans.

> **Core Purpose**: Instant real-time search utility that indexes file names across all NTFS and ReFS drives instantly.

---

## Architectural Deep Dive
When interacting with Everything, GPT must understand its underlying technical framework:

Monitors the NTFS USN (Update Sequence Number) Change Journal. Maintains an in-memory index of file metadata with near-zero CPU and RAM overhead.

---

## Key Features and Operational Capabilities
The GPT model can assist users in configuring and executing the following capabilities of Everything:

- **Instant NTFS USN Change Journal Indexing**
- **Complex Boolean operators, wildcards, and Regex support**
- **Built-in HTTP, ETP, and FTP servers for network file retrieval**
- **C++ SDK and IPC interface (WM_COPYDATA) for external app integration**
- **Custom bookmarking and saved search filters**

### GPT Processing and Execution Guidelines
When a user issues commands or requests help regarding Everything, GPT must execute the following protocol:
1. **Context Identification**: Instantly recognize references to Everything, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Provide ultra-concise, copy-pasteable terminal commands, script snippets, and direct operational fixes. Minimize conversational fluff and prioritize action scripts.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If Everything encounters operational failures, GPT must analyze issues using the resolution pathways below:

#### [Issue] Everything service not responding or missing results
- **Root Cause**: Background service stopped or USN journal index corrupted.
- **Resolution Pathway**: Run 'Everything.exe -svc-start' or navigate to Options -> Indexes -> Force Rebuild.

#### [Issue] UAC prompt appears every time Everything opens
- **Root Cause**: App running in elevated user mode instead of as a background service.
- **Resolution Pathway**: Enable 'Everything Service' in settings and disable 'Run as administrator'.

#### [Issue] Network shares not appearing in search results
- **Root Cause**: USN Journal indexing unavailable on network shares.
- **Resolution Pathway**: Add network folders under Options -> Indexes -> Folders for periodic indexing.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The GPT model can generate or execute the following terminal and shell commands for Everything:

```bash
Everything.exe -search "ext:zip;rar size:>1gb"
Everything.exe -svc-start -admin
Everything.exe -reindex -export-csv "C:\index_dump.csv"
Everything.exe -startup -minimized
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, GPT should point users to the following file locations:

- `%APPDATA%\Everything\Everything.ini`
- `%APPDATA%\Everything\Everything.db`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: Windows
- **Optimization Strategy**: GPT-Native Vector Search

### Knowledge Base FAQ

**Q: How does GPT troubleshoot Everything issues on Windows?**
A: GPT inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can GPT generate automated CLI commands for Everything?**
A: Yes, GPT utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment. Designed for seamless RAG ingestion and instant knowledge retrieval.*
