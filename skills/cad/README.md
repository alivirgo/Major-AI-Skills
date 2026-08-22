# CAD, CAM, PLM & Computational Geometry Engineering Suite (`skills/cad/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for industry-standard Computer-Aided Design (CAD), Computer-Aided Manufacturing (CAM), Product Lifecycle Management (PLM), and Computational Geometry engineering platforms.

Each CAD software suite includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (analytical geometry diagnostics, B-Rep topology validation, system safety).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal inspection of Zebra stripe continuity, CAM toolpath simulations, FEA stress contours).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (COM/ActiveX Python scripting, .NET Add-In development, headless batch CAD converters).

---

## CAD Domain Architecture & Pipeline Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CAD & PLM Engineering Ecosystem                       │
│                                                                             │
│  [1] Dassault Systèmes CATIA (`catia/`)                                     │
│  • Domain: Aerospace/Automotive Class-A GSD Surfacing, DMU, 3DEXPERIENCE PLM│
│  • Automation: Win32 COM (`CATIA.Application`), CATScript, Knowledgeware    │
│                                                                             │
│  [2] Autodesk Fusion (`fusion-360/`)                                        │
│  • Domain: Cloud-Integrated Parametric CAD, 5-Axis CAM, Generative Design   │
│  • Automation: In-Process Python API (`adsk.fusion`), JavaScript CAM Posts  │
│                                                                             │
│  [3] McNeel Rhinoceros (`rhino/`)                                           │
│  • Domain: Mathematical NURBS Surfaces, SubD, Grasshopper Computational Flow│
│  • Automation: RhinoCommon (C# / Python 3), Grasshopper Hops, Rhino.Compute │
│                                                                             │
│  [4] Siemens NX (`siemens-nx/`)                                             │
│  • Domain: Parasolid B-Rep Engine, Synchronous Technology, Teamcenter PLM   │
│  • Automation: NX Open API (`import NXOpen`), Headless `run_journal.exe`    │
│                                                                             │
│  [5] Dassault Systèmes SOLIDWORKS (`solidworks/`)                           │
│  • Domain: Parametric Mechanical Design, Sheet Metal, Assembly Mates, FEA   │
│  • Automation: COM Interop (`SldWorks.Application`), Document Manager API   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Application Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[catia/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cad/catia)** | Class-A Surfacing & Aerospace PLM | GSD surfaces, COM BOM extractors, DMU clash detection, DSLS |
| **[fusion-360/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cad/fusion-360)** | Cloud Parametric CAD & Adaptive CAM | Parametric timeline repair, Python Add-Ins, CAM stock simulation |
| **[rhino/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cad/rhino)** | Freeform NURBS & Computational Design | RhinoCommon Python, Grasshopper data trees, Rhino.Compute |
| **[siemens-nx/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cad/siemens-nx)** | Parasolid Kernel & Synchronous Direct Edit | NX Open journals, Examine Geometry healing, Teamcenter integration |
| **[solidworks/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cad/solidworks)** | Mechanical Engineering & Sheet Metal | FeatureManager rebuilds, Python COM automation, Assembly mates |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, automated mechanical design pipelines, and headless CAD batch servers. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
