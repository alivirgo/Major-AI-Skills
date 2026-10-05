---
title: "Figma Design Systems AI Skill Guide (GPT & Codex)"
description: "GPT/Codex skill for Figma REST batch exporters, token JSON generators, plugin TypeScript scaffolds, and rate-limit-aware CI."
category: "Design / Figma"
tags: ["figma", "rest-api", "plugin", "gpt-codex", "design-tokens"]
---

# Figma Design Systems AI Skill Guide (GPT & Codex)

Generate **Node/TypeScript** plugins and **Python/Node REST clients** with built-in **429 backoff** and **chunked node ID lists**.

## REST client pattern (Python)

```python
import os, time, requests

TOKEN = os.environ["FIGMA_TOKEN"]
BASE = "https://api.figma.com/v1"

def get_json(path, retries=5):
    for attempt in range(retries):
        r = requests.get(BASE + path, headers={"X-Figma-Token": TOKEN})
        if r.status_code == 429:
            time.sleep(int(r.headers.get("Retry-After", 60)))
            continue
        r.raise_for_status()
        return r.json()
    raise RuntimeError("rate limited")
```

## Plugin scaffold

- `manifest.json`: `api`, `main`, `editorType`, `networkAccess`
- `code.ts`: no DOM; use `figma.ui.postMessage` for downloads
- Build with `@figma/plugin-typings`

## Token export

Walk Variables via REST (plan permitting) or Plugin `figma.variables.getLocalVariablesAsync()` → emit Style Dictionary JSON with `$type` hints.

## Limits

Document file plan in README; Starter files throttle CI to ~6 GET file/month — use Plugin export for high frequency.
