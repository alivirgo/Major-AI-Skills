# Major AI Skills

A curated repository of 260+ production-ready AI skills, system prompt specs, and token-optimization blueprints. Built for developers, power users, and everyday teams using tools like Claude Code, ChatGPT, LM Studio, OpenClaw, Antigravity, and VS Code.

---

## What is this project?

Most AI instructions out there are either too generic or bloated with fluff. We built **Major AI Skills** to solve a simple problem: how do you give AI models (Claude, GPT-4, Gemini, and local LLMs) exact, actionable context so they actually fix issues, execute shell commands, and automate software without wasting tokens?

This repo is split into three main hubs:
1. **Application Skills (`skills/`)**: Deep technical guides for 30 top Windows, macOS, Cross-Platform, and Network utilities.
2. **Efficiency AI Skills (`efficiency ai skills/`)**: 100 token-saving techniques focused on prompt compression, context window pruning, line-bounded edits, and API caching.
3. **Common Sense AI Skills (`common sense ai skills/`)**: 100 practical, plain-English habits designed for non-technical users to get better results from AI while spending less.

---

## Directory Structure

```text
Major AI Skills/
├── skills/                      # 90 Application Skill Specifications (30 Apps x 3 Models)
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

- **Windows Power Tools**: Deep dives into MFT reading with WizTree, USN journal indexing with Everything, system audio session routing in EarTrumpet, process/kernel inspection via System Informer, and GUI automation with AutoHotkey v2.
- **macOS Productivity**: Swift-native workflows for Raycast, ScreenCaptureKit integration in Shottr, hidden file cleanup in AppCleaner, local AI transcription with MacWhisper, and container virtualization via OrbStack.
- **Cross-Platform Developer Tools**: Command line & API workflows for FFmpeg, Wireshark packet capture, rclone cloud mounts, Tailscale mesh VPNs, Nginx proxying, and Bruno API collections.
- **Network SDN Controller**: Full REST OpenAPI payload definitions for TP-Link Omada Controllers (device adoption, VLAN profiles, WLAN channel optimization, and gateway policy routing).

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

## License

MIT License. Feel free to use, modify, and distribute these skill specifications in your own projects, custom agents, and internal team workflows.
