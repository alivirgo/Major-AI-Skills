---
name: final-cut-pro
description: "Author valid FCPXML for Final Cut Pro, manage Library render caches, and drive Apple Compressor CLI delivers without inventing credentials."
category: video-editing
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["final-cut-pro", "fcpxml", "compressor", "prores", "magnetic-timeline", "apple-silicon"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Apple Final Cut Pro NLE AI Skill Guide (Claude)

## Overview & Engine Architecture

Final Cut Pro (macOS) centers on the **Magnetic Timeline** (primary storyline + connected clips), **Libraries (`.fcpbundle`)**, Roles, and Apple Silicon Media Engine (ProRes/HEVC). Programmatic authoring is **file-based FCPXML** (versioned DTD — e.g. **1.11 → 1.12 (FCP 10.8)** → **1.13 (FCP 11)**; newer hosts may export still higher). Headless encodes use **Apple Compressor CLI**. Motion templates live under `~/Movies/Motion Templates.localized/`.

FCP 11+ highlights agents should know: **Magnetic Mask**, **Transcribe to Captions** (Apple silicon + Sequoia+), **spatial video**, higher timeline fps (90/100/120).

```
┌─────────────────────────────────────────────────────────────┐
│                 Final Cut Pro interchange loop                │
│                                                             │
│  Editorial                                                  │
│  ├── Library.fcpbundle → Events → Projects                  │
│  ├── Magnetic Timeline / Multicam / Compound clips          │
│  └── Roles, captions, Motion titles                         │
│                                                             │
│  Automation                                                 │
│  ├── FCPXML (rational times, resources, spine)              │
│  ├── DTD gate via xmllint against host DTD                  │
│  └── Compressor CLI (.cmprstng / batch)                     │
│                                                             │
│  Media engine                                               │
│  ├── ProRes / ProRes RAW / proxy media                      │
│  └── Background render + optical flow caches                │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Generating/validating FCPXML for assembly, markers, roles, or captions handoff.
- Library hygiene (delete generated render files) and proxy workflows.
- Batch delivery via Compressor presets.

**Do not use when**

- Windows-only NLE automation → `@vegas-pro` / `@adobe-premiere-pro` / `@davinci-resolve`.
- Lossless GOP cutting without Magnetic Timeline → `@losslesscut`.
- Inventing Apple ID / App Store credentials for Compressor entitlement prompts → refuse; operator signs in locally.

---

## Operational Capabilities & Agent Directives

1. **Match FCPXML `version` to target FCP**; newer XML will not import into older FCP (“DTD not recognized”). Prefer exporting from the oldest required host or a known converter.
2. **Rational times**: use frame fractions (`100/2400s` for 24fps family, `100/3000s` for 30fps family)—avoid float seconds for editorial accuracy when possible.
3. **Resources first**: `format` + `asset` IDs, then `library` → `event` → `project` → `sequence` → `spine`.
4. **Library size**: purge render/optimized/proxy via **File → Delete Generated Library Files**; disable background render when disk is constrained.
5. **Compressor CLI**: encode with documented `-settingpath` `.cmprstng` and output dir; expect first-run App Store entitlement UI on some machines.
6. **Proxies**: Proxy Preferred for ProRes RAW / 8K when storage bandwidth saturates.
7. **Motion templates**: missing titles → check `~/Movies/Motion Templates.localized/` paths.

---

## Production Example: FCPXML 1.11-compatible assembly generator

```python
"""Generate a minimal importable FCPXML (declare version your target FCP accepts)."""
from __future__ import annotations

import sys
import xml.etree.ElementTree as ET


def generate_fcpxml(project_name: str, asset_uri: str, out_path: str, version: str = "1.11") -> None:
    root = ET.Element("fcpxml", {"version": version})
    resources = ET.SubElement(root, "resources")
    ET.SubElement(
        resources,
        "format",
        {
            "id": "r1",
            "name": "FFVideoFormat3840x2160p24",
            "frameDuration": "100/2400s",
            "width": "3840",
            "height": "2160",
            "colorSpace": "1-1-1 (Rec. 709)",
        },
    )
    ET.SubElement(
        resources,
        "asset",
        {
            "id": "r2",
            "name": "Interview_A_Cam",
            "src": asset_uri,  # file:///Volumes/...
            "start": "0s",
            "duration": "600s",
            "hasVideo": "1",
            "hasAudio": "1",
            "format": "r1",
        },
    )
    library = ET.SubElement(root, "library", {"location": "file:///Volumes/Media/AutoLibrary.fcpbundle"})
    event = ET.SubElement(library, "event", {"name": "Automated_Assembly"})
    project = ET.SubElement(event, "project", {"name": project_name})
    sequence = ET.SubElement(
        project,
        "sequence",
        {"format": "r1", "duration": "60s", "tcStart": "0s", "tcFormat": "NDF"},
    )
    spine = ET.SubElement(sequence, "spine")
    clip = ET.SubElement(
        spine,
        "asset-clip",
        {
            "ref": "r2",
            "offset": "0s",
            "name": "Interview_A_Cam_Take1",
            "start": "10s",
            "duration": "60s",
            "format": "r1",
        },
    )
    ET.SubElement(
        clip,
        "marker",
        {
            "start": "25s",
            "duration": "100/2400s",
            "value": "Subject intro",
            "completed": "0",
        },
    )
    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    tree.write(out_path, encoding="utf-8", xml_declaration=True)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "AutoAssembly.fcpxml"
    generate_fcpxml(
        "Review_Assembly_V1",
        "file:///Volumes/Media/Footage/Interview_01.mov",
        out,
    )
```

Validation loop:

```bash
# Prefer DTD from the installed Final Cut Pro.app (do not redistribute Apple DTDs)
# xmllint --dtdvalid /path/to/FCPXMLv1_11.dtd AutoAssembly.fcpxml
open -a "Final Cut Pro"  # then File → Import → XML into a disposable Library
```

Compressor (illustrative; flags vary by Compressor version — confirm with `man compressor` / Help):

```bash
# Example pattern: setting file + job media + output directory
compressor -batchname "WebDailyMaster" \
  -jobpath "/Volumes/Media/Exports/master.mov" \
  -settingpath "$HOME/Movies/Compressor Settings/ProRes422_4K.cmprstng" \
  -destinationpath "/Volumes/Media/Exports/Web"
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| DTD version not recognized | XML newer than host FCP | Export/generate older FCPXML version or upgrade FCP |
| Import fails time attributes | Non-rational / bad fractions | Use `N/Ds` frameDuration-aligned values |
| `.fcpbundle` hundreds of GB | Render/optimized caches | Delete Generated Library Files; pause background render |
| Red missing effect/title | Motion template path | Restore under `Motion Templates.localized` |
| ProRes RAW playback drops | Disk bandwidth | Generate proxies; Viewer → Proxy Preferred |
| Compressor CLI no-ops / prompts | Entitlement / wrong paths | Sign in on machine; verify `.cmprstng` and media paths |

---

## Best Practices

1. Author against a **disposable Library** until XML imports cleanly.
2. Keep media on fast storage; Libraries can live on shared volumes with studio path conventions.
3. Assign **Roles** (Dialogue/Music/Effects) before stems export.
4. Document FCP + FCPXML version in every generator README.
5. Prefer Proxy + Optimized selectively — both consume disk.

---

## Limitations

- AppleScript control of FCP is limited; **FCPXML import is the reliable authoring surface**.
- DTD validation ≠ media/semantics validation — always import once.
- AI features (Magnetic Mask, Transcribe) need Apple silicon / OS version gates.
- Stop and ask if target FCP version, media URI scheme, or delivery preset is unknown.

---

## Related Skills

- `@adobe-premiere-pro` — cross-NLE via FCPXML/AAF where supported
- `@compressor` / Apple Compressor docs — batch encodes
- `@ffmpeg` — CFR/proxy prep before import
- `@losslesscut` — rough lossless selects before FCP ingest

---

## Agent Operational Directive

> **MANDATORY**: Emit FCPXML with a declared version compatible with the target Final Cut Pro. Prefer rational frame durations. Validate with DTD when available and always with a disposable Library import. Never invent Apple ID credentials for Compressor.

---

## Source anchors (research)

- [Final Cut Pro release notes](https://support.apple.com/en-us/102825) (FCP 10.8 / 11.x feature & XML era)
- [Legacy FCPXML DTDs archive](https://developer.apple.com/library/archive/documentation/Miscellaneous/Conceptual/LegacyDTDsFinalCutPro/Introduction/Introduction.html)
- Compressor CLI — local `man compressor` / Apple Help on the build machine
