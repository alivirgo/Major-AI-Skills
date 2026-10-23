---
name: adobe-premiere-pro
description: "Automate Premiere Pro sequences and markers via UXP/ExtendScript, exchange FCPXML/AAF/EDL, and queue Adobe Media Encoder jobs without baking secrets into projects."
category: video-editing
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["premiere-pro", "uxp", "extendscript", "ame", "fcpxml", "aaf", "edl", "productions"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Adobe Premiere Pro NLE Automation AI Skill Guide (Claude)

## Overview & Engine Architecture

Premiere Pro is a track-based NLE: **Project → Bins → Sequences → TrackItems**, with Lumetri, captions, graphics, and audio mixers. Modern automation prefers **UXP (`require('premierepro')`)** — async DOM, `project.lockedAccess` + `executeTransaction` for mutations (enforced harder since **26.3**). Legacy **ExtendScript (JSX)** remains common for studio scripts. Delivery usually goes through **Adobe Media Encoder (AME)** presets (`.epr`). Interchange: **FCPXML**, **AAF**, **EDL**, **CME**.

Pin the studio’s major version (e.g. **25.x / 26.x**): marker APIs landed ~**25.6**; EncoderManager helpers and stricter action locks landed in **26.3**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Premiere Pro build → deliver loop             │
│                                                             │
│  Editorial model                                            │
│  ├── Project / Productions (shared media root)              │
│  ├── Sequence (timebase, frame size, sample rate)           │
│  └── TrackItem / Marker / Transition / Effect               │
│                                                             │
│  Automation                                                 │
│  ├── UXP: Project.getActiveProject → lockedAccess/Actions   │
│  ├── ExtendScript: app.project.activeSequence (legacy)      │
│  └── Interchange: FCPXML / AAF / EDL                        │
│                                                             │
│  Delivery                                                   │
│  ├── EncoderManager / AME queue + .epr presets              │
│  └── Match Source vs platform H.264/ProRes/DNx masters      │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Scaffolding sequences, chapter/comment markers, bin hygiene, or AME export handoff.
- Generating or validating FCPXML/AAF/EDL for finishing round-trips.
- Relinking media under Productions / shared storage with path conventions.

**Do not use when**

- Frame-accurate lossless trim without NLE → `@losslesscut` / `@ffmpeg`.
- Heavy motion design / expressions / mogrt authoring → `@adobe-after-effects`.
- macOS Magnetic Timeline / Compressor CLI primary path → `@final-cut-pro`.
- Someone asks to embed license keys, Creative Cloud passwords, or team project tokens in scripts → refuse; use OS keychain / studio secret store.

---

## Operational Capabilities & Agent Directives

1. **Sequence-first**: Confirm timebase, frame size, pixel aspect, and audio sample rate before inserts or markers.
2. **UXP transactions**: Create `Action`s inside `project.lockedAccess(() => { ... })`, then `project.executeTransaction(...)`. Do not invent sync ExtendScript patterns for UXP.
3. **Markers**: Prefer UXP `Markers.getMarkers(sequence)` + `createAddMarkerAction` (types: `Comment`, `Chapter`, `WebLink`, `FLVCuePoint`). Guard null active sequence/project.
4. **Export via presets**: Queue AME with named `.epr` or Match Source; avoid one-off UI click recipes in automation docs.
5. **Interchange honesty**: EDL drops effects/graphics; FCPXML keeps more editorial metadata; AAF for Avid/Pro Tools adjacent finishing — state what will be lost.
6. **Media offline**: Prefer Relink / Match File / Productions shared root over rewriting absolute paths blindly.
7. **Version gates**: Document minimum Premiere version for any UXP API used (e.g. Markers ≥ 25.6).

---

## Production Example: UXP chapter markers + AME handoff notes

UXP panel / script sketch (Premiere DOM via `premierepro`):

```javascript
const ppro = require("premierepro");

async function addChapterMarkers(chapters) {
  const project = await ppro.Project.getActiveProject();
  if (!project) throw new Error("No active project");
  const sequence = await project.getActiveSequence();
  if (!sequence) throw new Error("No active sequence");

  const markers = await ppro.Markers.getMarkers(sequence);

  project.lockedAccess(() => {
    project.executeTransaction((compound) => {
      for (const c of chapters) {
        const start = ppro.TickTime.createWithSeconds(c.t);
        const duration = ppro.TickTime.createWithSeconds(0);
        const action = markers.createAddMarkerAction(
          c.name,
          "Chapter",
          start,
          duration
        );
        compound.addAction(action);
      }
    }, "Add chapter markers");
  });
}

// chapters = [{ t: 0, name: "Cold Open" }, { t: 12.5, name: "Act 1" }];
// await addChapterMarkers(chapters);
```

ExtendScript fallback (legacy studio installs) — always guard `activeSequence`:

```javascript
(function () {
  if (!app.project || !app.project.activeSequence) {
    alert("Open a project and select an active sequence.");
    return;
  }
  var seq = app.project.activeSequence;
  var chapters = [
    { t: 0.0, name: "Cold Open" },
    { t: 12.5, name: "Act 1" },
    { t: 48.0, name: "Product Demo" }
  ];
  for (var i = 0; i < chapters.length; i++) {
    var m = seq.markers.createMarker(chapters[i].t);
    m.name = chapters[i].name;
    m.comments = "Auto chapter";
  }
})();
```

Validation loop (human + agent checklist):

```text
1. Confirm sequence settings (rate / size / sample rate)
2. Run marker script; scrub timeline index for Chapter markers
3. Queue AME with studio .epr (or Match Source ProRes/DNx)
4. Spot-check first/last frame + audio peaks; archive via Project Manager
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `activeSequence` / `getActiveSequence` null | No sequence open | Open sequence in timeline; re-run |
| UXP `create*Action` throws / ignored | Action created outside `lockedAccess` (26.3+) | Wrap action creation in `project.lockedAccess` |
| Markers on wrong frames | Seconds vs ticks / display format mismatch | Use `TickTime` APIs; verify sequence timebase |
| Media offline after drive move | Absolute paths broke | Relink / Match File; Productions shared root |
| AME rejects preset | Codec/container incompatible with source | Match Source or platform-safe H.264/ProRes `.epr` |
| `setSelection` Promise hang | 26.3 made `setSelection` sync boolean | Drop `await`; use returned `boolean` |
| FCPXML round-trip loses Lumetri look | Interchange fidelity limits | Finish grade in Premiere or move stills/LUTs separately |
| Scrubbing stutters | Bloated media cache | Preferences → Media Cache; purge peak files |

---

## Best Practices

1. Prefer **Productions** for multi-editor media roots; document the shared volume UNC/POSIX path.
2. Name sequences and bins with show codes (`SHOW_EP01_PictureLock_v03`); never rely on “Sequence 01”.
3. Keep AME presets under version control as `.epr` binaries or documented preset names — not screenshots alone.
4. Separate **picture lock** from **color/audio finish** exports; tag markers for chapter delivery platforms.
5. Clear or relocate Media Cache on shared machines; do not commit cache folders.
6. For CEP→UXP migrations, rewrite sync ExtendScript assumptions; UXP methods are async.

---

## Limitations

- UXP coverage is not a 1:1 clone of every ExtendScript API; verify against [Premiere UXP reference](https://developer.adobe.com/premiere-pro/uxp/ppro-reference/).
- Team Projects / cloud collaboration auth is out of band — never hardcode credentials.
- Dynamic Link to After Effects can desync; purge caches when frames look stale.
- Stop and ask if sequence preset, delivery codec, or shared media root is unspecified.

---

## Related Skills

- `@adobe-after-effects` — comps, expressions, mogrt, render queue / AME from AE
- `@final-cut-pro` — FCPXML / Compressor when finishing on Apple
- `@davinci-resolve` — color finish / Studio scripting handoff
- `@ffmpeg` — transcode / proxy / CFR fixes outside the NLE
- `@losslesscut` — keyframe-aligned lossless trims before ingest

---

## Agent Operational Directive

> **MANDATORY**: Guard active project/sequence before mutations. For UXP, create Actions inside `lockedAccess` and use transactions. Prefer preset-driven AME exports; document frame rate/timebase; never embed Creative Cloud or Team Project secrets in scripts or project sidecars.

---

## Source anchors (research)

- [Premiere UXP overview](https://developer.adobe.com/premiere-pro/uxp/)
- [Premiere DOM API reference](https://developer.adobe.com/premiere-pro/uxp/ppro-reference/)
- [Markers API (since 25.6)](https://developer.adobe.com/premiere-pro/uxp/ppro-reference/classes/markers)
- [Premiere 26.3 API updates (lockedAccess, EncoderManager, setSelection sync)](https://forums.creativeclouddeveloper.com/t/premiere-26-3-api-updates/12009)
