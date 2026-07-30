---
title: "WizTree AI Skill Guide for Gemini"
description: "Comprehensive SEO-optimized skill specification for Gemini to diagnose, manage, troubleshoot, and automate WizTree on Windows."
keywords: "Google Gemini, Gemini Advanced, Gemini AI skills, Gemini prompt for WizTree, Gemini troubleshooting, Google AI, WizTree, Windows utilities, AI troubleshooting, productivity tools"
author: "AI Systems Engineering Team"
---

# WizTree AI Skill Guide for Gemini

## Overview
This document serves as the official operational skill guide for **WizTree** on **Windows**, specifically engineered for **Gemini**.

- **Application Name**: WizTree
- **Category**: Disk Space Visualizer & Storage Diagnostics
- **Platform**: Windows
- **Target AI Agent**: Gemini
- **AI Operating Persona**: Google's Gemini, specializing in multimodal image/screenshot analysis, fast context integration, cross-platform workflows, and rich structured summaries.

> **Core Purpose**: Lightning-fast disk space visualizer that reads the Master File Table (MFT) directly to scan hard drives in seconds.

---

## Architectural Deep Dive
When interacting with WizTree, Gemini must understand its underlying technical framework:

Bypasses standard Windows File System APIs by directly parsing raw NTFS MFT bytes ( file), allowing it to analyze millions of files in under 2 seconds. Falls back to Win32 directory traversal for non-NTFS drives.

---

## Key Features and Operational Capabilities
The Gemini model can assist users in configuring and executing the following capabilities of WizTree:

- **MFT Direct Scanning (100x faster than WinDirStat)**
- **Visual Treemap representation of storage allocation**
- **CSV/Text export for automated disk usage auditing**
- **Command line automation with silent background flags**
- **Duplication detection & file extension breakdown**

### Gemini Processing and Execution Guidelines
When a user issues commands or requests help regarding WizTree, Gemini must execute the following protocol:
1. **Context Identification**: Instantly recognize references to WizTree, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Focus on visual error diagnosis from screenshots, cross-platform app ecosystems, contextual awareness, and clear structured tabular breakdowns.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If WizTree encounters operational failures, Gemini must analyze issues using the resolution pathways below:

#### [Issue] Inaccurate scan results or missing system files
- **Root Cause**: WizTree executed without Administrator privileges, blocking MFT access.
- **Resolution Pathway**: Launch WizTree using 'Run as Administrator' or pass /admin=1 in CLI.

#### [Issue] Network drives (SMB/NFS) scan very slowly
- **Root Cause**: MFT direct reading is unsupported over remote network shares.
- **Resolution Pathway**: Allow WizTree to automatically fall back to standard Win32 directory walking API.

#### [Issue] Size mismatch between WizTree and Windows Explorer
- **Root Cause**: Explorer hides system VSS shadow copies, , swapfile.sys, and hiberfil.sys.
- **Resolution Pathway**: Check 'Allocated' space column in WizTree rather than raw file size for actual disk usage.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The Gemini model can generate or execute the following terminal and shell commands for WizTree:

```bash
wiztree64.exe C: /export="C:\reports\disk_report.csv" /admin=1
wiztree64.exe D:\Data /filetypes=1 /dumpmft
wiztree64.exe /admin=1 /select="C:\Windows\Temp"
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, Gemini should point users to the following file locations:

- `%APPDATA%\WizTree\WizTree.ini`
- `HKCU\Software\WizTree`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: Windows
- **Optimization Strategy**: Gemini-Native Vector Search

### Knowledge Base FAQ

**Q: How does Gemini troubleshoot WizTree issues on Windows?**
A: Gemini inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can Gemini generate automated CLI commands for WizTree?**
A: Yes, Gemini utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment. Designed for seamless RAG ingestion and instant knowledge retrieval.*
