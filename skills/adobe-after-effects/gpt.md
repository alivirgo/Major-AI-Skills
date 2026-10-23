---
title: "Adobe After Effects Motion Graphics AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to emit ES3 ExtendScript comp builders, expression rigs, Render Queue/AME handoff, and mogrt export helpers."
category: "Motion Graphics Automation"
tags: ["after-effects", "extendscript", "render-queue", "mogrt", "gpt-codex"]
---

# Adobe After Effects Motion Graphics AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Motion Pipeline Engineer**: emit **ES3 JSX**, **expression libraries**, **RQ/AME queue scripts**, and **mogrt packaging helpers** with graceful template fallbacks.

```
┌─────────────────────────────────────────────────────────────┐
│                 AE automation stack                           │
│  Comp scaffold → null/parent rig → expressions                │
│  RenderQueue / queueInAME → OutputModule paths                │
│  Essential Graphics → exportAsMotionGraphicsTemplate          │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Always emit ES3** for `.jsx` consumed by AE (`var`, `function`, no `let`/`=>`/`` ` ``).
2. **Validate `CompItem`** before `renderQueue.items.add`.
3. **Parameterize** output directories and template names; never assume a named H.264 template exists.
4. **mogrt**: only expose Checkbox / Color / Slider / Source Text; set `motionGraphicsTemplateName` before export.
5. **Prefer `queueInAME(false)`** in farm docs so operators can adjust presets before encode starts.
6. **No credentials** or licensed font binaries in generated repos.

---

## Production Python: batch rename comps → JSX snippet generator

```python
"""Emit ES3 JSX that renames comps matching a prefix."""
from __future__ import annotations

from pathlib import Path


def emit_rename_jsx(prefix: str, new_prefix: str) -> str:
    # Keep output ES3-safe for ExtendScript
    return f"""(function () {{
  app.beginUndoGroup("Batch Rename Comps");
  var prefix = "{prefix}";
  var neu = "{new_prefix}";
  var n = 0;
  for (var i = 1; i <= app.project.numItems; i++) {{
    var it = app.project.item(i);
    if (it instanceof CompItem && it.name.indexOf(prefix) === 0) {{
      it.name = neu + it.name.substring(prefix.length);
      n++;
    }}
  }}
  app.endUndoGroup();
  alert("Renamed " + n + " comps");
}})();
"""


if __name__ == "__main__":
    Path("batch_rename_comps.jsx").write_text(
        emit_rename_jsx("LT_", "LT_v2_"), encoding="utf-8"
    )
```

---

## Technical Troubleshooting Matrix

| Script signature | Check | Fix |
| :--- | :--- | :--- |
| Syntax error on `const` | Modern JS in JSX | Rewrite ES3 |
| NEEDS_OUTPUT | Path missing ext | Force `.mov`/`.mp4` |
| mogrt export false | Unsupported prop type | Gate with `canAddToMotionGraphicsTemplate` |
| AME starts immediately | `queueInAME(true)` | Use `false` for operator review |

---

## Agent Operational Directive

> **MANDATORY**: ES3 only for AE JSX; undo groups; explicit output paths with extensions; local template fallbacks; no secrets or unlicensed fonts.
---

## Source anchors

- [AE Scripting — Render Queue](https://ae-scripting.docsforadobe.dev/renderqueue/renderqueue/)
- [Adobe Help — scripts & mogrt APIs](https://helpx.adobe.com/after-effects/using/scripts.html)
