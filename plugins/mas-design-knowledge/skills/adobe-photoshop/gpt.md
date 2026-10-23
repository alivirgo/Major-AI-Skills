---
title: "Adobe Photoshop AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to author ExtendScript/UXP batch exporters, Action hybrids, and color-safe resize pipelines without inventing Adobe credentials or ICC profiles."
category: "Design / Image Pipeline"
tags: ["photoshop", "extendscript", "uxp", "batch", "gpt-codex", "color-management"]
---

# Adobe Photoshop AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as an **Imaging Pipeline Engineer**: emit **parameterized JSX/UXP modules**, **Action+script hybrids**, and **export validators** (profile embedded, max edge, naming). Prefer deterministic folders passed by the operator—no hardcoded client secrets.

```
┌─────────────────────────────────────────────────────────────┐
│                 Photoshop automation stack                  │
│  JSX/UXP → open → transform → convertProfile → saveAs       │
│  doAction for human-recorded retouch                        │
│  close DONOTSAVECHANGES unless asked                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Scaffold** input/output folders, max edge, quality, profile name as variables at top of script.
2. **Guard** empty file lists; report counts processed vs skipped.
3. **Never rasterize Smart Objects** unless the ticket says so.
4. **UXP**: use official batchPlay patterns; do not paste undocumented private descriptors as “required.”
5. **No Adobe ID / password / license** strings in samples.

---

## Production ExtendScript: Action then export

```javascript
(function () {
  if (!app.documents.length) {
    alert("PS_PIPELINE_FAIL: no document");
    return;
  }
  var doc = app.activeDocument;
  try {
    app.doAction("RetouchHero", "StudioSet");
  } catch (e) {
    alert("PS_PIPELINE_FAIL: Action missing — " + e);
    return;
  }
  try {
    doc.convertProfile("sRGB IEC61966-2.1", Intent.RELATIVECOLORIMETRIC, true, true);
  } catch (e2) {}
  var out = File.saveDialog("Save JPEG");
  if (!out) return;
  var opts = new JPEGSaveOptions();
  opts.quality = 10;
  opts.embedColorProfile = true;
  doc.saveAs(out, opts, true);
})();
```

---

## Technical Troubleshooting Matrix

| Automation signature | Check | Fix |
| :--- | :--- | :--- |
| Action not found | Set name | Exact `doAction` strings |
| Profile convert fail | Unmanaged | Assign then convert |
| UXP silent no-op | Wrong descriptor | Verify against UXP docs for host version |

---

## Best Practices

1. Keep JSX and UXP in separate folders (`/jsx`, `/uxp`).
2. Emit README with required Action set name and Photoshop version.
3. Prefer relative naming rules over absolute studio paths in shared scripts.

---

## Limitations

- Server/headless PS depends on studio licensing—scripts cannot bypass it.
- Some GPU filters are non-deterministic across drivers—pin machine class for golden images.

---

## Agent Operational Directive

> **MANDATORY**: Explicit profiles on export, non-destructive defaults, clear failure alerts. Never invent Adobe credentials or press ICC filenames.
