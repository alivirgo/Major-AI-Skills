---
name: davinci-resolve
description: "Comprehensive operational skill specification for Anthropic Claude to automate, script, troubleshoot, and optimize DaVinci Resolve Studio 19, Python Scripting API, Fusion VFX nodes, ACES/DWG color management, and Deliver batch rendering."
category: video-editing
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["davinci-resolve", "resolve-scripting-python", "fusion-vfx", "color-grading", "fairlight", "davinci-neural-engine", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Blackmagic DaVinci Resolve Studio AI Skill Guide (Claude)

## Overview & Engine Architecture
Blackmagic Design DaVinci Resolve Studio 19 is an industry-leading post-production platform unifying non-linear editing (Cut/Edit), node-based Hollywood color grading (Color), node-based visual effects (Fusion VFX), professional audio mixing (Fairlight), and multi-format mastering (Deliver). Resolve operates on a **32-bit floating-point YRGB color engine**, supports wide-gamut color management (**ACEScc/ACEScct, DaVinci Wide Gamut Intermediate**), embeds the **DaVinci Neural Engine (AI Magic Mask, SuperScale, Speed Warp)**, and exposes complete pipeline automation via the **DaVinci Resolve Python/Lua Scripting API (`DaVinciResolveScript`)**. Claude operates as a Principal Post-Production Systems Architect and Resolve Pipeline Engineer, specializing in **Python Scripting API automation**, **GPU VRAM & CUDA memory management**, **color management transform pipelines**, and **headless batch delivery rendering**.

### DaVinci Resolve Multi-Page Pipeline & Scripting Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 DaVinci Resolve Architecture                │
│                                                             │
│  Post-Production Page Ecosystem                             │
│  ├── Media & Cut/Edit Pages (Multicam, Smart Bins, Timelines│
│  ├── Color Page (Node Graph, Serial/Parallel/Layer Nodes)   │
│  ├── Fusion Page (2D/3D VFX Compositing Node Tree, Particle)│
│  ├── Fairlight Page (2000-Track Audio Mixer, Bus FlexRouting│
│  └── Deliver Page (Render Queue, H.265, ProRes, IMF Master) │
│                                                             │
│  Compute Engine & Neural Acceleration                       │
│  ├── 32-bit Floating-Point YRGB & ACES Color Science Engine │
│  ├── DaVinci Neural Engine (CUDA, Metal, ROCm AI Shaders)   │
│  └── Multi-GPU Load Balancer & Dedicated Optical Flow Engine│
│                                                             │
│  Pipeline Automation & Developer API                        │
│  ├── DaVinci Resolve Scripting API (Python 3.10-3.12 / Lua) │
│  ├── `fuscript.exe` Standalone Script Execution Binary      │
│  └── PostgreSQL / SQLite Project Library Database Core      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **DaVinci Resolve Python Scripting Automation**: Author Python scripts connecting via `DaVinciResolveScript` to inspect Project Managers, import media clips, assemble multi-track timelines, apply LUTs, and trigger Deliver page render queues.
2. **GPU VRAM & CUDA Memory Triage**: Remediate "GPU Memory Full" exceptions during 4K/8K rendering by tuning Temporal Noise Reduction (TNR) frame radius, configuring Smart Render Cache, and optimizing Fusion memory buffers.
3. **Color Management & Gamut Mapping Architecture**: Design non-destructive color workflows configuring Color Space Transforms (CST) between Camera RAW (ARRI LogC4, REDWideGamut, Sony S-Log3) and DaVinci Wide Gamut / Rec.709.
4. **Proxy Generation & Codec Performance**: Configure automated Blackmagic Proxy Generator pipelines converting high-bitrate All-Intra footage into lightweight ProRes Proxy / DNxHR LB media.

---

## Production Python Automation: Automated Timeline Builder & Deliver Queue Exporter

Save this script as `auto_timeline_render.py` (requires DaVinci Resolve Studio running with Scripting enabled):

```python
"""
DaVinci Resolve Studio: Automated Python Pipeline Client
Connects to Resolve API, creates a project, imports media, builds timeline, and adds render job.
"""

import sys
import os

# 1. Initialize DaVinci Resolve Scripting API
def get_resolve():
    try:
        import DaVinciResolveScript as bmd
        return bmd.scriptapp("Resolve")
    except ImportError:
        # Standard Environment Fallback for Windows / macOS
        if sys.platform.startswith("win"):
            script_module = os.path.expandvars(r"%PROGRAMDATA%\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting\Modules")
        elif sys.platform.startswith("darwin"):
            script_module = "/Library/Application Support/Blackmagic Design/DaVinci Resolve/Developer/Scripting/Modules"
        else:
            script_module = "/opt/resolve/Developer/Scripting/Modules"

        sys.path.append(script_module)
        import DaVinciResolveScript as bmd
        return bmd.scriptapp("Resolve")

def automate_resolve_pipeline(project_name: str, media_folder: str, export_path: str):
    print("--- [INITIALIZING DAVINCI RESOLVE STUDIO AUTOMATION] ---")
    resolve = get_resolve()
    if not resolve:
        print("🚨 Error: Could not connect to DaVinci Resolve. Ensure Resolve Studio is open.")
        return

    # 2. Access Project Manager
    project_manager = resolve.GetProjectManager()
    project = project_manager.CreateProject(project_name)
    if not project:
        project = project_manager.LoadProject(project_name)

    print(f"• Active Project: '{project.GetName()}'")

    # 3. Import Media into Media Pool
    media_pool = project.GetMediaPool()
    root_folder = media_pool.GetRootFolder()
    
    print(f"Importing media from: {media_folder}...")
    media_files = [os.path.join(media_folder, f) for f in os.listdir(media_folder) if f.endswith((".mov", ".mp4", ".braw"))]
    clips = media_pool.ImportMedia(media_files)
    print(f"• Imported {len(clips)} clip(s) into Media Pool.")

    # 4. Create Timeline
    timeline_name = "Auto_Sequence_01"
    timeline = media_pool.CreateEmptyTimeline(timeline_name)
    print(f"• Created Timeline: '{timeline.GetName()}'")

    # Append clips to Timeline Track 1
    media_pool.AppendToTimeline(clips)

    # 5. Configure Deliver Page & Queue Render Job
    print("Configuring Deliver page render settings...")
    project.SetCurrentRenderFormatAndCodec("mp4", "H264")
    project.SetRenderSettings({
        "TargetDir": export_path,
        "CustomName": f"{project_name}_Master",
        "ExportVideo": True,
        "ExportAudio": True
    })

    project.AddRenderJob()
    print(f"✅ Successfully queued render job to: {export_path}")

    # Optional: Start Render Pass
    # project.StartRendering()

if __name__ == "__main__":
    automate_resolve_pipeline("DailyReview_Project", "C:\\Footage\\Day01", "C:\\Exports\\ReviewRenders")
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **"GPU Memory Full" Error During Color / Fusion Render** | Temporal Noise Reduction (TNR), Optical Flow Speed Warp, or 3D Fusion nodes exceeded VRAM ceiling. | 1. In *Preferences $\rightarrow$ Memory & GPU*, allocate maximum memory to Resolve.<br>2. Reduce TNR motion estimation radius from 5 to 2.<br>3. Set **Render Cache** to `Smart` (ProRes 422HQ/DNxHR SQ) to pre-bake heavy nodes. |
| **`ImportError: No module named DaVinciResolveScript`** | Python environment missing `PYTHONPATH` variable pointing to Blackmagic Developer Scripting directory. | Set environment variables:<br>`RESOLVE_SCRIPT_API=%PROGRAMDATA%\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting`<br>`PYTHONPATH=%RESOLVE_SCRIPT_API%\Modules`. |
| **Timeline Playback Stutters on 4K H.265 (HEVC) Media** | Long-GOP interframe decompression bottlenecking CPU decoding threads. | 1. In *Playback $\rightarrow$ Proxy Handling*, select **Prefer Proxies**.<br>2. Right-click clips in Media Pool $\rightarrow$ Select **Generate Proxy Media** (DNxHR LB / ProRes Proxy). |
| **Fusion Node Graph Shows Red Output Error** | Upstream `MediaIn` clip frame rate or image aspect ratio does not match timeline composition settings. | Insert a `Resize` or `Set Domain` node before the offending Fusion merge node. |

---

## Command Line Syntax & Environment Variables

```bash
# Windows Environment Variables for DaVinci Resolve Scripting
set RESOLVE_SCRIPT_API=%PROGRAMDATA%\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting
set RESOLVE_SCRIPT_LIB=C:\Program Files\Blackmagic Design\DaVinci Resolve\fusionscript.dll
set PYTHONPATH=%PYTHONPATH%;%RESOLVE_SCRIPT_API%\Modules

# Execute Standalone Fusion / Resolve Script via fuscript CLI
"C:\Program Files\Blackmagic Design\DaVinci Resolve\fuscript.exe" -l python3 "C:\Scripts\auto_timeline_render.py"
```

### Essential File Locations
- **Project Libraries**: PostgreSQL Databases or Local Disk: `%APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Resolve Project Library\`
- **LUTs Directory**: `...\DaVinci Resolve\LUT\`
- **Fusion Compositions**: `*.comp` / `.setting`

---

## Agent Operational Directive
> **MANDATORY**: Always configure `PYTHONPATH` and `RESOLVE_SCRIPT_LIB` environment variables before running automated Python pipelines against DaVinci Resolve Studio.
