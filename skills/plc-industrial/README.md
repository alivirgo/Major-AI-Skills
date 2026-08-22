# PLC Programming, Industrial Automation & Control Systems Suite (`skills/plc-industrial/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for premier industrial automation environments, IEC 61131-3 controllers, fieldbus networks (EtherCAT, PROFINET, EtherNet/IP CIP), and PLC programmatic APIs.

Each tool ecosystem includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (industrial controls architecture, deterministic real-time scheduling, socket communication `snap7`/`pycomm3`, CI/CD build scripts).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal UI inspection, ladder logic power flow verification, PROFINET/EtherCAT topology diagnostics, watch table analysis).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (Structured Text state machine algorithms, TIA Openness .NET scripts, L5X XML generators, OPC UA async telemetry clients).

---

## Industrial Automation Domain Architecture & Pipeline Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Industrial Automation & PLC Architecture Map                │
│                                                             │
│  [1] CODESYS V3.5 (`codesys/`)                                              │
│  • Domain: Hardware-Agnostic IEC 61131-3, EtherCAT, Embedded OPC UA Server  │
│  • Automation: CODESYS ScriptEngine (Python), Async OPC UA Client, WebVisu  │
│                                                                             │
│  [2] Rockwell Studio 5000 (`rockwell-studio-5000/`)                         │
│  • Domain: Allen-Bradley ControlLogix & CompactLogix, CIP EtherNet/IP       │
│  • Automation: `pycomm3` CIP Multi-Tag Client, L5X XML Rung Generator, AOIs │
│                                                                             │
│  [3] Siemens TIA Portal (`siemens-tia-portal/`)                             │
│  • Domain: SIMATIC S7-1200/1500, PROFINET IRT, SCL & WinCC Unified HMI      │
│  • Automation: TIA Openness .NET API (`pythonnet`), `python-snap7`, SCL Gen │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Application Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[codesys/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/plc-industrial/codesys)** | IEC 61131-3 Platform | ScriptEngine Python builder, `asyncua` OPC UA client, EtherCAT topology |
| **[rockwell-studio-5000/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/plc-industrial/rockwell-studio-5000)** | Allen-Bradley Logix Designer | `pycomm3` CIP driver, L5X ladder XML generator, Major Fault diagnostics |
| **[siemens-tia-portal/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/plc-industrial/siemens-tia-portal)** | SIMATIC S7 & PROFINET | TIA Openness (.NET), `python-snap7` S7comm client, SCL code generator |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, industrial automation CI/CD pipelines, and SCADA telemetry systems. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
