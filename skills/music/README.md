# Music Production, DAWs & Audio Engineering Suite (`skills/music/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for premier digital audio workstations (DAWs), MIDI sequencing platforms, live electronic performance engines, and audio post-production systems.

Each tool ecosystem includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (audio engine architecture, low-latency buffer tuning, native scripting APIs, DSP optimization, hardware controllers).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal UI inspection, piano roll harmony analysis, channel EQ/dynamics curve tuning, loudness compliance).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (Python MIDI Remote scripts, Scripter JavaScript engines, gRPC PTSL clients, automated stem export pipelines).

---

## Music Production Domain Architecture & Pipeline Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Music Production & Audio Engineering Map                    │
│                                                                             │
│  [1] Ableton Live (`ableton-live/`)                                         │
│  • Domain: Live Performance, Electronic Music, Non-Linear Session Grid      │
│  • Automation: Python `ableton.v3` Remote Scripts, Max for Live (M4L), OSC  │
│                                                                             │
│  [2] Steinberg Cubase Pro (`cubase/`)                                       │
│  • Domain: Film Scoring, Orchestral Composition, Advanced MIDI Sequencing   │
│  • Automation: MIDI Remote JavaScript API, Expression Map XML, MixConsole   │
│                                                                             │
│  [3] Image-Line FL Studio (`fl-studio/`)                                    │
│  • Domain: Beat Making, Hip-Hop/Electronic Production, Pattern Sequencing   │
│  • Automation: Python MIDI Scripting API, Headless CLI Rendering, Patcher   │
│                                                                             │
│  [4] Apple Logic Pro (`logic-pro/`)                                         │
│  • Domain: macOS Music Production, Spatial Audio, Apple Silicon Engine      │
│  • Automation: Scripter MIDI FX JavaScript, Audio Units `auval`, AppleScript│
│                                                                             │
│  [5] Avid Pro Tools Ultimate (`pro-tools/`)                                 │
│  • Domain: Industry-Standard Audio Recording, Mixing, Film Post-Production  │
│  • Automation: Pro Tools Scripting SDK (PTSL/gRPC), AAX DSP, HDX Hardware   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Application Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[ableton-live/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/music/ableton-live)** | Live Electronic Production | `ableton.v3` Python scripts, AbletonOSC, Max for Live DSP, Ableton Link |
| **[cubase/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/music/cubase)** | Orchestral Scoring & MIDI | MIDI Remote JavaScript, Expression Map XML generators, ASIO Guard |
| **[fl-studio/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/music/fl-studio)** | Beat Making & Pattern DAW | Python MIDI Scripting API, Headless CLI rendering, Parametric EQ 2 |
| **[logic-pro/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/music/logic-pro)** | macOS Native Production | Scripter JavaScript MIDI FX, Audio Units validation, Dolby Atmos 3D |
| **[pro-tools/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/music/pro-tools)** | Audio Post & Mix Workstation | PTSL gRPC Python SDK, Offline stem bounces, AAX DSP, HDX hardware |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, audio DSP development environments, and studio workflow automation pipelines. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
