# Electronic Design Automation (EDA) & Semiconductor Engineering Suite (`skills/eda/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for industry-standard Electronic Design Automation (EDA), PCB design, transistor-level IC layout, and SPICE circuit simulation suites.

Each tool ecosystem includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (analytical circuit diagnostics, high-speed signal integrity, physical verification DRC/LVS, convergence tuning).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal PCB 3D inspection, layout polygon review, ViVA waveform eye diagrams, Bode plot stability).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (DXP API scripting, Cadence SKILL layout procedures, Pcbnew Python AST synthesis, PyLTSpice batch automation).

---

## EDA Domain Architecture & Pipeline Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Electronic Design Automation (EDA) Map                      │
│                                                                             │
│  [1] Altium Designer (`altium-designer/`)                                   │
│  • Domain: Unified PCB Layout, High-Speed Routing, Layer Stack Management   │
│  • Automation: DXP Scripting (DelphiScript/Python), OutJob CAM Release Pkgs  │
│                                                                             │
│  [2] Cadence Virtuoso (`cadence-virtuoso/`)                                 │
│  • Domain: Transistor-Level Analog/RF/Mixed-Signal IC Design, OpenAccess    │
│  • Automation: Cadence SKILL Layout Procedures, OCEAN PVT Batch Simulations │
│                                                                             │
│  [3] KiCad (`kicad/`)                                                       │
│  • Domain: Open-Source PCB Design, S-Expressions, PNS Push & Shove Routing  │
│  • Automation: `kicad-cli` Headless Toolchain, Pcbnew Python 3 API, iBOM    │
│                                                                             │
│  [4] Analog Devices LTspice (`ltspice/`)                                    │
│  • Domain: Non-Linear SPICE Simulation, Switch-Mode Power Supplies (SMPS)   │
│  • Automation: Batch CLI Sim (`-b -Run`), Binary `.raw` Parser, .MEAS Direct.│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Application Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[altium-designer/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/eda/altium-designer)** | Enterprise PCB Layout & ECAD | DXP DelphiScript automation, DRC violation triage, OutJob CAM exports |
| **[cadence-virtuoso/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/eda/cadence-virtuoso)** | Analog & Mixed-Signal IC Design | Cadence SKILL procedural layout, OCEAN PVT sweeps, Spectre simulation |
| **[kicad/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/eda/kicad)** | Open-Source PCB Layout & EDA | `kicad-cli` CI/CD pipelines, Pcbnew Python layout scripts, S-expression ASTs |
| **[ltspice/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/eda/ltspice)** | SPICE Simulation & Power Electronics | SMPS convergence tuning, PyLTSpice batch sweeps, Bode loop stability |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, automated hardware lab pipelines, and semiconductor design flows. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
