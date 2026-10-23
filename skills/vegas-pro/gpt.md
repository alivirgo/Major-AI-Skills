---
title: "MAGIX VEGAS Pro NLE & Automation AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to emit ScriptPortal.Vegas C# scripts, region/marker batch renders, CFR preflight wrappers, and template enumerators."
category: "Windows NLE Automation"
tags: ["vegas-pro", "scriptportal", "csharp", "gpt-codex", "nvenc"]
---

# MAGIX VEGAS Pro NLE & Automation AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Windows NLE Automation Engineer**: emit **C# EntryPoint scripts**, **template discovery helpers**, **region render loops**, and **ffmpeg CFR preflight** — parameterized by VEGAS major version and install path.

```
┌─────────────────────────────────────────────────────────────┐
│                 VEGAS automation stack                        │
│  EntryPoint.FromVegas → Regions/Markers/Tracks                │
│  Enumerate Renderers/Templates → RenderArgs                   │
│  Optional: ffmpeg CFR gate before project ingest              │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Always scaffold** `EntryPoint.FromVegas` with `ScriptPortal.Vegas`.
2. **Enumerate templates**; accept CLI/SCRIPTARGS for template substring + output dir.
3. **Sanitize filenames** from region labels.
4. **Emit CFR preflight** for mobile/OBS ingest folders.
5. **No license cracks** or serial generators.

---

## Production C#: list templates (debug helper)

```csharp
using System.Text;
using System.Windows.Forms;
using ScriptPortal.Vegas;

public class EntryPoint {
    public void FromVegas(Vegas vegas) {
        var sb = new StringBuilder();
        foreach (Renderer r in vegas.Renderers) {
            sb.AppendLine("== " + r.FileTypeName + " ==");
            foreach (RenderTemplate t in r.Templates)
                sb.AppendLine("  - " + t.Name);
        }
        MessageBox.Show(sb.ToString().Length > 3000
            ? sb.ToString().Substring(0, 3000) + "…"
            : sb.ToString());
    }
}
```

---

## Technical Troubleshooting Matrix

| Script signature | Check | Fix |
| :--- | :--- | :--- |
| Template null | Name mismatch | List templates script first |
| RenderStatus not Complete | GPU crash mid-render | RAM Preview 0; Studio driver |
| Compile error on Vegas types | Wrong DLL / old API | Match ScriptPortal to install |

---

## Agent Operational Directive

> **MANDATORY**: Enumerate templates; parameterize paths/version; CFR-preflight VFR; never emit license bypasses.
---

## Source anchors

- [Using Scripting (VEGAS 23)](https://help.magix-hub.com/video/vegas/23/en/content/topics/11-autoscript/scripting_vegas.htm)
- [Scripting API Summary](https://help.magix-hub.com/video/vegas/22/en/content/topics/external/vegasscriptapi.html)
