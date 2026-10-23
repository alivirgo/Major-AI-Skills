---
name: adobe-after-effects
description: "Scaffold After Effects comps and expression rigs, queue Render Queue / AME jobs, and export Essential Graphics (.mogrt) with ExtendScript-safe patterns."
category: video-editing
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["after-effects", "extendscript", "expressions", "render-queue", "mogrt", "ame", "mograph"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Adobe After Effects Motion Graphics AI Skill Guide (Claude)

## Overview & Engine Architecture

After Effects is layer-based: **Project → CompItem → Layers → Properties / Keyframes / Expressions**. Automation is primarily **ExtendScript (JSX, ES3 dialect)** against `app.project`, `CompItem`, `AVLayer`, and `renderQueue`. Delivery: **Render Queue** (blocking `render()`), **Queue in AME** (`queueInAME`), or **Essential Graphics → `.mogrt`**. Dynamic Link ties comps into Premiere.

Keep scripts **ES3-compatible** (`var`, no arrow functions/template literals in JSX shipped to AE).

```
┌─────────────────────────────────────────────────────────────┐
│                 After Effects build → deliver                 │
│                                                             │
│  Project graph                                              │
│  ├── FootageItem / FolderItem / CompItem                    │
│  ├── Layer types (AV, Shape, Text, Camera, Light, Null)     │
│  └── Keyframes / Expressions / Effects                      │
│                                                             │
│  Automation                                                 │
│  ├── ExtendScript DOM + beginUndoGroup                      │
│  ├── Expressions (thisComp / thisLayer / time)              │
│  └── Essential Graphics property exposure                   │
│                                                             │
│  Delivery                                                   │
│  ├── Render Queue + OutputModule templates                  │
│  ├── queueInAME(false|true)                                 │
│  └── exportAsMotionGraphicsTemplate → .mogrt                │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Creating comps, text/shape layers, null/parent rigs, expressions, or batch render queue items.
- Packaging lower-thirds / bugs as `.mogrt` for Premiere editors.
- Diagnosing expression errors, missing fonts, or output module template mismatches.

**Do not use when**

- Long-form cutting / multicam → `@adobe-premiere-pro` / `@final-cut-pro` / `@davinci-resolve`.
- Lossless stream trim → `@losslesscut` / `@ffmpeg`.
- Requests to bake licensed font files or Adobe credentials into repos → refuse.

---

## Operational Capabilities & Agent Directives

1. **Comp spec first**: width, height, pixelAspect, duration, frameRate before layers.
2. **Undo groups**: wrap mutations in `app.beginUndoGroup` / `app.endUndoGroup`.
3. **Render Queue**: `items.add(comp)` → configure `outputModule(1)` with **file extension** → status `QUEUED` before `render()` (blocks) or `queueInAME(false)` to hand off.
4. **Templates are local**: `applyTemplate("...")` names differ per machine — catch failures and fall back.
5. **mogrt exposure**: only Checkbox, Color, single-value Slider, Source Text via `canAddToMotionGraphicsTemplate` / `addToMotionGraphicsTemplate`.
6. **Expressions vs keyframes**: expressions for linked/procedural motion; keyframes for intentional curves.
7. **Fonts**: use studio-licensed faces; document substitution risk.

---

## Production Example: lower-third + Render Queue + mogrt notes

```javascript
// ExtendScript (ES3) — create lower-third, queue render
(function () {
  app.beginUndoGroup("Create Lower Third");

  var comp = app.project.items.addComp("LT_Hero", 1920, 1080, 1.0, 5.0, 30);
  var solid = comp.layers.addSolid([0.05, 0.55, 0.9], "Bar", 640, 96, 1.0);
  solid.property("Position").setValue([420, 860]);
  solid.property("Position").expression =
    "var t = time; [ease(t, 0, 0.6, -200, 420), 860]";

  var textLayer = comp.layers.addText("Product Launch");
  var textProp = textLayer.property("Source Text");
  var textDoc = textProp.value;
  textDoc.fontSize = 48;
  textDoc.fillColor = [1, 1, 1];
  textDoc.font = "Arial-BoldMT";
  textProp.setValue(textDoc);
  textLayer.property("Position").setValue([420, 860]);

  // Optional: expose Source Text to Essential Graphics
  try {
    if (textProp.canAddToMotionGraphicsTemplate(comp)) {
      textProp.addToMotionGraphicsTemplate(comp);
    }
    comp.motionGraphicsTemplateName = "LT_Hero";
  } catch (e) {}

  var rq = app.project.renderQueue.items.add(comp);
  var om = rq.outputModule(1);
  try {
    om.applyTemplate("H.264 - Match Render Settings - 15 Mbps");
  } catch (e) {
    // Template missing — leave default; user picks local preset
  }
  om.file = new File("~/Desktop/LT_Hero_Out.mp4"); // extension required

  app.endUndoGroup();
  alert("Queued: " + comp.name + " status=" + rq.status);
  // Prefer queueInAME(false) for shared encode farms:
  // if (app.project.renderQueue.canQueueInAME) app.project.renderQueue.queueInAME(false);
})();
```

Validation:

```text
1. Comp settings match delivery (rate/size)
2. RQ item status QUEUED; output path has extension
3. Spot expression editor (no yellow banner)
4. For mogrt: Essential Graphics shows exposed props; exportAsMotionGraphicsTemplate
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Yellow expression banner | Syntax / bad property path | Fix ES expression; use `thisComp.layer("Name")` carefully |
| `RQItemStatus.NEEDS_OUTPUT` | Missing output path/extension | Set `om.file` with `.mp4`/`.mov` |
| `applyTemplate` throws | Template not on machine | try/catch; document studio template pack |
| Font substitution | Face not installed | Install licensed font; avoid random web fonts |
| Dynamic Link stale | Premiere/AE cache desync | Refresh Link; purge memory & disk cache |
| `render()` “hangs” | Blocking until done | Expected; use AME queue for async farm |
| mogrt export false | Unsaved project / bad props | Save project; only expose supported property types |

---

## Best Practices

1. Controller **nulls** + parenting over hard-coded layer indices.
2. One output module per deliverable (ProRes master + H.264 proxy) via `outputModules.add()`.
3. Keep disk cache on fast local SSD; never on the media SAN root without studio policy.
4. Version comps (`LT_Hero_v03`); avoid overwriting locked deliveries.
5. Document AE major version for any API used (`queueInAME` needs AE 14+ / AME 11+).

---

## Limitations

- ExtendScript is ES3 — modern JS tooling must transpile or stay compatible.
- Output module / render settings template names are environment-specific.
- Scripting cannot replace every UI-only effect or third-party plugin license check.
- Stop and ask if delivery codec, safe-title margins, or brand fonts are unspecified.

---

## Related Skills

- `@adobe-premiere-pro` — editorial host for mogrt / Dynamic Link
- `@ffmpeg` — post-transcode / loudness / package
- `@davinci-resolve` — color finish after AE pre-comp renders
- `@remotion` — code-first motion when AE is not the runtime

---

## Agent Operational Directive

> **MANDATORY**: Use undo groups; set comp specs explicitly; always set output module file paths **with extensions**; treat template names as local; fail gracefully; never embed Adobe credentials or unlicensed fonts in automation.

---

## Source anchors (research)

- [After Effects Scripting Guide — Render Queue](https://ae-scripting.docsforadobe.dev/renderqueue/renderqueue/)
- [OutputModule](https://ae-scripting.docsforadobe.dev/renderqueue/outputmodule/)
- [Scripts & Motion Graphics templates (Adobe Help)](https://helpx.adobe.com/after-effects/using/scripts.html)
- `queueInAME` — AE 14.0+ / AME 11.0+
