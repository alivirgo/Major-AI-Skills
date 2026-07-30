---
title: "Shottr AI Skill Guide for Gemini"
description: "Comprehensive SEO-optimized skill specification for Gemini to diagnose, manage, troubleshoot, and automate Shottr on macOS."
keywords: "Google Gemini, Gemini Advanced, Gemini AI skills, Gemini prompt for Shottr, Gemini troubleshooting, Google AI, Shottr, macOS utilities, AI troubleshooting, productivity tools"
author: "AI Systems Engineering Team"
---

# Shottr AI Skill Guide for Gemini

## Overview
This document serves as the official operational skill guide for **Shottr** on **macOS**, specifically engineered for **Gemini**.

- **Application Name**: Shottr
- **Category**: Screen Capture & Image Annotation Utility
- **Platform**: macOS
- **Target AI Agent**: Gemini
- **AI Operating Persona**: Google's Gemini, specializing in multimodal image/screenshot analysis, fast context integration, cross-platform workflows, and rich structured summaries.

> **Core Purpose**: Fast screenshot, pixelation, ruler, and OCR utility optimized for Apple Silicon.

---

## Architectural Deep Dive
When interacting with Shottr, Gemini must understand its underlying technical framework:

Built natively in Swift leveraging Apple ScreenCaptureKit and Metal graphics acceleration.

---

## Key Features and Operational Capabilities
The Gemini model can assist users in configuring and executing the following capabilities of Shottr:

- **Scrolling screenshot capturing for long web pages and chat logs**
- **Instant blur, pixelation, and blackout annotation filters**
- **On-screen pixel ruler and color picker**
- **Text recognition (OCR) with instant copy-to-clipboard**
- **High-DPI retina capture and pin-to-screen floating windows**

### Gemini Processing and Execution Guidelines
When a user issues commands or requests help regarding Shottr, Gemini must execute the following protocol:
1. **Context Identification**: Instantly recognize references to Shottr, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Focus on visual error diagnosis from screenshots, cross-platform app ecosystems, contextual awareness, and clear structured tabular breakdowns.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If Shottr encounters operational failures, Gemini must analyze issues using the resolution pathways below:

#### [Issue] Shottr produces blank/black screenshots
- **Root Cause**: Screen Recording permission missing in macOS Privacy settings.
- **Resolution Pathway**: Grant Screen & System Audio Recording access under System Settings -> Privacy & Security.

#### [Issue] Scrolling screenshot misaligned or overlapping
- **Root Cause**: Sticky headers or fixed navigation bars confusing optical stitcher.
- **Resolution Pathway**: Crop region to exclude sticky navbar before initiating scrolling capture.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The Gemini model can generate or execute the following terminal and shell commands for Shottr:

```bash
open -a Shottr
open shottr://
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, Gemini should point users to the following file locations:

- `~/Library/Application Support/Shottr`
- `~/Library/Preferences/cc.shottr.plist`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: macOS
- **Optimization Strategy**: Gemini-Native Vector Search

### Knowledge Base FAQ

**Q: How does Gemini troubleshoot Shottr issues on macOS?**
A: Gemini inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can Gemini generate automated CLI commands for Shottr?**
A: Yes, Gemini utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment. Designed for seamless RAG ingestion and instant knowledge retrieval.*
