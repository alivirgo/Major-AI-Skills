---
title: "Blackmagic DaVinci Resolve Studio AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize DaVinci Resolve Studio, Python/Lua Scripting API, Fusion VFX programmatic node trees, and automated proxy rendering."
category: "Professional Video Editing, Color Grading & VFX"
tags: ["davinci-resolve", "resolve-python-api", "fusion-lua-scripting", "proxy-automation", "gpt-codex", "vfx-pipeline"]
---

# Blackmagic DaVinci Resolve Studio AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
DaVinci Resolve Studio exposes dual automation interfaces: the **Resolve Python/Lua Scripting API (`DaVinciResolveScript`)** for project, media pool, timeline, and render queue orchestration, and the **Fusion VFX Scripting API** for programmatic node graph generation. GPT/Codex acts as a Principal Post-Production Software Engineer and VFX Pipeline Developer, delivering **automated Resolve Python ingestion scripts**, **programmatic Fusion VFX node generators**, **batch proxy rendering pipelines**, and **metadata tagging automations**.

### Developer Architecture & VFX Pipeline Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 DaVinci Resolve Developer Platform          │
│                                                             │
│  Resolve Studio Python & Lua Architecture                   │
│  ├── `Resolve` Root Object (`GetProjectManager()`)          │
│  ├── `MediaPool` API (`ImportMedia`, `CreateEmptyTimeline`) │
│  └── `Project` API (`SetRenderSettings`, `AddRenderJob`)    │
│                                                             │
│  Fusion VFX Node Scripting Engine                           │
│  ├── Fusion Composition Model (`comp:AddTool()`)            │
│  ├── Tool Parameter Connectors & Keyframe Splines           │
│  └── Automated Motion Graphics & Title Generative Scripts   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Resolve Python Scripting API Development**: Author Python scripts connecting via `DaVinciResolveScript` to inspect Project Managers, import media clips, assemble multi-track timelines, apply LUTs, and trigger Deliver page render queues.
2. **Fusion VFX Programmatic Node Generation**: Write Python/Lua scripts generating complex Fusion node trees (*e.g. `Background` $\rightarrow$ `TextPlus` $\rightarrow$ `Glow` $\rightarrow$ `Merge` $\rightarrow$ `MediaOut`*) with animated keyframes.
3. **Automated Metadata Tagging & Bin Organization**: Build pipelines reading external camera CSV logs and injecting Scene, Take, Camera Angle, and Good Take metadata flags into Media Pool clips.
4. **Automated Batch Export & Transcoding Pipelines**: Script headless batch render passes outputting web proxies, editorial DNxHR/ProRes mezzanine files, and archive packages.

---

## Production Python Automation: Automated Fusion VFX Lower-Third Generator Script

Save this script as `create_fusion_lower_third.py` (execute inside Resolve Python console or via `fuscript`):

```python
"""
DaVinci Resolve: Programmatic Fusion VFX Lower-Third Generator
Creates a Fusion Composition tool tree with animated TextPlus, Background banner, and Glow nodes.
"""

import sys

def build_fusion_lower_third(comp, title_text: str, subtitle_text: str):
    print(f"--- [BUILDING FUSION VFX LOWER-THIRD: '{title_text}'] ---")
    
    comp.Lock() # Lock composition during node tree generation

    # 1. Create Background Banner Node
    bg_banner = comp.AddTool("Background", -3, 0)
    bg_banner.TopLeftRed = 0.05
    bg_banner.TopLeftGreen = 0.05
    bg_banner.TopLeftBlue = 0.1
    bg_banner.TopLeftAlpha = 0.85
    bg_banner.Width = 1920
    bg_banner.Height = 1080

    # 2. Create Title TextPlus Node
    text_title = comp.AddTool("TextPlus", -2, -1)
    text_title.StyledText = title_text
    text_title.Font = "Arial"
    text_title.Style = "Bold"
    text_title.Size = 0.06
    text_title.Center = [0.25, 0.22] # Lower Left
    text_title.HorizontalJustificationNew = 0 # Left Align

    # 3. Create Subtitle TextPlus Node
    text_sub = comp.AddTool("TextPlus", -2, 1)
    text_sub.StyledText = subtitle_text
    text_sub.Font = "Arial"
    text_sub.Style = "Regular"
    text_sub.Size = 0.035
    text_sub.Center = [0.25, 0.16]
    text_sub.TopLeftRed = 0.8
    text_sub.TopLeftGreen = 0.8
    text_sub.TopLeftBlue = 0.8

    # 4. Merge Text Elements
    merge_text = comp.AddTool("Merge", -1, 0)
    merge_text.ConnectInput("Background", text_title)
    merge_text.ConnectInput("Foreground", text_sub)

    # 5. Merge Over Background Banner
    merge_final = comp.AddTool("Merge", 0, 0)
    merge_final.ConnectInput("Background", bg_banner)
    merge_final.ConnectInput("Foreground", merge_text)

    # Connect to MediaOut1
    media_out = comp.FindTool("MediaOut1")
    if media_out:
        media_out.ConnectInput("Input", merge_final)

    comp.Unlock()
    print("✅ Fusion lower-third node tree generated successfully!")

# To run inside DaVinci Resolve Fusion Console:
# build_fusion_lower_third(comp, "Dr. Jane Doe", "Lead Research Scientist")
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`comp.AddTool()` Returns `None`** | Fusion tool identifier misspelled or target plugin not loaded in Fusion registry. | Use standard tool names: `TextPlus`, `Background`, `Merge`, `ColorCorrector`, `Glow`, `Transform`. |
| **`project.AddRenderJob()` Fails** | Render settings contain contradictory parameters (e.g. ProRes format requested on Windows without Apple ProRes encoder). | On Windows, use `H264`/`H265`/`DNxHR`; on macOS, use `ProRes`/`H264`. |
| **Timeline Clip Insertion Displaces Existing Cuts** | Used `InsertMedia` (ripple insert) instead of `AppendToTimeline` or `Overwrite`. | Use `timeline.CreateEmptyTrack()` and target specific video track indices before insertion. |
| **Python Script Hangs on `scriptapp('Resolve')`** | Multiple DaVinci Resolve processes running or Resolve was launched in background mode without GUI. | Launch standard DaVinci Resolve Studio desktop application before initializing Python bridge. |

---

## Command Line Syntax & Batch Processing

```bash
# Execute Fusion Script via fuscript Binary
"C:\Program Files\Blackmagic Design\DaVinci Resolve\fuscript.exe" -l python3 "C:\Scripts\create_fusion_lower_third.py"

# Query Active Projects via Python One-Liner
python -c "import DaVinciResolveScript as bmd; r = bmd.scriptapp('Resolve'); pm = r.GetProjectManager(); print(pm.GetProjectListInCurrentFolder())"
```

### Essential File Locations
- **Script Modules**: `%PROGRAMDATA%\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting\Modules\`
- **Fusion Tool Presets**: `%APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Templates\`

---

## Agent Operational Directive
> **MANDATORY**: When building Fusion VFX node trees via scripting, always call `comp.Lock()` before creating tools and `comp.Unlock()` upon completion to prevent viewport thread locks.
