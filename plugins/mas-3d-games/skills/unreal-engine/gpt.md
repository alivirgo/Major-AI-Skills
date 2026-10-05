---
title: "Unreal Engine 5 AI Skill Guide (GPT & Codex)"
description: "GPT/Codex skill for UAT BuildCookRun scripts, Editor Python batch tools, and CI validation commandlets."
category: "Game Engines / Unreal"
tags: ["unreal-engine", "uat", "python", "gpt-codex", "packaging"]
---

# Unreal Engine 5 AI Skill Guide (GPT & Codex)

Emit **PowerShell/Batch CI jobs** wrapping `RunUAT.bat` and **Python files** intended for `-ExecutePythonScript=`.

## CI job structure

1. Resolve `Engine/` from `-engine=` or `UE_ROOT` env
2. `-unattended -nop4 -nosplash -stdout` on editor invocations
3. Upload `Saved/Logs/*.log` on failure
4. Exit non-zero if UAT returns non-zero

## Python conventions

- Use `unreal.log` / `unreal.log_error` instead of print for Editor visibility
- Batch asset edits inside `unreal.ScopedSlowTask` for progress
- Call `unreal.EditorLoadingAndSavingUtils.save_dirty_packages()` before cook

## MRQ batch (outline)

Generate JSON job queue from Python; submit via `unreal.MoviePipelineQueueSubsystem` — pin **Output Setting** resolution, **Console Variable** overrides, **warm up frame count**.

## License

Epic EULA applies to build farm; do not redistribute cooked content without compliance review.
