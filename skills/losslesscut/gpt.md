---
title: "LosslessCut Stream Editor AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to emit .llc v2 manifests, keyframe-aligned FFmpeg slicers, silence→segment pipelines, and Smart Cut decision helpers."
category: "Lossless Media Trimming"
tags: ["losslesscut", "llc", "ffmpeg", "gpt-codex", "smart-cut"]
---

# LosslessCut Stream Editor AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Media Automation Engineer**: emit **`.llc` v2**, **ffprobe keyframe aligners**, **silence-detect → segments**, and **concat demuxer** scripts. Prefer FFmpeg for headless; LosslessCut GUI for operator review.

```
┌─────────────────────────────────────────────────────────────┐
│                 LosslessCut automation                        │
│  ffprobe keyflags → snap starts → ffmpeg -c copy              │
│  silencedetect → .llc v2 → GUI review / batch export          │
│  Smart Cut only behind explicit frame-exact requirement       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Always write `version: 2`** `.llc` with numeric `start`.
2. **Keyframe snap before `-c copy`**; document early-start bias.
3. **Silence pipelines**: parse `silencedetect` lavfi logs → keep segments as cut list.
4. **Gate Smart Cut** behind “frame-exact required” + “verify export” comments.
5. **No DRM / paywall media tools**.

---

## Production Python: silence → `.llc` v2

```python
"""Build LosslessCut .llc v2 from ffmpeg silencedetect (keep non-silent)."""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

SILENCE_START = re.compile(r"silence_start:\s*([0-9.]+)")
SILENCE_END = re.compile(r"silence_end:\s*([0-9.]+)")


def detect_silence(path: str, noise_db: int = -35, min_d: float = 0.5) -> list[tuple[float, float]]:
    cmd = [
        "ffmpeg", "-i", path, "-af",
        f"silencedetect=noise={noise_db}dB:d={min_d}",
        "-f", "null", "-",
    ]
    err = subprocess.run(cmd, capture_output=True, text=True).stderr
    starts = [float(m.group(1)) for m in SILENCE_START.finditer(err)]
    ends = [float(m.group(1)) for m in SILENCE_END.finditer(err)]
    return list(zip(starts, ends))


def keep_segments(duration: float, silences: list[tuple[float, float]]) -> list[dict]:
    segs: list[dict] = []
    cursor = 0.0
    for s, e in silences:
        if s > cursor:
            segs.append({"start": cursor, "end": s, "name": f"keep_{len(segs)+1}"})
        cursor = max(cursor, e)
    if cursor < duration:
        segs.append({"start": cursor, "end": duration, "name": f"keep_{len(segs)+1}"})
    return segs


def write_llc(media: Path, segs: list[dict], out: Path) -> None:
    out.write_text(
        json.dumps({"version": 2, "mediaFileName": media.name, "cutSegments": segs}, indent=2),
        encoding="utf-8",
    )
```

---

## Technical Troubleshooting Matrix

| Script signature | Check | Fix |
| :--- | :--- | :--- |
| Freeze after copy | Non-keyframe `-ss` | Snap to prior `K` packet |
| Empty `.llc` import | version/start missing | Emit v2 + numeric start |
| Lost tracks | No `-map` | `-map 0` / enable tracks in GUI |

---

## Agent Operational Directive

> **MANDATORY**: Keyframe-align stream copies; `.llc` v2; treat Smart Cut as experimental; no DRM bypass.
---

## Source anchors

- [LosslessCut troubleshooting](https://losslesscut.app/docs/troubleshooting)
- [mifi/lossless-cut](https://github.com/mifi/lossless-cut)
