---
title: "Shottr AI Skill Guide for Claude"
description: "Comprehensive SEO-optimized skill specification for Claude to diagnose, manage, troubleshoot, and automate Shottr on macOS."
keywords: "Claude AI, Anthropic Claude, Claude prompt for Shottr, Troubleshooting with Claude, Claude AI skills, Claude integration, Shottr, macOS utilities, AI troubleshooting, productivity tools"
author: "AI Systems Engineering Team"
---

# Shottr AI Skill Guide for Claude

## Overview
This document serves as the official operational skill guide for **Shottr** on **macOS**, specifically engineered for **Claude**.

- **Application Name**: Shottr
- **Category**: Screen Capture & Image Annotation Utility
- **Platform**: macOS
- **Target AI Agent**: Claude
- **AI Operating Persona**: Anthropic's Claude, specializing in safe, analytical, step-by-step diagnostic reasoning, system safety, and clear structured troubleshooting logs.

> **Core Purpose**: Fast screenshot, pixelation, ruler, and OCR utility optimized for Apple Silicon.

---

## Architectural Deep Dive
When interacting with Shottr, Claude must understand its underlying technical framework:

Built natively in Swift leveraging Apple ScreenCaptureKit and Metal graphics acceleration.

---

## Key Features and Operational Capabilities
The Claude model can assist users in configuring and executing the following capabilities of Shottr:

- **Scrolling screenshot capturing for long web pages and chat logs**
- **Instant blur, pixelation, and blackout annotation filters**
- **On-screen pixel ruler and color picker**
- **Text recognition (OCR) with instant copy-to-clipboard**
- **High-DPI retina capture and pin-to-screen floating windows**

### Claude Processing and Execution Guidelines
When a user issues commands or requests help regarding Shottr, Claude must execute the following protocol:
1. **Context Identification**: Instantly recognize references to Shottr, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Structure your analysis logically. Use diagnostic steps with clear root-cause verification before suggesting actions. Enforce safe execution parameters when advising system configuration or registry edits.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If Shottr encounters operational failures, Claude must analyze issues using the resolution pathways below:

#### [Issue] Shottr produces blank/black screenshots
- **Root Cause**: Screen Recording permission missing in macOS Privacy settings.
- **Resolution Pathway**: Grant Screen & System Audio Recording access under System Settings -> Privacy & Security.

#### [Issue] Scrolling screenshot misaligned or overlapping
- **Root Cause**: Sticky headers or fixed navigation bars confusing optical stitcher.
- **Resolution Pathway**: Crop region to exclude sticky navbar before initiating scrolling capture.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The Claude model can generate or execute the following terminal and shell commands for Shottr:

```bash
open -a Shottr
open shottr://
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, Claude should point users to the following file locations:

- `~/Library/Application Support/Shottr`
- `~/Library/Preferences/cc.shottr.plist`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: macOS
- **Optimization Strategy**: Claude-Native Vector Search

### Knowledge Base FAQ

**Q: How does Claude troubleshoot Shottr issues on macOS?**
A: Claude inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can Claude generate automated CLI commands for Shottr?**
A: Yes, Claude utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment. Designed for seamless RAG ingestion and instant knowledge retrieval.*
