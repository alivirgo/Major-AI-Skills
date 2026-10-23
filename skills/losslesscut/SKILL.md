---
name: losslesscut
description: "Trim and join media with LosslessCut using keyframe-aligned stream copy, Smart Cut when needed, and .llc v2 segment projects backed by FFmpeg."
category: cross-platform
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["losslesscut", "ffmpeg", "keyframe", "smart-cut", "llc", "stream-copy"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# LosslessCut Stream Editor AI Skill Guide (Claude)

## Overview & Engine Architecture

LosslessCut (mifi/lossless-cut) is an Electron UI over **FFmpeg stream copy (`-c copy`)**. Lossless cuts must start on **decoder keyframes (IDR/I)**. **Keyframe cut** snaps start to a nearby keyframe (often earlier). Experimental **Smart Cut** re-encodes only from the desired start to the next keyframe, then copies the rest — unsupported for many files/codecs/multi-video-track cases.

Projects use **`.llc` JSON5**, schema **version 2**: `mediaFileName`, `cutSegments[{ start, end?, name, tags?, selected? }]`.

```
┌─────────────────────────────────────────────────────────────┐
│                 LosslessCut cut → export                      │
│                                                             │
│  Analysis                                                   │
│  ├── ffprobe packets/flags → keyframes ('K')                │
│  └── GOP spacing drives how “early” cuts start              │
│                                                             │
│  Cut modes                                                  │
│  ├── Keyframe cut (default, -ss before -i style)            │
│  ├── Exact/frame modes with caveats                         │
│  └── Smart Cut (experimental hybrid re-encode bridge)       │
│                                                             │
│  Interchange                                                │
│  ├── .llc v2 segments / CSV / YouTube chapters              │
│  └── ffmpeg concat demuxer for merge                        │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Rough selects, removing intros/outros, splitting recordings, preserving codecs.
- Generating `.llc` manifests or keyframe-aligned FFmpeg `-c copy` slices.
- Extracting/keeping secondary audio or subtitle tracks during remux.

**Do not use when**

- Frame-accurate creative edit with effects → NLE skills (`@adobe-premiere-pro`, `@final-cut-pro`, …).
- Guaranteed frame-exact cut on arbitrary codecs without re-encode → full re-encode via `@ffmpeg` (or Smart Cut only if it works for that file).
- DRM / encrypted media circumvention → refuse.

---

## Operational Capabilities & Agent Directives

1. **Keyframe-first**: for `-c copy`, snap starts to keyframes; explain that exports may begin early when GOPs are long.
2. **Smart Cut**: treat as experimental; one video track; subset of H.264/H.265; verify output every time.
3. **`.llc` v2**: `start` required (seconds); `end` optional (EOF); include `version: 2`.
4. **Timestamps**: prefer `-avoid_negative_ts make_zero`; try MKV if MP4 PTS issues appear.
5. **Tracks**: map/include all needed audio/subs (`-map 0` pattern in CLI equivalents).
6. **Corrupt containers**: remux/heal before cutting (`ffmpeg -c copy -movflags +faststart`).
7. **Audio-only quirks**: some M4A sync-sample tables need Keyframe cut off or a remux-first pass.

---

## Production Example: keyframe-aligned slice + `.llc` writer

```python
"""Keyframe-aligned lossless slice + LosslessCut .llc v2 companion."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


def nearest_keyframe(path: str, target: float, window: float = 8.0) -> float:
    start = max(0.0, target - window)
    cmd = [
        "ffprobe", "-v", "quiet", "-select_streams", "v:0",
        "-show_packets", "-show_entries", "packet=pts_time,flags",
        "-read_intervals", f"{start}%+{window * 2}",
        "-print_format", "json", path,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        return target
    best, best_diff = target, float("inf")
    for pkt in json.loads(proc.stdout or "{}").get("packets", []):
        if not str(pkt.get("flags", "")).startswith("K"):
            continue
        pts = float(pkt.get("pts_time", 0.0))
        # Prefer keyframe at or before target (LosslessCut-style early snap)
        if pts > target:
            continue
        diff = target - pts
        if diff < best_diff:
            best, best_diff = pts, diff
    return best


def write_llc(media_name: str, segments: list[dict], out: Path) -> None:
    doc = {"version": 2, "mediaFileName": media_name, "cutSegments": segments}
    out.write_text(json.dumps(doc, indent=2), encoding="utf-8")


def lossless_slice(src: str, start: float, end: float, dst: str) -> None:
    safe = nearest_keyframe(src, start)
    cmd = [
        "ffmpeg", "-y",
        "-ss", str(safe), "-i", src,
        "-to", str(end - safe),
        "-c", "copy", "-avoid_negative_ts", "make_zero",
        "-movflags", "+faststart", dst,
    ]
    subprocess.run(cmd, check=True)
    write_llc(
        Path(src).name,
        [{"start": safe, "end": end, "name": "auto-slice"}],
        Path(dst).with_suffix(".llc"),
    )


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: keyframe_slicer.py in.mp4 start end out.mp4")
        sys.exit(1)
    lossless_slice(sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4])
```

UI checklist:

```text
1. Toggle Keyframe cut; jump ALT+←/→ between keyframes; set In on/after keyframe
2. Enable needed Tracks (audio/subs)
3. Export: avoid_negative_ts = make_zero; try MKV if MP4 freezes
4. Only then try Smart Cut if frame-exact start is mandatory
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Black/freeze first seconds | Cut on non-keyframe | Keyframe cut; snap to prior IDR; or Smart Cut |
| Export starts seconds early | Long GOP | Expected in keyframe mode; denser keyframes or Smart Cut/re-encode |
| Audio OK, video frozen | Negative/bad PTS | `avoid_negative_ts make_zero`; try MKV |
| Missing commentary/subs | Tracks unchecked | Enable tracks; CLI `-map 0` |
| `Invalid NAL unit size` | Corrupt MP4 | Remux heal then cut |
| Smart Cut fails/artifacts | Unsupported codec/layout | Disable Smart Cut; full re-encode segment |
| Audio-only cut wrong | Sync sample table | Disable Keyframe cut or remux whole file first |

---

## Best Practices

1. Review exports — LosslessCut cannot always preview true cut points without exporting.
2. Keep `.llc` beside media for resume/review.
3. Prefer MKV as intermediate when containers fight timestamps.
4. Document whether cuts must be **codec-lossless** vs **frame-exact**.
5. Pair with `@ffmpeg` silencedetect for podcast dead-air → `.llc` generation.

---

## Limitations

- True frame-exact arbitrary cuts require re-encoding (full or Smart Cut bridge).
- Smart Cut remains experimental and file-dependent.
- Electron GUI is not a full headless NLE API — agents automate via `.llc` + FFmpeg.
- Stop and ask if “lossless” vs “frame exact” priority is unspecified.

---

## Related Skills

- `@ffmpeg` — probes, re-encodes, concat, filters
- `@adobe-premiere-pro` / `@final-cut-pro` — editorial after selects
- `@davinci-resolve` — finish grade on selects

---

## Agent Operational Directive

> **MANDATORY**: For stream-copy cuts, align starts to keyframes and use `-avoid_negative_ts make_zero`. Treat Smart Cut as experimental and verify outputs. Emit `.llc` v2 with numeric `start`. Never assist with DRM circumvention.

---

## Source anchors (research)

- [LosslessCut troubleshooting](https://losslesscut.app/docs/troubleshooting)
- [Smart Cut tracking issue #126](https://github.com/mifi/lossless-cut/issues/126)
- [.llc schema (upstream types)](https://github.com/mifi/lossless-cut/blob/master/src/renderer/src/types.ts)
