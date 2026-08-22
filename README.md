# Major AI Skills

[![Release](https://img.shields.io/github/v/release/alivirgo/Major-AI-Skills?color=blue&label=version)](https://github.com/alivirgo/Major-AI-Skills/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Skills: 425+](https://img.shields.io/badge/Skills-425%2B%20Specs-blueviolet)](https://github.com/alivirgo/Major-AI-Skills)
[![Website: Live](https://img.shields.io/badge/Website-GitHub%20Pages-success)](https://alivirgo.github.io/Major-AI-Skills/)

A curated repository of 425+ production-ready AI skills, system prompt specs, and token-optimization blueprints. Built for developers, power users, and domain specialists using tools like Claude Code, ChatGPT, LM Studio, OpenClaw, Antigravity, and VS Code.

---

## What is this project?

Most AI instructions out there are either too generic or bloated with fluff. We built **Major AI Skills** to solve a simple problem: how do you give AI models (Claude, GPT-4, Gemini, and local LLMs) exact, actionable context so they actually fix issues, execute shell commands, and automate software without wasting tokens?

This repo is split into three main hubs:
1. **Application Skills (`skills/`)**: Deep technical guides for 75 top software applications across CAD, Video Editing, 3D, GIS, Scientific, Medical, Music, Game Engines, EDA, ERP, Enterprise, Digital Forensics, PLC/Industrial, Windows, macOS, Cross-Platform, and Network platforms.
2. **Efficiency AI Skills (`efficiency ai skills/`)**: 100 token-saving techniques focused on prompt compression, context window pruning, line-bounded edits, and API caching.
3. **Common Sense AI Skills (`common sense ai skills/`)**: 100 practical, plain-English habits designed for non-technical users to get better results from AI while spending less.

---

## Directory Structure

```text
Major AI Skills/
├── skills/                      # 225 Application Skill Specifications (75 Apps x 3 Models across 17 Categories)
│   ├── cad/                     # SolidWorks, CATIA, Siemens NX, Fusion 360, Rhino
│   ├── video-editing/           # DaVinci Resolve, VEGAS Pro, Final Cut Pro
│   ├── 3d/                      # Cinema 4D, Houdini, ZBrush, Substance Painter
│   ├── gis/                     # ArcGIS Pro, QGIS
│   ├── scientific/              # MATLAB, COMSOL, OriginPro, LabVIEW
│   ├── medical/                 # 3D Slicer, OsiriX, Horos
│   ├── music/                   # Cubase, Ableton Live, FL Studio, Logic Pro, Pro Tools
│   ├── game-engines/            # CryEngine, Godot, RPG Maker
│   ├── eda/                     # Altium Designer, KiCad, Cadence Virtuoso, LTspice
│   ├── erp/                     # SAP GUI, Oracle EBS, Microsoft Dynamics NAV
│   ├── enterprise/              # IBM Maximo, ServiceNow Desktop, PTC Windchill
│   ├── digital-forensics/       # Autopsy, EnCase, FTK
│   ├── plc-industrial/          # Siemens TIA Portal, Rockwell Studio 5000, Codesys
│   ├── windows/                 # WizTree, Everything, ShareX, PowerToys, System Informer, AHK v2, etc.
│   ├── macos/                   # Raycast, Shottr, AppCleaner, Rectangle, MacCy, OrbStack, MacWhisper, etc.
│   ├── cross-platform/          # LosslessCut, Ventoy, Wireshark, FFmpeg, rclone, Tailscale, Nginx, Bruno
│   └── network/                 # TP-Link Omada SDN Controller (EAPs, JetStream Switches, Gateways)
├── efficiency ai skills/        # 100 Technical Token-Reduction & Cost-Optimization Rules
└── common sense ai skills/     # 100 Plain-English AI Habits for Everyday Productivity
```

---

## Key Categories

### 1. Application Skill Guides (`skills/`)
Every application folder contains three distinct model specifications (`claude_skill.md`, `gpt_skill.md`, `gemini_skill.md`):

- **CAD & Engineering**: SolidWorks, CATIA, Siemens NX, Fusion 360, Rhino.
- **Video & Audio Post-Production**: DaVinci Resolve, VEGAS Pro, Final Cut Pro, Cubase, Ableton Live, FL Studio, Logic Pro, Pro Tools.
- **3D & Visual Effects**: Cinema 4D, Houdini, ZBrush, Substance Painter.
- **GIS & Scientific Computing**: ArcGIS Pro, QGIS, MATLAB, COMSOL, OriginPro, LabVIEW.
- **Medical Imaging & DICOM**: 3D Slicer, OsiriX, Horos.
- **Game Engines & EDA**: CryEngine, Godot, RPG Maker, Altium Designer, KiCad, Cadence Virtuoso, LTspice.
- **ERP & Enterprise Asset Management**: SAP GUI, Oracle EBS, Microsoft Dynamics NAV, IBM Maximo, ServiceNow Desktop, PTC Windchill.
- **Digital Forensics & Industrial Automation**: Autopsy, EnCase, FTK, Siemens TIA Portal, Rockwell Studio 5000, Codesys.
- **Desktop & Systems Utilities**: Windows Power Tools, macOS Productivity, Cross-Platform tools, and Omada SDN Network Controllers.

### 2. Efficiency AI Skills (`efficiency ai skills/`)
A collection of 100 modular rules to keep your AI context lean and fast:
- **Prompt Compression**: Minimizing diffs, stripping preambles, and using minified JSON payloads.
- **Context Window Management**: Line-bounded file reads, AST code skeletonizing, and Ripgrep glob filtering.
- **API & Inference Optimization**: Anthropic/OpenAI prompt caching headers, stop sequence truncation, and model tier routing.
- **Agentic Workflows**: Multi-tool batching, reactive background task execution, and subagent transcript indexing.

### 3. Common Sense AI Skills (`common sense ai skills/`)
100 simple, practical habits designed for non-technical users:
- How to structure prompts for clear answers on the first try.
- Simple ways to stop AI from rambling or making up fake links/facts.
- Everyday cost-saving tips like avoiding massive copy-pastes and reusing prompt templates.
- Workflows for drafting emails, organizing messy meeting notes, and summarizing contracts.

---

## Compatible AI Engines & IDEs

These skill specifications are pre-formatted for direct integration into:
- **Claude Code CLI**: Standardized for automated terminal tools and command execution.
- **OpenAI Codex & ChatGPT**: Optimized for Python automation scripts, cURL commands, and API payloads.
- **LM Studio**: Clean GGUF RAG vector indexing compatible with 4k to 32k context windows.
- **OpenClaw & Antigravity**: Direct mapping for tool calls (`view_file`, `run_command`, `write_to_file`) and background tasks.
- **VS Code & Cursor**: Ready to drop into `.cursorrules`, `CLAUDE.md`, or extension system prompts.

---

## How to Use These Skills

### Option 1: Direct Prompt Injection
Copy the contents of any skill file into your custom instructions, system prompt, or project rules file (`.cursorrules`, `CLAUDE.md`, or `SYSTEM_PROMPT.md`).

### Option 2: RAG Vector Knowledge Base
Ingest the `skills/` or `efficiency ai skills/` folders into your local vector database (Chroma, Qdrant, LanceDB) or LM Studio local search to allow your AI agent to auto-retrieve context when working on relevant tasks.

---

## Community & Stargazers

[![GitHub Stars](https://img.shields.io/github/stars/alivirgo/Major-AI-Skills?style=social)](https://github.com/alivirgo/Major-AI-Skills/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/alivirgo/Major-AI-Skills?style=social)](https://github.com/alivirgo/Major-AI-Skills/network/members)
[![GitHub Watchers](https://img.shields.io/github/watchers/alivirgo/Major-AI-Skills?style=social)](https://github.com/alivirgo/Major-AI-Skills/watchers)

Track live repository community growth and recent stargazers directly on [GitHub Stargazers](https://github.com/alivirgo/Major-AI-Skills/stargazers) or via the [Interactive Documentation Portal](https://alivirgo.github.io/Major-AI-Skills/).

---

## License

MIT License. Feel free to use, modify, and distribute these skill specifications in your own projects, custom agents, and internal team workflows.
