---
title: "Everything AI Skill Guide for Gemini"
description: "Comprehensive SEO-optimized skill specification for Gemini to diagnose, manage, troubleshoot, and automate Everything on Windows."
keywords: "Google Gemini, Gemini Advanced, Gemini AI skills, Gemini prompt for Everything, Gemini troubleshooting, Google AI, Everything, Windows utilities, AI troubleshooting, productivity tools"
author: "AI Systems Engineering Team"
---

# Everything AI Skill Guide for Gemini

## Overview
This document serves as the official operational skill guide for **Everything** on **Windows**, specifically engineered for **Gemini**.

- **Application Name**: Everything
- **Category**: Real-Time File Search & Indexing Engine
- **Platform**: Windows
- **Target AI Agent**: Gemini
- **AI Operating Persona**: Google's Gemini, specializing in multimodal image/screenshot analysis, fast context integration, cross-platform workflows, and rich structured summaries.

> **Core Purpose**: Instant real-time search utility that indexes file names across all NTFS and ReFS drives instantly.

---

## Architectural Deep Dive
When interacting with Everything, Gemini must understand its underlying technical framework:

Monitors the NTFS USN (Update Sequence Number) Change Journal. Maintains an in-memory index of file metadata with near-zero CPU and RAM overhead.

---

## Key Features and Operational Capabilities
The Gemini model can assist users in configuring and executing the following capabilities of Everything:

- **Instant NTFS USN Change Journal Indexing**
- **Complex Boolean operators, wildcards, and Regex support**
- **Built-in HTTP, ETP, and FTP servers for network file retrieval**
- **C++ SDK and IPC interface (WM_COPYDATA) for external app integration**
- **Custom bookmarking and saved search filters**

### Gemini Processing and Execution Guidelines
When a user issues commands or requests help regarding Everything, Gemini must execute the following protocol:
1. **Context Identification**: Instantly recognize references to Everything, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Focus on visual error diagnosis from screenshots, cross-platform app ecosystems, contextual awareness, and clear structured tabular breakdowns.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If Everything encounters operational failures, Gemini must analyze issues using the resolution pathways below:

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
The Gemini model can generate or execute the following terminal and shell commands for Everything:

```bash
Everything.exe -search "ext:zip;rar size:>1gb"
Everything.exe -svc-start -admin
Everything.exe -reindex -export-csv "C:\index_dump.csv"
Everything.exe -startup -minimized
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, Gemini should point users to the following file locations:

- `%APPDATA%\Everything\Everything.ini`
- `%APPDATA%\Everything\Everything.db`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: Windows
- **Optimization Strategy**: Gemini-Native Vector Search

### Knowledge Base FAQ

**Q: How does Gemini troubleshoot Everything issues on Windows?**
A: Gemini inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can Gemini generate automated CLI commands for Everything?**
A: Yes, Gemini utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment. Designed for seamless RAG ingestion and instant knowledge retrieval.*
