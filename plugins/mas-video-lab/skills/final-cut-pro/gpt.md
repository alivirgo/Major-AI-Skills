---
title: "Apple Final Cut Pro NLE AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate versioned FCPXML, rational time helpers, Library hygiene scripts, and Compressor CLI batch wrappers."
category: "Professional macOS Video Editing"
tags: ["final-cut-pro", "fcpxml", "compressor-cli", "gpt-codex"]
---

# Apple Final Cut Pro NLE AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **macOS Post Pipeline Engineer**: emit **FCPXML generators**, **timecode↔rational converters**, **Library maintenance shell**, and **Compressor batch wrappers**—parameterized by target FCP/FCPXML version.

```
┌─────────────────────────────────────────────────────────────┐
│                 FCP automation stack                          │
│  SMPTE/timecode → rational N/Ds → FCPXML resources/spine      │
│  xmllint DTD gate → disposable Library import                 │
│  Compressor CLI → .cmprstng delivers                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Parameterize `fcpxml/@version`**; default conservatively (e.g. 1.11) unless target FCP is known newer.
2. **Centralize time math** — never sprinkle float seconds for frame-accurate editorial XML.
3. **file:// URIs** for assets; fail if paths are Windows-style without conversion.
4. **Compressor wrappers**: pass setting path + output dir; do not scrape Apple ID cookies.
5. **Emit import checklist** beside every generator (DTD + disposable Library).

---

## Production Python: SMPTE → FCPXML rational

```python
"""Convert HH:MM:SS:FF to FCPXML-style frame count * frameDuration."""
from __future__ import annotations


def smpte_to_frames(tc: str, fps_num: int, fps_den: int) -> int:
    hh, mm, ss, ff = [int(x) for x in tc.replace(";", ":").split(":")]
    # Non-drop simplification: treat fps as fps_num/fps_den (e.g. 24/1 or 30000/1001)
    fps = fps_num / fps_den
    return int(round(((hh * 3600) + (mm * 60) + ss) * fps + ff))


def frames_to_rational(frames: int, frame_duration: str = "100/2400s") -> str:
    # frame_duration like 100/2400s → multiply numerator by frames
    body = frame_duration.rstrip("s")
    num_s, den_s = body.split("/")
    return f"{int(num_s) * frames}/{den_s}s"


if __name__ == "__main__":
    f = smpte_to_frames("00:01:00:00", 24, 1)
    print(frames_to_rational(f))  # 144000/2400s for 24fps @ 1:00:00:00
```

---

## Technical Troubleshooting Matrix

| Script signature | Check | Fix |
| :--- | :--- | :--- |
| DTD not recognized on import | version too new | Lower `fcpxml/@version` |
| Drift vs expected TC | float seconds used | Rational frame math |
| Compressor exits 0, no file | bad destination/setting | Verify paths; watch GUI entitlement |

---

## Agent Operational Directive

> **MANDATORY**: Version-gate FCPXML; rational times; disposable Library proof; no Apple credentials in scripts.
---

## Source anchors

- [FCP release notes](https://support.apple.com/en-us/102825)
- Apple FCPXML DTD documentation (host app bundle)
