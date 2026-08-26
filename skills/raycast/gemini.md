---
title: "Raycast macOS Extensible Productivity Launcher AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Raycast Launcher HUDs, Extension Store views, Quicklink grids, and Raycast AI chat interfaces."
category: "Spotlight & Productivity Launcher Replacement"
tags: ["raycast", "macos-launcher", "launcher-hud", "gemini", "raycast-ai", "extension-store"]
---

# Raycast macOS Extensible Productivity Launcher AI Skill Guide (Gemini)

## Overview & Engine Architecture
Raycast provides a keyboard-centric launcher interface featuring instant search results, dynamic detail panels, extension preference inspectors, and integrated Raycast AI conversational sidebars. Gemini acts as an AI macOS Productivity Architect and UI Workflow Specialist, specializing in **multimodal Raycast HUD inspection**, **Action Panel shortcut validation (`⌘ + K`)**, **Raycast Store extension diagnostics**, and **Raycast AI prompt tuning**.

### Visual Analytics & Launcher UI Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Raycast Visual Operations Stack             │
│                                                             │
│  Launcher HUD Presentation Tier                             │
│  ├── Main Search Bar (Filter / Query Input Field)           │
│  ├── Multi-Column List View (`List.Item` Badges, Accessories│
│  ├── Detail Markdown Viewport (`Detail` Metadata HUD)       │
│  └── Action Panel Popover (`⌘ + K` Keyboard Shortcut Grid)  │
│                                                             │
│  Extension Store & AI Assistant                             │
│  ├── Store Browser (Extension Cards, Author, Install Count) │
│  └── Raycast AI Chat Sidebar (Inline Model Switcher, Prompts│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal HUD & UI Review**: Analyze screenshots of Raycast search results, list views, and detail panels to verify accessory label alignments, markdown image rendering, and icon contrast.
2. **Action Panel (`⌘ + K`) Optimization**: Ensure critical secondary actions (copying URLs, toggling flags, opening files) are mapped with intuitive keyboard shortcuts.
3. **Raycast AI Prompt Design**: Author and test system prompts for Raycast AI Commands (*e.g. Code Refactoring, Git Commit Message Generation, Text Proofreading*).
4. **Extension Store Discovery & Troubleshooting**: Troubleshoot extension installation errors, missing OAuth tokens, and outdated API dependencies.

---

## Production Python Automation: Automated Raycast Quicklink & Snippet Generator

Execute this script to generate imported JSON snippet files for Raycast with dynamic placeholders:

```python
"""
Raycast Snippet & Quicklink Generator
Generates importable Raycast Snippets JSON with dynamic date/clipboard placeholders.
"""

import sys
import json

def generate_developer_snippets(output_file: str):
    snippets = [
        {
            "name": "Git Fixup Commit",
            "text": "git commit --fixup {clipboard}",
            "keyword": "!gfix"
        },
        {
            "name": "ISO 8601 Timestamp",
            "text": "{date format=\"yyyy-MM-dd'T'HH:mm:ssXXX\"}",
            "keyword": "!isotime"
        },
        {
            "name": "TypeScript Interface Template",
            "text": "export interface {clipboard} {\n  id: string;\n  createdAt: Date;\n  updatedAt: Date;\n}",
            "keyword": "!tsif"
        }
    ]

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(snippets, f, indent=2)

    print(f"✅ Generated {len(snippets)} Raycast snippets to: {output_file}")
    print("To import: In Raycast, search 'Import Snippets' and select this JSON file.")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "raycast_dev_snippets.json"
    generate_developer_snippets(out)
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Search Bar Shows Blank Screen on Keystroke** | Corrupted Raycast local cache or SQLite search index. | 1. In Raycast, search **Reload Extensions**.<br>2. If unresolved, quit Raycast and delete `~/Library/Application Support/com.raycast.macos/data`. |
| **Extension Store Throws `Network Error`** | macOS proxy or corporate firewall blocking WebSocket / HTTPS connection to `api.raycast.com`. | In Raycast Settings $\rightarrow$ **Advanced**, configure HTTP Proxy settings or whitelist `*.raycast.com`. |
| **Markdown Images in Detail View Show Broken Icon** | Image URI is using unencoded HTTP or insecure external links blocked by Content Security Policy. | Use local assets bundled in extension (`assets/image.png`) or secure HTTPS URLs. |
| **Raycast AI Returns `Rate Limit Exceeded`** | Raycast AI usage ceiling reached for the active subscription tier. | In Raycast Settings $\rightarrow$ **AI**, switch to alternative model (e.g. Claude 3.5 Sonnet / GPT-4o). |

---

## Command Line Syntax & Server Control

```bash
# Launch Raycast Preferences Directly via URL Scheme
open "raycast://conf"

# Launch Specific Raycast Extension Command via URL Scheme
open "raycast://extensions/raycast/system/lock-screen"
```

### Key Configuration Locations
- **Application Support Directory**: `~/Library/Application Support/com.raycast.macos/`
- **Preferences Plist**: `~/Library/Preferences/com.raycast.macos.plist`

---

## Agent Operational Directive
> **MANDATORY**: When building Raycast Extension UI components, always prioritize standard Action Panel shortcut ergonomics (`⌘ + Enter` for Primary, `⌘ + Shift + C` for Copy) to preserve native macOS keyboard fluency.
