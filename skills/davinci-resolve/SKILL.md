---
name: davinci-resolve
description: "Automate DaVinci Resolve media and timelines with its scripting API, build Fusion workflows, and configure render jobs."
category: video-editing
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["davinci-resolve", "resolve-scripting", "fusion", "color-management", "deliver", "batch", "studio"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Blackmagic DaVinci Resolve Studio AI Skill Guide (Claude)

## Overview & Engine Architecture

DaVinci Resolve **Studio** (pin e.g. **19.x / 20.x / 21.x**) unifies Edit, Color, Fusion, Fairlight, Deliver. Pipeline automation uses **`DaVinciResolveScript`** (Python/Lua), optional **`fuscript.exe`**, and **Deliver** render queue APIs. Color: **YRGB 32-bit**, **ACES / DWG**, timeline **Color Management** settings drive all outputs.

**License gate (critical):** From **Resolve 19.1+**, **external** scripting (`scriptapp("Resolve")` from a separate Python process) is **Studio-only**. Free edition: Console/Workspace scripts only — plan automation accordingly ([community reports](https://www.reddit.com/r/davinciresolve/comments/17bke61/), BMD docs). AI features may require **Extras** downloads before API calls succeed.

```
┌─────────────────────────────────────────────────────────────┐
│  PYTHONPATH → DaVinciResolveScript → Project / MediaPool    │
│  Deliver: SetCurrentRenderFormatAndCodec + AddRenderJob     │
│  Headless: Resolve -nogui (API still available)             │
│  Color: project color science + CST nodes → export tags     │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when:** batch ingest, timeline assembly, render queue, metadata, Fusion comp batch, OTIO/XML interchange (file-based, not always scripting).

**Do not use when:** Studio license unavailable and external Python is required; expect Free + external process to fail silently.

---

## Operational Capabilities & Agent Directives

1. **Environment (Windows):** `RESOLVE_SCRIPT_API`, `RESOLVE_SCRIPT_LIB` (path to `fusionscript.dll`), `PYTHONPATH` → `...\Developer\Scripting\Modules`.
2. **Studio check:** Fail fast if `resolve.GetProductName()` / license APIs indicate Free when external automation is required.
3. **Deliver pipeline:** Set format/codec → `SetRenderSettings` (`TargetDir`, `CustomName`, `SelectAllFrames`, `ExportVideo`, `ExportAudio`) → `AddRenderJob()` → `StartRendering()`; poll `IsRenderingInProgress()`.
4. **Color / export:** Match **timeline color science** to deliverable — Rec.709 gamma 2.4 for H.264 web; ACES2065-1 EXR for VFX handoff. Wrong **Color Space Transform** order in nodes causes legal-range clipping in H.264.
5. **Deterministic stills:** Fixed timeline frame export via `ExportCurrentFrameAsStill` or Deliver with single-frame range; disable noise reduction variance for regression where possible.
6. **GPU memory:** TNR, Fusion 3D, oversampled comps → VRAM exhaustion — Smart Render Cache, proxy workflow, reduce TNR radius.
7. **Python version:** Match Resolve-supported Python (check Help → Documentation → Developer); do not mix conda env without matching Resolve's embedded expectations.

---

## Production Python: connect + queue H.264 deliverable

```python
import os, sys

def get_resolve():
    if sys.platform.startswith("win"):
        api = os.environ.get("RESOLVE_SCRIPT_API") or os.path.expandvars(
            r"%PROGRAMDATA%\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting"
        )
        sys.path.append(os.path.join(api, "Modules"))
    import DaVinciResolveScript as bmd
    resolve = bmd.scriptapp("Resolve")
    if not resolve:
        raise RuntimeError("Resolve not running or external scripting unavailable (Studio required)")
    return resolve

def queue_mp4(project, timeline, out_dir, name):
    project.SetCurrentTimeline(timeline)
    project.LoadRenderPreset("H.264 Master")  # or SetCurrentRenderFormatAndCodec
    project.SetRenderSettings({
        "TargetDir": out_dir,
        "CustomName": name,
        "ExportVideo": True,
        "ExportAudio": True,
    })
    project.AddRenderJob()
    project.StartRendering()
    while project.IsRenderingInProgress():
        pass
    if project.GetRenderJobStatus(0).get("JobStatus") != "Complete":
        raise RuntimeError("Render failed: " + str(project.GetRenderJobStatus(0)))

# resolve = get_resolve()
# pm = resolve.GetProjectManager()
# project = pm.LoadProject("MyProject")
# timeline = project.GetTimelineByIndex(1)
# queue_mp4(project, timeline, r"C:\Exports", "master")
```

---

## Failure taxonomy

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| `ImportError: DaVinciResolveScript` | PYTHONPATH | Set env vars; use Resolve-bundled Python |
| External script no connect | Free edition / 19.1+ gate | Studio license |
| API returns False | Studio-only function on Free | Guard feature matrix |
| GPU memory full | TNR / Fusion | Proxies, cache, lower radius |
| H.264 dull/wrong | Display-referred vs scene-referred | CST + correct output gamma |
| HEVC edit stutter | Long-GOP | Proxy media (DNxHR LB / ProRes Proxy) |

**Headless:** `Resolve.exe -nogui` — scripting APIs documented as available without UI ([Scripting API wiki](https://wiki.dvresolve.com/developer-docs/scripting-api)).

---

## Agent Operational Directive

> **MANDATORY**: Confirm Studio + external scripting before building separate-process agents. Set PYTHONPATH every run. Align timeline color science with Deliver codec. Poll render job status; never assume `StartRendering` success without status check.
