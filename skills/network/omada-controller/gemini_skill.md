---
title: "Omada Controller AI Skill Guide for Gemini"
description: "Comprehensive SEO-optimized skill specification for Gemini to diagnose, manage, troubleshoot, and automate Omada Controller on Network Platform."
keywords: "Google Gemini, Gemini Advanced, Gemini AI skills, Gemini prompt for Omada Controller, Gemini troubleshooting, Google AI, Omada Controller, Network Platform utilities, AI troubleshooting, productivity tools"
author: "AI Systems Engineering Team"
---

# Omada Controller AI Skill Guide for Gemini

## Overview
This document serves as the official operational skill guide for **Omada Controller** on **Network Platform**, specifically engineered for **Gemini**.

- **Application Name**: Omada Controller
- **Category**: Enterprise SDN Network Controller
- **Platform**: Network Platform
- **Target AI Agent**: Gemini
- **AI Operating Persona**: Google's Gemini, specializing in multimodal image/screenshot analysis, fast context integration, cross-platform workflows, and rich structured summaries.

> **Core Purpose**: Centralized Software-Defined Networking platform for managing TP-Link Omada EAP Access Points, JetStream Switches, and Routers.

---

## Architectural Deep Dive
When interacting with Omada Controller, Gemini must understand its underlying technical framework:

Java runtime and MongoDB backend exposing HTTPS REST OpenAPI (/api/v2) and managing devices over southbound UDP/TCP ports 29810-29814.

---

## Key Features and Operational Capabilities
The Gemini model can assist users in configuring and executing the following capabilities of Omada Controller:

- **Centralized EAP Wi-Fi 6/6E/7 Provisioning & Mesh Topology**
- **JetStream Switch Port Profiles, 802.1Q VLANs, and LACP**
- **Omada Gateway Multi-WAN Load Balancing & WireGuard/IPSec VPNs**
- **Captive Portal & RADIUS 802.1X Authentication**
- **OpenAPI REST API Automation and Syslog Telemetry**

### Gemini Processing and Execution Guidelines
When a user issues commands or requests help regarding Omada Controller, Gemini must execute the following protocol:
1. **Context Identification**: Instantly recognize references to Omada Controller, its processes, and associated configuration files.
2. **Model-Specific Protocol**: Focus on visual error diagnosis from screenshots, cross-platform app ecosystems, contextual awareness, and clear structured tabular breakdowns.
3. **Proactive Diagnostics**: Check permissions, pathing, background service health, and OS compatibility before providing solutions.

---

## Technical Troubleshooting Matrix

If Omada Controller encounters operational failures, Gemini must analyze issues using the resolution pathways below:

#### [Issue] Device Stuck in 'Pending' or 'Adoption Failed' State
- **Root Cause**: Device credentials mismatch or firewall blocking ports 29810-29814.
- **Resolution Pathway**: Verify fallback admin credentials or SSH into device and run 'set-inform https://<CONTROLLER_IP>:29814/inform'.

#### [Issue] REST API Request Fails with 'Invalid Token' or HTTP 401
- **Root Cause**: Missing or expired CSRF token (omadac_token) in request headers.
- **Resolution Pathway**: Re-authenticate at /api/v2/login and pass 'Csrf-Token' header in subsequent requests.


---

## Command Line Syntax and Configuration

### Executable and Terminal Commands
The Gemini model can generate or execute the following terminal and shell commands for Omada Controller:

```bash
curl -k -X POST "https://<CONTROLLER_IP>:8043/api/v2/login" -d '{\"username\":\"admin\",\"password\":\"secret\"}'
ssh admin@192.168.1.150 "set-inform https://192.168.1.100:29814/inform"
```

### Configuration and Data Storage Paths
To inspect or repair corrupted settings, Gemini should point users to the following file locations:

- `/opt/tplink/EAPController/logs/server.log`
- `%PROGRAMFILES%\TP-LINK\EAP Controller\logs\server.log`

---

## SEO and Schema Metadata Context
This skill guide is structured for deep indexing, RAG vector retrieval, and machine readability.

- **Schema Type**: TechnicalArticle / SoftwareApplication
- **Target OS**: Network Platform
- **Optimization Strategy**: Gemini-Native Vector Search

### Knowledge Base FAQ

**Q: How does Gemini troubleshoot Omada Controller issues on Network Platform?**
A: Gemini inspects execution permissions, process status, configuration paths, and known error patterns specified in this guide to provide direct resolution steps.

**Q: Can Gemini generate automated CLI commands for Omada Controller?**
A: Yes, Gemini utilizes the precise terminal syntax provided in this document to automate workflow tasks.

---
*Created for automated agentic deployment. Designed for seamless RAG ingestion and instant knowledge retrieval.*
