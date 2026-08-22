# 3D Modeling, Procedural VFX & PBR Material Engineering Suite (`skills/3d/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for industry-standard 3D modeling, visual effects, digital sculpting, and procedural texture authoring applications.

Each application ecosystem includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (analytical diagnostics, step-by-step pipeline reasoning, system safety).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal viewport inspection, shader graph debugging, visual triage).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (Python SDK scripting, automation tool creation, headless CLI batch rendering).

---

## 3D Domain Architecture & Pipeline Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          3D Production Ecosystem                            │
│                                                                             │
│  [1] Maxon Cinema 4D (`cinema-4d/`)                                         │
│  • Domain: 3D Motion Graphics, Procedural MoGraph, Redshift GPU Raytracing  │
│  • Automation: C4DPy (Python 3.11), Maxon Node Graph API, Commandline.exe   │
│                                                                             │
│  [2] SideFX Houdini (`houdini/`)                                            │
│  • Domain: Procedural VFX, Dynamics (FLIP/Pyro/Vellum/RBD), Solaris / Karma │
│  • Automation: VEX SIMD Language, Python `hou` API via Hython, PDG/TOPs     │
│                                                                             │
│  [3] Maxon ZBrush (`zbrush/`)                                               │
│  • Domain: High-Resolution Digital Sculpting, DynaMesh, ZRemesher, Polypaint│
│  • Automation: ZScript Command Language, Decimation Master, Multi-Map Export│
│                                                                             │
│  [4] Adobe Substance 3D Painter (`substance-painter/`)                      │
│  • Domain: PBR Material Authoring, UDIM Multi-Tile Painting, Mesh Baking    │
│  • Automation: `substance_painter` Python API, Substance Automation Toolkit │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Application Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[cinema-4d/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/3d/cinema-4d)** | Motion Graphics & Redshift Rendering | MoGraph cloners, Redshift PBR nodes, C4DPy batch exporters |
| **[houdini/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/3d/houdini)** | Procedural Simulation & Solaris USD | VEX wranglers, Hython sim baking, Karma XPU MaterialX shaders |
| **[zbrush/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/3d/zbrush)** | Digital Sculpting & Organic Modeling | ZScript batch decimation, 32-bit UDIM displacement, ZRemesher |
| **[substance-painter/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/3d/substance-painter)** | PBR Texture Painting & Mesh Baking | Channel packing presets (ORM), Python batch exporters, SAT tooling |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, automated CI/CD digital content creation pipelines, and local IDE agent workflows. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
