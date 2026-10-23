---
name: vegas-pro
description: "Automate MAGIX VEGAS Pro timelines with ScriptPortal.Vegas C# scripting, batch region renders, and NVENC/OFX crash triage without inventing licenses."
category: video-editing
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["vegas-pro", "scriptportal", "csharp", "openfx", "nvenc", "windows-nle"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# MAGIX VEGAS Pro NLE & Automation AI Skill Guide (Claude)

## Overview & Engine Architecture

MAGIX **VEGAS Pro** (pin e.g. **21 / 22 / 23**) on Windows combines a multi-track timeline, **32-bit float** processing, **OpenFX (OFX)** effects, hardware encoders (**NVENC / QSV / VCE**), and **`.NET` scripting** via **`ScriptPortal.Vegas`**. Entry point: `EntryPoint.FromVegas(Vegas vegas)` in compile-on-demand `.cs` under the Script Menu, or `/SCRIPT` CLI launch. Prefer **Studio/driver** discipline for GPU renders.

```
┌─────────────────────────────────────────────────────────────┐
│                 VEGAS Pro edit → script → render              │
│                                                             │
│  Timeline                                                   │
│  ├── Tracks / Events / Regions / Markers                    │
│  ├── Media Pool / nested projects                           │
│  └── Pan/Crop, OFX, audio (ASIO capable)                    │
│                                                             │
│  Automation                                                 │
│  ├── ScriptPortal.Vegas (C# compile-on-demand)              │
│  ├── RenderArgs + RenderTemplate enumeration                │
│  └── vegaspro.exe /SCRIPT:"…" [/SCRIPTARGS]                 │
│                                                             │
│  Hardware                                                   │
│  ├── GPU OFX + Dynamic RAM Preview                          │
│  └── NVENC/QSV/VCE encode paths                             │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Batch region/marker renders, track scaffolding, event alignment via C#.
- Triaging NVENC/OFX crashes, VFR sync drift, corrupted prefs.
- Windows-centric NLE automation where Premiere/FCP are not the house tool.

**Do not use when**

- macOS Final Cut / Compressor pipelines → `@final-cut-pro`.
- Lossless GOP trim only → `@losslesscut`.
- Requests for cracked OFX licenses or serial keys → refuse.

---

## Operational Capabilities & Agent Directives

1. **Script entry**: `public class EntryPoint { public void FromVegas(Vegas vegas) { … } }` with `using ScriptPortal.Vegas;`.
2. **Templates by enumeration**: never hardcode a single template string without scanning `vegas.Renderers` / `Templates` and failing clearly if missing.
3. **Region batch**: iterate `vegas.Project.Regions` with `RenderArgs.Start/Length`.
4. **VFR hygiene**: smartphone/OBS/Zoom sources → CFR transcode (`@ffmpeg`) before editorial sync trust.
5. **Render crash triage**: set **Dynamic RAM Preview max = 0 MB** during heavy NVENC/OFX renders; prefer NVIDIA **Studio** drivers.
6. **Prefs reset**: Ctrl+Shift at launch → clear cached application data when stuck on “Creating Windows…”.
7. **Version paths**: Script Menu `%USERPROFILE%\Documents\Vegas Script Menu\`; prefs under `%APPDATA%\VEGAS Pro\<ver>\` — parameterize major version.

---

## Production Example: region batch exporter (C#)

Save as `BatchRenderRegions.cs` in the Vegas Script Menu:

```csharp
using System;
using System.IO;
using System.Windows.Forms;
using ScriptPortal.Vegas;

public class EntryPoint {
    public void FromVegas(Vegas vegas) {
        string outputDirectory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
            "VegasExports", "BatchRegions");
        Directory.CreateDirectory(outputDirectory);

        Renderer targetRenderer = null;
        RenderTemplate targetTemplate = null;
        foreach (Renderer r in vegas.Renderers) {
            if (r.FileTypeName != null && r.FileTypeName.IndexOf("MAGIX AVC/AAC MP4", StringComparison.OrdinalIgnoreCase) >= 0) {
                targetRenderer = r;
                foreach (RenderTemplate t in r.Templates) {
                    if (t.Name != null && t.Name.IndexOf("Internet HD 1080p", StringComparison.OrdinalIgnoreCase) >= 0) {
                        targetTemplate = t;
                        break;
                    }
                }
                break;
            }
        }
        if (targetRenderer == null || targetTemplate == null) {
            MessageBox.Show("MAGIX AVC 1080p template not found. Pick a local template name.");
            return;
        }
        if (vegas.Project.Regions.Count == 0) {
            MessageBox.Show("No regions. Mark regions first (R).");
            return;
        }

        int ok = 0;
        foreach (Region region in vegas.Project.Regions) {
            string label = string.IsNullOrEmpty(region.Label) ? ("Region_" + ok) : region.Label;
            foreach (char c in Path.GetInvalidFileNameChars())
                label = label.Replace(c, '_');
            var args = new RenderArgs {
                OutputFile = Path.Combine(outputDirectory, label + ".mp4"),
                RenderTemplate = targetTemplate,
                Start = region.Position,
                Length = region.Length
            };
            if (vegas.Render(args) == RenderStatus.Complete) ok++;
        }
        MessageBox.Show(string.Format("Rendered {0}/{1} → {2}", ok, vegas.Project.Regions.Count, outputDirectory));
    }
}
```

CLI pattern (versioned install path varies):

```bat
"C:\Program Files\VEGAS\VEGAS Pro 23.0\Vegas230.exe" /SCRIPT:"%USERPROFILE%\Documents\Vegas Script Menu\BatchRenderRegions.cs"
```

Validation:

```text
1. Place regions; confirm template exists in File → Render As list
2. Dynamic RAM Preview = 0 for stress renders
3. Spot-check A/V sync on phone/OBS footage (CFR?)
4. Re-scan OFX if plugins missing after crash
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Access violation / NVENC crash | VRAM fight with RAM Preview / OFX | Dynamic RAM Preview 0 MB; Studio driver; simplify GPU FX |
| A/V drift on phone/OBS clips | Variable frame rate | `ffmpeg … -vsync cfr` (or fps filter) pre-transcode |
| Hang “Creating Windows…” | Corrupt prefs / plugin scan | Ctrl+Shift launch → delete cached app data |
| OFX watermark / missing | License daemon / scan | Tools → Re-scan OFX; valid license (no cracks) |
| Template not found in script | Localized/renamed template | Enumerate and match; let operator pick |
| Script won’t compile | Missing `ScriptPortal.Vegas` ref | Run as `.cs` in Script Menu or reference DLL from install dir |

