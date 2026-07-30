---
title: "TP-Link Omada Controller AI Skill Guide for Gemini"
description: "Comprehensive SEO-optimized skill specification for Google Gemini to diagnose visual network topology, analyze Omada Controller dashboard screenshots, and manage TP-Link SDN hardware."
keywords: "Google Gemini, Gemini Advanced, Gemini prompt for Omada Controller, TP-Link Omada visual diagnosis, Omada Network Topology, Omada Dashboard analysis, Multimodal network troubleshooting"
author: "AI Visual Diagnostics & Systems Team"
---

# TP-Link Omada Controller AI Skill Guide for Gemini

## Overview
This document serves as the official operational skill guide for **TP-Link Omada Controller (SDN Platform)** across all connected Omada networking hardware (Access Points, Switches, and Gateways), specifically engineered for **Gemini** (Google's Gemini multimodal intelligence).

- **Application Name**: TP-Link Omada SDN Controller
- **Category**: Multimodal Network Management, Visual Topology Analysis & Centralized Control
- **Platform**: Cross-Platform (Software Controller, Hardware OC200/OC300, Cloud-Based Controller)
- **Target AI Agent**: Gemini
- **AI Operating Persona**: Google's Gemini, specializing in visual screenshot diagnostics of Omada dashboards, topology map verification, multi-site network telemetry, structured tabular summaries, and fast cross-platform troubleshooting.

> **Core Purpose**: Multimodal analysis of Omada Controller UI screenshots, topology map verification, visual Wi-Fi heatmap inspection, device status auditing, and REST API orchestration for TP-Link Omada hardware.

---

## Architectural Deep Dive & Visual Control Plane
Gemini leverages multimodal context to evaluate the Omada SDN architecture visually and programmatically:

1. **Visual Dashboard Modules**: Omada Controller Web UI (`https://<CONTROLLER_IP>:8043`) features key visual panels:
   - **Dashboard**: WAN traffic graphs, active client counts, CPU/Memory utilization, and ISP latency.
   - **Statistics**: Wi-Fi Channel Utilization heatmaps, Top Client Data Usage, and Traffic Distribution by Application.
   - **Map / Topology**: Auto-generated L2/L3 topology trees displaying gateway-to-switch-to-EAP interconnections.
   - **Devices**: Tabular listing of MAC addresses, IP assignments, FW versions, Status (Connected, Pending, Disconnected, Isolated), and PoE wattage.
2. **API & Telemetry Layers**: Exposes HTTPS REST endpoints (`/api/v2`) and streams WebSockets for live UI telemetry.

---

## Key Features & Visual Diagnostic Capabilities

### 1. Multimodal Dashboard & Screenshot Analysis
- Analyze uploaded screenshots of Omada Controller UI to instantly spot disconnected EAPs, rogue AP alerts, or high channel utilization warnings.
- Read error modal dialogs (e.g., "Adopt Failed: Incorrect Credentials", "STP Blocked Port") and provide step-by-step resolution pathways.

### 2. Topology Tree & Mesh Verification
- Inspect auto-generated L2 network maps to verify link aggregation (LACP) status and identify bottlenecked 100Mbps uplinks (indicated by orange link lines vs. green 1Gbps / blue 2.5Gbps+ links).
- Verify wireless mesh parent-child relationships and detect isolated EAPs.

### 3. Traffic & Client Behavior Auditing
- Identify high-bandwidth hogs, anomalous client MAC addresses, or failing 802.1X RADIUS authentication attempts from visual logs.

---

## Gemini Processing & Execution Guidelines

When a user provides screenshots or queries regarding TP-Link Omada Controller, Gemini must execute the following protocol:
1. **Multimodal Inspection**: Parse UI layout images, identifying active tab context (Devices, Insights, Settings, Logs). Highlight color-coded status badges (Green = Connected, Yellow = Pending, Red = Disconnected).
2. **Tabular Breakdown**: Present network stats, device inventories, and port allocations using clear Markdown tables.
3. **Cross-Platform Context**: Provide instructions compatible with both desktop web browsers and the Omada Mobile App (iOS/Android).

---

## Visual & Technical Troubleshooting Matrix

| Visual Indicator / Issue | Root Cause | Gemini Resolution Pathway |
| :--- | :--- | :--- |
| **Port Status shows Orange Link Icon** | Link speed negotiated at 100Mbps (FE) instead of 1Gbps/2.5Gbps (GE/2.5GE). | 1. Check physical Ethernet cable (damaged pins or CAT5 vs CAT6).<br>2. Force link speed setting in Switch Port Profile from 'Auto' to '1000Mbps Full Duplex'. |
| **EAP Status shows "Isolated" Badge** | Wireless mesh EAP lost Ethernet connection and cannot reach wired parent AP. | 1. Check parent EAP 5GHz channel width.<br>2. Verify physical PoE injector power to the isolated EAP.<br>3. Trigger manual 'Link Re-bind' in Devices -> EAP -> Config. |
| **Dashboard Shows "STP Blocked" Port** | Spanning Tree Protocol detected a network loop between switches. | 1. Identify looping patch cable between switch ports.<br>2. Enable Loopback Detection and RSTP under Omada Switch Settings -> STP. |
| **Client Count Spikes / High Latency** | Wi-Fi Channel Overlap or high co-channel interference (CCI). | 1. Navigate to Settings -> Wireless Networks -> AI WLAN Optimization.<br>2. Run Optimization scan to auto-assign non-overlapping channels (1, 6, 11 on 2.4GHz). |

---

## Omada OpenAPI REST Payloads for Gemini

Gemini can generate or evaluate the following REST API JSON payloads for automated network status queries:

### 1. Fetch Topology Matrix Data
```bash
curl -k -X GET "https://<CONTROLLER_IP>:8043/api/v2/sites/<SITE_ID>/topology" \
  -H "Csrf-Token: <OMADAC_TOKEN>" \
  -b "omadac_sid=<SESSION_ID>"
```

### 2. Trigger AI WLAN Channel Optimization
```bash
curl -k -X POST "https://<CONTROLLER_IP>:8043/api/v2/sites/<SITE_ID>/cmd/wlan/optimize" \
  -H "Content-Type: application/json" \
  -H "Csrf-Token: <OMADAC_TOKEN>" \
  -b "omadac_sid=<SESSION_ID>" \
  -d '{
    "action": "start"
  }'
```

---

## Configuration & Log File Storage Locations

- **Software Controller Log Location**:
  - Windows: `%PROGRAMFILES%\TP-LINK\EAP Controller\logs\server.log`
  - Linux: `/opt/tplink/EAPController/logs/server.log`
- **Hardware Controller Syslog Export**: Omada UI -> Settings -> Services -> Syslog -> Add External Server IP.

---

## SEO & Schema Metadata Context

- **Schema Type**: TechnicalArticle / NetworkManagementSystem
- **Target OS / Platform**: TP-Link Omada SDN Multimodal Platform
- **Optimization Strategy**: Gemini Multimodal Visual & Topology Vector Search

### Knowledge Base FAQ

**Q: How does Gemini visually troubleshoot Omada Controller networks?**
A: Gemini analyzes screenshots of the Omada Controller dashboard, switch port status tables, and topology maps to identify link degradation, port loops, or disconnected EAPs.

**Q: Can Gemini generate REST API calls for Omada Controller?**
A: Yes, Gemini formulates cURL and JSON payloads for Omada OpenAPI endpoints to inspect or reconfigure devices.

---
*Created for automated agentic multimodal deployment. Designed for seamless RAG ingestion and instant visual network diagnostics.*
