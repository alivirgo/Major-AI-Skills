# Medical Image Computing, DICOM Informatics & Radiology Suite (`skills/medical/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for clinical DICOM workstations, multi-planar image computing platforms, surgical planning engines, and PACS networking tools.

Each tool ecosystem includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (medical informatics systems, MRML scene graph automation, DICOM C-STORE/C-FIND pipelines, SQLite index recovery).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal slice alignment review, Window/Level calibration, PET-CT fusion tuning, 3D MPR crosshair diagnostics).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (3D Slicer `ScriptedLoadableModule` Python extensions, Objective-C `PluginFilter` development, AppleScript DICOM automation, WADO-RS web clients).

---

## Medical Imaging Domain Architecture & Pipeline Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Medical Imaging & Informatics Map                           │
│                                                             │
│  [1] 3D Slicer (`3d-slicer/`)                                               │
│  • Domain: Medical Image Computing, Surgical Planning, ITK/VTK Pipelines    │
│  • Automation: MRML Python Scripting, Segment Editor Thresholding, STL Mesh │
│                                                                             │
│  [2] Horos (`horos/`)                                                       │
│  • Domain: Open-Source 64-bit DICOM Viewing, Research Workstation, DCMTK    │
│  • Automation: Python `pynetdicom` C-STORE Dispatch, SQLite Repair, Plugins │
│                                                                             │
│  [3] OsiriX MD (`osirix/`)                                                  │
│  • Domain: Clinical Radiology Workstation, Multi-Head Hanging Protocols     │
│  • Automation: Hierarchical C-FIND/C-MOVE Queries, AppleScript Dictionary   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Application Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[3d-slicer/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/medical/3d-slicer)** | Medical Image Computing | MRML Python scripts, Bone segmentation, STL mesh export, VTK filters |
| **[horos/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/medical/horos)** | Open-Source DICOM Viewer | `pynetdicom` C-STORE dispatch, MPR crosshairs, Objective-C `PluginFilter` |
| **[osirix/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/medical/osirix)** | Clinical Radiology Workstation | Hierarchical PACS C-MOVE retrieve, AppleScript automation, PET-CT fusion |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, biomedical engineering pipelines, and clinical PACS administration scripts. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
