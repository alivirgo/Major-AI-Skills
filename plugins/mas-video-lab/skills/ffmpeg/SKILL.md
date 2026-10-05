---
name: ffmpeg
description: "Transcode and compress video with FFmpeg, inspect streams with ffprobe, build filtergraphs and HLS outputs, and diagnose codec or hardware-encoder failures."
category: cross-platform
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["ffmpeg", "ffprobe", "hls", "nvenc", "colorspace", "hdr", "batch", "deterministic"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# FFmpeg Media Engineering AI Skill Guide (Claude)

## Overview & Engine Architecture

FFmpeg (pin **6.x / 7.x / 8.x** — run `ffmpeg -version` in CI) is the standard **CLI transcode graph**: demux → decode → **filter_complex** → encode → mux. Claude acts as Principal Video Engineer: **ffprobe-first**, **BT.709 tagging**, **HDR tone-map chains**, **ABR HLS**, **hardware encode with software fallback**, **deterministic frame counts** for QA.

```
┌─────────────────────────────────────────────────────────────┐
│  ffprobe JSON  →  filtergraph  →  encode  →  verify tags    │
│  SDR web: yuv420p + bt709 metadata + faststart              │
│  HDR→SDR: zscale linear → tonemap → zscale bt709 (NOT colorspace alone) │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when:** mezzanine → delivery transcodes, loudness normalize, HLS/DASH packaging, concat/remux, thumbnail/still extraction, batch folder processing.

**Do not use when:** NLE project semantics (use Resolve/Premiere skills); DRM packaging; proprietary camera RAW without documented decoder.

---

## Operational Capabilities & Agent Directives

1. **Probe before encode**: `ffprobe -show_streams -show_format -print_format json` — record `color_transfer`, `color_primaries`, `pix_fmt`, VFR (`avg_frame_rate` vs `r_frame_rate`).
2. **SDR deliverables**: `-pix_fmt yuv420p` + `-color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv` on output; `-movflags +faststart` for MP4 web.
3. **HDR PQ/HLG → SDR**: `colorspace` filter **cannot** tone-map PQ; use `zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=...,zscale=t=bt709:m=bt709:r=tv,format=yuv420p`. If tags `unknown`, prefix `setparams=color_primaries=bt2020:color_trc=smpte2084:colorspace=bt2020nc`.
4. **NVENC tags**: Without explicit `format=yuv420p` or `-pix_fmt yuv420p`, NVENC may write wrong `color_space` (e.g. bt470bg) — always end filter chain with `format=yuv420p` ([FFmpeg trac #11541](https://trac.ffmpeg.org/)).
5. **Deterministic QA**: For regression, use `-frames:v N`, fixed GOP (`-g`), `-vsync cfr`, `-fflags +bitexact` where applicable; avoid time-based `-ss` before `-i` vs after for frame-accurate tests.
6. **VFR fix**: `-vf fps=30` or `-vsync cfr`; audio `aresample=async=1:first_pts=0`.
7. **Batch**: `-progress pipe:1` for machine-parseable status; exit code = last ffmpeg in shell chain.

---

## Production: SDR web transcode (safe default)

```bash
ffmpeg -y -i input.mov \
  -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -c:a aac -b:a 160k -ar 48000 \
  -movflags +faststart \
  output.mp4
```

## HDR10 → SDR (requires libzimg / zscale)

```bash
ffmpeg -y -i hdr.mkv \
  -vf "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p" \
  -c:v libx264 -crf 19 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a copy out_sdr.mp4
```

Verify: `ffprobe -show_entries stream=color_space,color_transfer,color_primaries -of default=nw=1 out_sdr.mp4`

---

## HLS ABR (aligned GOP)

Use `-g 60 -keyint_min 60 -sc_threshold 0` at 30fps for 2s segments; `-hls_flags independent_segments`; map separate video renditions with `-var_stream_map`.

---

## Failure taxonomy

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| Washed SDR | No tonemap / wrong primaries | Full zscale+tonemap chain |
| Dark HDR on SDR display | Tags say bt709 but pixels HDR | Tone-map + retag |
| NVENC missing | Build without nvenc | `ffmpeg -encoders \| findstr nvenc` |
| A/V drift | VFR source | fps filter + async audio |
| DTS warnings | Bad timestamps | `-fflags +genpts`, remux pass |

---

## Agent Operational Directive

> **MANDATORY**: ffprobe first; yuv420p + bt709 tags on SDR MP4; never use `colorspace` alone for PQ/HLG; end NVENC graphs with explicit yuv420p; log full stderr on failure.
