---
title: "Shottr AI Skill Guide for GPT"
description: "Comprehensive SEO-optimized skill specification for GPT to diagnose, manage, troubleshoot, and automate Shottr on macOS."
keywords: "ChatGPT, GPT-4, OpenAI GPT, GPT prompt for Shottr, ChatGPT troubleshooting, GPT automation, Shottr, macOS utilities, AI troubleshooting, productivity tools"
author: "AI Systems Engineering Team"
---

# Shottr AI Skill Guide for GPT

## Overview
This document serves as the official operational skill guide for **Shottr** on **macOS**, specifically engineered for **GPT**.

- **Application Name**: Shottr
- **Category**: Screen Capture & Image Annotation Utility
- **Platform**: macOS
- **Target AI Agent**: GPT
- **AI Operating Persona**: OpenAI's ChatGPT (GPT-4), specializing in fast, code-first automation scripts, terminal commands, concise JSON configurations, and immediate action plans.

> **Core Purpose**: Fast screenshot, pixelation, ruler, and OCR utility optimized for Apple Silicon.

---

## Architectural Deep Dive
When interacting with Shottr, GPT must understand its underlying technical framework:

Built natively in Swift leveraging Apple ScreenCaptureKit and Metal graphics acceleration.

---

## Key Features and Operational Capabilities
The GPT model can assist users in configuring and executing the following capabilities of Shottr:

- **Scrolling screenshot capturing for long web pages and chat logs**
- **Instant blur, pixelation, and blackout annotation filters**
- **On-screen pixel ruler and color picker**
- **Text recognition (OCR) with instant copy-to-clipboard**
- **High-DPI retina capture and pin-to-screen floating windows**

### GPT Processing and Execution Guidelines
When a user issues commands or requests help regarding Shottr, GPT must execute the following protocol:
1. **Context Identification**: Instantly recognize references to Shottr, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Provide ultra-concise, copy-pasteable terminal commands, script snippets, and direct operational fixes. Minimize conversational fluff and prioritize action scripts.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If Shottr encounters operational failures, GPT must analyze issues using the resolution pathways below:

#### [Issue] Shottr produces blank/black screenshots
- **Root Cause**: Screen Recording permission missing in macOS Privacy settings.
- **Resolution Pathway**: Grant Screen & System Audio Recording access under System Settings -> Privacy & Security.

#### [Issue] Scrolling screenshot misaligned or overlapping
- **Root Cause**: Sticky headers or fixed navigation bars confusing optical stitcher.
- **Resolution Pathway**: Crop region to exclude sticky navbar before initiating scrolling capture.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The GPT model can generate or execute the following terminal and shell commands for Shottr:

```bash
open -a Shottr
open shottr://
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, GPT should point users to the following file locations:

- `~/Library/Application Support/Shottr`
- `~/Library/Preferences/cc.shottr.plist`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: macOS
- **Optimization Strategy**: GPT-Native Vector Search

### Knowledge Base FAQ

**Q: How does GPT troubleshoot Shottr issues on macOS?**
A: GPT inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can GPT generate automated CLI commands for Shottr?**
A: Yes, GPT utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment. Designed for seamless RAG ingestion and instant knowledge retrieval.*
