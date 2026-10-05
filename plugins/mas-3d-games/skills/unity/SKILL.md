---
name: unity
description: "Automate Unity editor and runtime workflows with C#, Addressables, render pipelines, and batch builds."
category: game-engines
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["unity", "csharp", "editor-scripting", "urp", "addressables", "batchmode", "headless"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Unity Engine C# Editor & Runtime AI Skill Guide (Claude)

## Overview & Engine Architecture

Unity 6000.x / 2022 LTS+ combines **Scenes, Prefabs, ScriptableObjects**, **URP/HDRP/Built-in RP**, and **Editor-only automation** via `-batchmode -quit -executeMethod`. Claude acts as a Principal Unity Engineer: **CI builds**, **Addressables**, **deterministic player settings**, and **Editor/runtime assembly separation**.

```
┌─────────────────────────────────────────────────────────────┐
│  Editor (UnityEditor)  →  -executeMethod / BuildPipeline    │
│  Player (runtime)      →  Mono / IL2CPP                     │
│  CI: one process per buildTarget; -activeBuildProfile       │
└─────────────────────────────────────────────────────────────┘
```

**Version pin:** Unity Editor version in `ProjectSettings/ProjectVersion.txt` — CI must use the same Hub editor (e.g. `6000.0.xf1`). [Command-line reference](https://docs.unity3d.com/Manual/EditorCommandLineArguments.html).

---

## When to use / when not to

**Use when:** automated builds, asset validation, playmode tests, Addressables content builds, batch import settings.

**Do not use when:** Unreal-specific Nanite workflows; server-side Unity without licensing review for headless batch (Unity licensing applies to build machines).

---

## Operational Capabilities & Agent Directives

1. **Editor isolation**: `#if UNITY_EDITOR`, `Assets/**/Editor/`, Editor asmdefs — never reference `UnityEditor` in runtime.
2. **CI entry points**: `public static void X()` only; `EditorApplication.Exit(code)` on failure; no modal dialogs in batchmode.
3. **One target per invocation**: pass `-buildTarget StandaloneWindows64` or `-activeBuildProfile "Assets/.../Windows.asset"` — multi-target requires separate processes.
4. **Deterministic builds**: pin graphics tiers, disable random `Application.targetFrameRate` side effects in build scripts; use `BuildOptions.StrictMode` where available; log `Application.unityVersion`.
5. **Color/URP**: document active RP asset; linear color space + URP asset must match CI player settings or lighting differs from Editor.
6. **Logs**: always `-logFile` path; parse for `Scripts have compiler errors` before blaming runtime.

---

## Production C#: CI build + exit code

`Assets/Editor/CiBuild.cs`:

```csharp
#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

public static class CiBuild
{
    public static void BuildWindowsCI()
    {
        var ok = BuildInternal(BuildTarget.StandaloneWindows64, "Builds/Win/Game.exe");
        EditorApplication.Exit(ok ? 0 : 1);
    }

    static bool BuildInternal(BuildTarget target, string location)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(location)!);
        var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
        {
            scenes = EditorBuildSettingsScene.GetActiveSceneList(EditorBuildSettings.scenes),
            locationPathName = location,
            target = target,
            options = BuildOptions.CompressWithLz4HC
        });
        Debug.Log($"Build {report.summary.result} size={report.summary.totalSize}");
        return report.summary.result == BuildResult.Succeeded;
    }
}
#endif
```

```powershell
& "C:\Program Files\Unity\Hub\Editor\6000.0.42f1\Editor\Unity.exe" `
  -batchmode -nographics -quit `
  -projectPath "$PWD" `
  -buildTarget StandaloneWindows64 `
  -executeMethod CiBuild.BuildWindowsCI `
  -logFile "$PWD\Logs\ci-build.log"
```

---

## Addressables / content pipeline (batch)

Use `AddressableAssetSettings.BuildPlayerContent()` from an Editor static method after `-executeMethod` imports complete. Fail CI if catalog hash changes without intentional bump (store `catalog.json` hash artifact).

---

## Failure taxonomy

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| Hang after open | Modal dialog / missing `-quit` | `-batchmode -quit`; guard `DisplayDialog` |
| Wrong platform shaders | Missing `-buildTarget` / profile | Set `-activeBuildProfile` |
| `UnityEditor` in player | Editor script in runtime asmdef | Editor folder + asmdef platforms |
| Non-deterministic lighting | Different RP or color space | Serialize Quality/Graphics settings |
| License / activation | Batch on fresh VM | Unity license activation docs for CI |

Reddit/forum pattern: parallel Unity instances on **same project path** fail — one lock per `-projectPath`.

---

## Agent Operational Directive

> **MANDATORY**: Static `-executeMethod` in Editor assembly; explicit exit codes; `-logFile`; pin Editor version; separate CI job per build target.
