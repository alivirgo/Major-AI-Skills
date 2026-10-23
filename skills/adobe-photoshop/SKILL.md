---
name: adobe-photoshop
description: "Automate Photoshop with UXP or ExtendScript, Actions and Batch/Image Processor, Smart Object pipelines, and color-managed exports—catching profile, bit-depth, and headless-DOM failures agents routinely miss."
category: design
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["photoshop", "extendscript", "uxp", "actions", "batch", "smart-objects", "color-management", "icc"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Adobe Photoshop Image Pipeline AI Skill Guide (Claude)

## Overview & Engine Architecture

Adobe Photoshop is a layer-based pixel compositor for retouching, design, and stills pipelines. Agents should treat documents as **trees of layers / groups / Smart Objects / adjustment layers**, Actions as **recorded human-intent steps**, and scripts (**ExtendScript JSX** or **UXP**) as **deterministic I/O + export**. Color is a first-class contract: **document profile ≠ export intent** (web sRGB vs print Adobe RGB / CMYK).

```
┌─────────────────────────────────────────────────────────────┐
│                 Photoshop edit → script → export            │
│                                                             │
│  Document model                                             │
│  ├── ArtLayer / LayerSet / Smart Object                     │
│  ├── Adjustment layers / masks / channels / paths           │
│  └── History (non-destructive until flatten)                │
│                                                             │
│  Automation                                                 │
│  ├── Actions + Batch / Image Processor                      │
│  ├── ExtendScript DOM (app.activeDocument)                  │
│  └── UXP plugins (modern JS + manifest)                     │
│                                                             │
│  Color & deliverables                                       │
│  ├── Working space / convert on export                      │
│  └── PNG/JPEG/TIFF/PSD; Generator naming                    │
└─────────────────────────────────────────────────────────────┘
```

**Version pins:** document Photoshop major (e.g. 2025) and whether the studio standardizes on **UXP** (new panels) or **ExtendScript** (legacy farm scripts). Do not mix APIs in one file.

---

## When to use / when not to

**Use when**

- Batch resize/convert/export, Action-driven retouch assist, Smart Object update pipelines.
- Enforcing color profiles and bit depth for web vs print handoff.
- Building UXP panels or maintaining JSX in an existing studio toolchain.

**Do not use when**

- Motion graphics / timeline primary → After Effects (separate skill if present).
- 3D PBR authoring → `@substance-painter`.
- Vector-only brand systems → Illustrator skill if present; use PS only for raster finals.

---

## Operational Capabilities & Agent Directives

1. **Non-destructive default**: Smart Objects + adjustment layers; flatten only for explicit delivery.
2. **Color intent on every export**: convert or tag profile deliberately (`sRGB IEC61966-2.1` for web).
3. **Batch hygiene**: skip locked/hidden when required; `close(SaveOptions.DONOTSAVECHANGES)` unless in-place save requested.
4. **UXP vs JSX**: new UI → UXP; headless/legacy → JSX—never invent Creative Cloud login tokens in either.
5. **Actions + scripts**: record brushy/retouch intent in Actions; call via `doAction`; keep paths/quality in script.
6. **Bit depth**: 16-bit for grade-critical; 8-bit for final web JPEG unless asked otherwise.
7. **Idempotent naming**: `{name}_{size}.{ext}` conventions for design-system exports.
8. **Fail visible**: alert/log + non-zero mental model for operators when folders empty or profile missing.

---

## Production Example: folder resize + sRGB JPEG (ExtendScript)

```javascript
// ExtendScript: max-edge 2048, convert to sRGB JPEG
(function () {
  var inputFolder = Folder.selectDialog("Select input folder");
  var outputFolder = Folder.selectDialog("Select output folder");
  if (!inputFolder || !outputFolder) return;

  var files = inputFolder.getFiles(/\.(jpg|jpeg|png|tif|tiff|psd)$/i);
  var count = 0;
  for (var i = 0; i < files.length; i++) {
    var doc = open(files[i]);
    var maxEdge = 2048;
    var w = doc.width.as("px");
    var h = doc.height.as("px");
    var scale = Math.min(1, maxEdge / Math.max(w, h));
    if (scale < 1) {
      doc.resizeImage(
        UnitValue(w * scale, "px"),
        UnitValue(h * scale, "px"),
        null,
        ResampleMethod.BICUBICSHARPER
      );
    }
    try {
      doc.convertProfile("sRGB IEC61966-2.1", Intent.RELATIVECOLORIMETRIC, true, true);
    } catch (e) {
      // Unmanaged docs: assign sRGB first in Color Settings workflows if convert fails
    }
    var outFile = new File(
      outputFolder + "/" + doc.name.replace(/\.[^\.]+$/, "") + "_2048.jpg"
    );
    var opts = new JPEGSaveOptions();
    opts.quality = 10;
    opts.embedColorProfile = true;
    doc.saveAs(outFile, opts, true);
    doc.close(SaveOptions.DONOTSAVECHANGES);
    count++;
  }
  alert("Processed " + count + " files.");
})();
```

Hybrid pattern:

```text
1. Record Action for retouch steps that need human brush intent
2. JSX: doAction("RetouchHero", "StudioSet")
3. JSX: deterministic export paths + profile + quality
```

Validation loop:

```text
Edit → Color Settings (confirm RGB working space)
File → Scripts → browse JSX
Spot-check: open export → document profile shows sRGB
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `activeDocument` null / error | No file open | Open/create before DOM calls |
| `convertProfile` throws | Missing/unmanaged profile | Assign profile then convert; try/catch with log |
| Batch skips files | Regex / ACL / cloud-only stubs | Fix extensions; ensure local files |
| Smart Object unexpectedly raster | Script used raster-only op | Edit Contents / export SO; avoid accidental rasterize |
| Washed or heavy print shift | Wrong working space / no convert | Match export intent; soft-proof for CMYK |
| UXP command fails, JSX works | Wrong host API | Use UXP batchPlay descriptors or keep JSX for that op |
| Action missing in Batch | Set/Action name mismatch | Exact `doAction(name, set)` strings |

---

## Best Practices

1. Prefer linked Smart Objects for brand assets reused across comps.
2. Keep layered PSD/PSB masters; deliver flattened derivatives separately.
3. Document required fonts and linked files in the job README (Package equivalent discipline).
4. For web: sRGB + reasonable max edge; for print: ask ICC / press profile—do not invent shop profiles.
5. Prefer Generator/`Export As` naming conventions agreed with design system.

---

## Limitations

- ExtendScript is legacy; long-term panels should move to UXP where possible.
- True headless Photoshop on servers still depends on licensed Adobe installs and studio policy.
- Some filters require UI/GPU context and fail in constrained environments.
- Stop and ask if Adobe ID, shared network fonts, or client ICC profiles are missing—never invent credentials.

---

## Related Skills

- `@adobe-illustrator` — vector source (if present in catalog)
- `@figma` — UI design handoff (if present)
- `@substance-painter` — 3D texture maps sometimes finished in PS
- `@cinema-4d` — 3D stills often finished/comped in PS

---

## Agent Operational Directive

> **MANDATORY**: Default to Smart Objects and explicit color-profile intent on export. Close batch docs with `DONOTSAVECHANGES` unless the user requested saves. Prefer UXP for new panels and JSX for legacy farms—do not mix casually. Never invent Adobe credentials or press ICC profiles.

---

## Source anchors (research)

- [Photoshop scripting (ExtendScript) guide](https://helpx.adobe.com/photoshop/using/scripting.html)
- [UXP for Photoshop](https://developer.adobe.com/photoshop/uxp/)
- [Color management in Photoshop](https://helpx.adobe.com/photoshop/using/color-management.html)
- [Actions and Batch](https://helpx.adobe.com/photoshop/using/creating-actions.html)