---

## Best Practices

1. Sanitize region labels for filenames; refuse overwrite unless flagged.
2. Log `RenderStatus` and HRESULT/`ErrorMessage` when using progress events.
3. Keep project media on fast local/SSD for timeline scrub; network for archive.
4. Document VEGAS major version beside every script.
5. Prefer hardware encode presets the studio validates; soft-fail if missing.

---

## Limitations

- Scripting API surface evolves per major version — verify against installed Scripting API summary.
- Not a substitute for Premiere Productions / FCP Libraries collaboration models.
- GPU encode quality/compatibility varies by driver and template.
- Stop and ask if render template name, GPU vendor, or project frame rate is unknown.

---

## Related Skills

- `@ffmpeg` — CFR fixes, proxies, loudness
- `@adobe-premiere-pro` — alternate Windows/mac NLE
- `@davinci-resolve` — color finish
- `@losslesscut` — lossless selects before VEGAS ingest

---

## Agent Operational Directive

> **MANDATORY**: Enumerate render templates and fail clearly if missing. For heavy GPU renders, zero Dynamic RAM Preview. Preflight VFR sources to CFR. Never provide cracked serials or OFX license bypasses.

---

## Source anchors (research)

- [VEGAS Pro 23 — Using Scripting](https://help.magix-hub.com/video/vegas/23/en/content/topics/11-autoscript/scripting_vegas.htm)
- [Scripting FAQ](https://help.magix-hub.com/video/vegas/23/en/content/topics/external/scriptfaq_general.htm)
- [VEGAS Pro Scripting API Summary (22)](https://help.magix-hub.com/video/vegas/22/en/content/topics/external/vegasscriptapi.html)
