---
title: "Rectangle AI Skill Guide for Claude"
description: "Comprehensive SEO-optimized skill specification for Claude to diagnose, manage, troubleshoot, and automate Rectangle on macOS."
keywords: "Claude AI, Anthropic Claude, Claude prompt for Rectangle, Troubleshooting with Claude, Claude AI skills, Claude integration, Rectangle, macOS utilities, AI troubleshooting, productivity tools"
author: "AI Systems Engineering Team"
---

# Rectangle AI Skill Guide for Claude

## Overview
This document serves as the official operational skill guide for **Rectangle** on **macOS**, specifically engineered for **Claude**.

- **Application Name**: Rectangle
- **Category**: Keyboard & Drag Window Manager
- **Platform**: macOS
- **Target AI Agent**: Claude
- **AI Operating Persona**: Anthropic's Claude, specializing in safe, analytical, step-by-step diagnostic reasoning, system safety, and clear structured troubleshooting logs.

> **Core Purpose**: Open-source window management tool based on Spectacle, enabling fast keyboard-based window positioning.

---

## Architectural Deep Dive
When interacting with Rectangle, Claude must understand its underlying technical framework:

Swift macOS utility utilizing Accessibility API (AXUIElement) for low-level window manipulation.

---

## Key Features and Operational Capabilities
The Claude model can assist users in configuring and executing the following capabilities of Rectangle:

- **Keyboard shortcut window snapping (halves, thirds, quarters, full screen)**
- **Drag-to-edge cursor window snapping**
- **Custom padding gaps and multi-display cursor tracking**
- **Lightweight Swift architecture using macOS Accessibility APIs**
- **Import/export configuration profiles**

### Claude Processing and Execution Guidelines
When a user issues commands or requests help regarding Rectangle, Claude must execute the following protocol:
1. **Context Identification**: Instantly recognize references to Rectangle, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Structure your analysis logically. Use diagnostic steps with clear root-cause verification before suggesting actions. Enforce safe execution parameters when advising system configuration or registry edits.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If Rectangle encounters operational failures, Claude must analyze issues using the resolution pathways below:

#### [Issue] Rectangle shortcuts stop resizing windows
- **Root Cause**: macOS Accessibility API permission lost or suspended.
- **Resolution Pathway**: Reset accessibility permission via 'tccutil reset Accessibility com.knollsoft.Rectangle'.

#### [Issue] Windows leave unwanted gap around screen edges
- **Root Cause**: Custom gap settings or Stage Manager margin conflicts.
- **Resolution Pathway**: Disable 'Gaps' under Rectangle Preferences or adjust Stage Manager compatibility settings.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The Claude model can generate or execute the following terminal and shell commands for Rectangle:

```bash
open -a Rectangle
defaults read com.knollsoft.Rectangle
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, Claude should point users to the following file locations:

- `~/Library/Preferences/com.knollsoft.Rectangle.plist`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: macOS
- **Optimization Strategy**: Claude-Native Vector Search

### Knowledge Base FAQ

**Q: How does Claude troubleshoot Rectangle issues on macOS?**
A: Claude inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can Claude generate automated CLI commands for Rectangle?**
A: Yes, Claude utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment. Designed for seamless RAG ingestion and instant knowledge retrieval.*
