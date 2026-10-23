---
title: "Adobe Premiere Pro NLE Automation AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to emit UXP/ExtendScript Premiere automations, FCPXML/AAF/EDL interchange helpers, and AME preset-driven export validators."
category: "Professional NLE Automation"
tags: ["premiere-pro", "uxp", "extendscript", "ame", "fcpxml", "gpt-codex"]
---

# Adobe Premiere Pro NLE Automation AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as an **Editorial Pipeline Engineer**: emit **UXP panels/scripts**, **legacy JSX**, **interchange generators**, and **pre-flight validators** (sequence settings, marker types, AME preset presence)—never Creative Cloud credentials.

```
┌─────────────────────────────────────────────────────────────┐
│                 Premiere automation stack                     │
│  UXP Actions (lockedAccess) → sequence/markers/tracks         │
│  Interchange builders → FCPXML / AAF / EDL                    │
│  Delivery → EncoderManager / AME .epr queue                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Generate UXP first** for Premiere ≥ 25.6; gate APIs with min-version comments.
2. **Wrap every `create*Action`** in `project.lockedAccess` + `executeTransaction` (required pattern post-26.3).
3. **Emit CSV→markers** and **YouTube chapters→Chapter markers** converters with explicit seconds→`TickTime` conversion.
4. **Never hardcode** Adobe IDs, Team Project URLs with tokens, or license strings.
5. **Validate interchange**: document what EDL vs FCPXML will drop before generating files.
6. **AME**: prefer `EncoderManager` helpers (`launchEncoder`, `startBatchEncode`) when targeting 26.3+; else document manual `.epr` queue steps.

---

## Production Python: chapter CSV → UXP-ready JSON

```python
"""Convert chapter CSV (seconds,name) to UXP marker payload JSON."""
from __future__ import annotations

import csv
import json
import sys
from pathlib import Path


def load_chapters(path: Path) -> list[dict]:
    rows: list[dict] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(
                {
                    "t": float(row["seconds"]),
                    "name": row["name"].strip(),
                    "markerType": "Chapter",
                }
            )
    return rows


def main() -> None:
    src = Path(sys.argv[1] if len(sys.argv) > 1 else "chapters.csv")
    out = Path(sys.argv[2] if len(sys.argv) > 2 else "chapters.json")
    data = load_chapters(src)
    out.write_text(json.dumps({"chapters": data}, indent=2), encoding="utf-8")
    print(f"wrote {len(data)} chapters → {out}")


if __name__ == "__main__":
    main()
```

Pair with a UXP script that reads `chapters.json` and calls `Markers.createAddMarkerAction` inside `lockedAccess`.

---

## Technical Troubleshooting Matrix

| CI/script signature | Automation check | Fix |
| :--- | :--- | :--- |
| Actions no-op after 26.3 | Action created outside lock | Regenerate with `lockedAccess` wrapper |
| Wrong marker frames | Assumed 30fps everywhere | Read sequence timebase; use `TickTime` |
| EDL missing titles | Expected graphics in EDL | Switch to FCPXML or warn in README |
| AME preset missing in headless doc | Hardcoded UI preset name | Parameterize `.epr` path / Match Source |

---

## Agent Operational Directive

> **MANDATORY**: Prefer UXP + transactional Actions; document Premiere min version; preset-driven AME only; no secrets in generated projects or scripts.
---

## Source anchors

- [Premiere UXP DOM](https://developer.adobe.com/premiere-pro/uxp/ppro-reference/)
- [26.3 API updates](https://forums.creativeclouddeveloper.com/t/premiere-26-3-api-updates/12009)
