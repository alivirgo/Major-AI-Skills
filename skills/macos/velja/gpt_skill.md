---
title: "Velja AI Skill Guide for GPT"
description: "Comprehensive SEO-optimized skill specification for GPT to diagnose, manage, troubleshoot, and automate Velja on macOS."
keywords: "ChatGPT, GPT-4, OpenAI GPT, GPT prompt for Velja, ChatGPT troubleshooting, GPT automation, Velja, macOS utilities, AI troubleshooting, productivity tools"
author: "AI Systems Engineering Team"
---

# Velja AI Skill Guide for GPT

## Overview
This document serves as the official operational skill guide for **Velja** on **macOS**, specifically engineered for **GPT**.

- **Application Name**: Velja
- **Category**: Smart Browser Picker & URL Router
- **Platform**: macOS
- **Target AI Agent**: GPT
- **AI Operating Persona**: OpenAI's ChatGPT (GPT-4), specializing in fast, code-first automation scripts, terminal commands, concise JSON configurations, and immediate action plans.

> **Core Purpose**: Intelligent browser picker that routes specific links to specific browsers or web apps automatically.

---

## Architectural Deep Dive
When interacting with Velja, GPT must understand its underlying technical framework:

Registers as macOS http / https Launch Services default handler (LSSetDefaultHandlerForURLScheme).

---

## Key Features and Operational Capabilities
The GPT model can assist users in configuring and executing the following capabilities of Velja:

- **Domain and URL pattern matching browser routing rules**
- **App-specific routing (e.g., open Figma links directly in Figma App)**
- **Automatic tracking parameter removal (UTM, gclid, fbclid stripping)**
- **Handoff support between iOS and macOS web browsers**
- **Menu bar prompt when clicking links while holding custom modifier keys**

### GPT Processing and Execution Guidelines
When a user issues commands or requests help regarding Velja, GPT must execute the following protocol:
1. **Context Identification**: Instantly recognize references to Velja, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Provide ultra-concise, copy-pasteable terminal commands, script snippets, and direct operational fixes. Minimize conversational fluff and prioritize action scripts.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If Velja encounters operational failures, GPT must analyze issues using the resolution pathways below:

#### [Issue] Links open in default browser without prompting Velja
- **Root Cause**: Velja is not registered as macOS Default Web Browser.
- **Resolution Pathway**: Set Velja as Default Browser under macOS System Settings -> Desktop & Dock.

#### [Issue] OAuth logins fail due to stripped URL parameters
- **Root Cause**: Velja tracking parameter stripper removing authentication tokens.
- **Resolution Pathway**: Add domain exception rule under Velja Preferences -> Tracking Parameters.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The GPT model can generate or execute the following terminal and shell commands for Velja:

```bash
open -a Velja
defaults read com.sindresorhus.Velja
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, GPT should point users to the following file locations:

- `~/Library/Preferences/com.sindresorhus.Velja.plist`
- `~/Library/Containers/com.sindresorhus.Velja`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: macOS
- **Optimization Strategy**: GPT-Native Vector Search

### Knowledge Base FAQ

**Q: How does GPT troubleshoot Velja issues on macOS?**
A: GPT inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can GPT generate automated CLI commands for Velja?**
A: Yes, GPT utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment. Designed for seamless RAG ingestion and instant knowledge retrieval.*
