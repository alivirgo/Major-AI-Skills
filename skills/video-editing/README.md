# Video Editing, Color Grading, VFX & Post-Production Suite (`skills/video-editing/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for premier non-linear editing (NLE) platforms, Hollywood color grading suites, node-based visual effects engines, and automated video batch renderers.

Each tool ecosystem includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (NLE pipeline architecture, GPU memory allocation, ACES/DWG color management, C# and Python automation APIs).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal timeline review, waveform/vectorscope exposure validation, color node graphs, aspect ratio diagnostics).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (Resolve Python scripting, Fusion VFX Lua/Python node generation, FCPXML rational fraction math, VEGAS Pro .NET C# scripts).

---

## Video Post-Production Domain Architecture & Pipeline Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Video Editing & Post-Production Map                         │
│                                                             │
│  [1] Blackmagic DaVinci Resolve Studio (`davinci-resolve/`)                 │
│  • Domain: NLE, 32-bit YRGB / ACES Color Grading, Fusion VFX, Fairlight DAW │
│  • Automation: `DaVinciResolveScript` Python API, Fusion VFX Node Generator │
│                                                                             │
│  [2] Apple Final Cut Pro (`final-cut-pro/`)                                 │
│  • Domain: Magnetic Timeline 2, Apple Silicon Media Engine, ProRes RAW/Log  │
│  • Automation: FCPXML v1.11 / v1.12 DTD Synthesizer, Compressor CLI Batch   │
│                                                                             │
│  [3] MAGIX VEGAS Pro (`vegas-pro/`)                                         │
│  • Domain: Multi-Track A/B Roll NLE, OpenFX (OFX), NVENC GPU Acceleration   │
│  • Automation: `ScriptPortal.Vegas` .NET C# / JScript Batch Region Exporter │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Application Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[davinci-resolve/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/video-editing/davinci-resolve)** | Editing, Color & VFX | Python Scripting API, Fusion VFX nodes, Deliver queue, GPU memory |
| **[final-cut-pro/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/video-editing/final-cut-pro)** | Apple macOS NLE | FCPXML v1.11 generator, Library maintenance, Compressor CLI |
| **[vegas-pro/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/video-editing/vegas-pro)** | Windows Multi-Track NLE | `ScriptPortal.Vegas` C# scripts, OpenFX plugins, NVENC batch rendering |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, automated post-production asset managers, and video rendering pipelines. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
