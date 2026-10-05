---
title: "Unity Engine AI Skill Guide (GPT & Codex)"
description: "GPT/Codex skill for Unity CI scripts, BuildPipeline automation, Addressables batch builds, and command-line argument parsing."
category: "Game Engines / Unity"
tags: ["unity", "batchmode", "executeMethod", "gpt-codex", "ci"]
---

# Unity Engine AI Skill Guide (GPT & Codex)

Generate **Editor-only C#** with **static CI entrypoints** and **PowerShell/bash launchers** that parse `%ERRORLEVEL%` / exit codes.

## Checklist for every CI script

- [ ] Class in `Editor` folder or Editor asmdef
- [ ] `EditorApplication.Exit(1)` on failure
- [ ] No `Debug.Break`, dialogs, or `EditorUtility.DisplayProgressBar` without batch guards
- [ ] Read custom args via `Environment.GetCommandLineArgs()`
- [ ] Write artifacts under `Artifacts/` gitignored path

## Template: parse CLI custom flags

```csharp
static string? ArgValue(string name)
{
    var args = System.Environment.GetCommandLineArgs();
    for (int i = 0; i < args.Length - 1; i++)
        if (args[i] == name) return args[i + 1];
    return null;
}
```

## Test automation

`-runTests -testPlatform editmode -testResults Logs/editmode.xml -batchmode -quit` — gate merge on XML failures.

## License note

Document that build agents need valid Unity licensing; do not embed license files in repo.
