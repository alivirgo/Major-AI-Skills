---
title: "Rectangle macOS Window Manager AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Rectangle, URL scheme command pipelines, defaults CLI configurations, and AppleScript window snapping."
category: "Keyboard & Drag Window Manager"
tags: ["rectangle", "url-scheme", "macos-scripting", "window-management-cli", "gpt-codex", "defaults-write"]
---

# Rectangle macOS Window Manager AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Rectangle provides a developer-accessible URL scheme (**`rectangle://`**) and standard macOS **`defaults` preference keys** allowing headless scripts, terminal aliases, and external macro launchers (Stream Deck, Raycast, Alfred) to programmatically arrange windows. GPT/Codex acts as a Principal macOS Automation Architect and Systems Developer, delivering **batch URL scheme command runners**, **automated window layout shell scripts**, **`defaults write` configuration installers**, and **multi-window workplace orchestrators**.

### Developer Architecture & Automation Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Rectangle Developer Platform                │
│                                                             │
│  CLI & URL Scheme Ingress Tier                              │
│  ├── URL Scheme Dispatcher (`rectangle://execute-action?...`)│
│  ├── Named Action Matrix (`left-half`, `right-half`, `max`) │
│  └── macOS Terminal Shell Aliases & Functions               │
│                                                             │
│  System Configuration & Defaults Engine                     │
│  ├── `defaults write com.knollsoft.Rectangle ...`           │
│  ├── Keybinding Schema (JSON / Plist Keybinding Mappings)   │
│  └── Multi-App Workspace Provisioning Scripts               │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **URL Scheme Action Pipelines**: Build shell and Python scripts invoking `open -g "rectangle://execute-action?name=<action>"` to position specific application windows dynamically.
2. **Automated Defaults Configuration**: Script automated environment setup files (`.dotfiles`) configuring all Rectangle hotkeys, gap sizes, and snapping behaviors via `defaults write`.
3. **Multi-App Workspace Layout Orchestration**: Author scripts that launch an IDE, browser, and terminal, sequentially focusing each application and tiling them into predefined screen quadrants.
4. **Custom Keybinding JSON Exporter**: Construct import/export routines for Rectangle shortcut configurations.

---

## Production Bash Automation: Multi-App Developer Workspace Tiling Orchestrator

Save this script as `setup_dev_workspace.sh` and execute via `bash setup_dev_workspace.sh`:

```bash
#!/usr/bin/env bash
# ==============================================================================
# Rectangle Automated Workspace Orchestrator
# Launches development apps and tiles them into split-screen layouts via URL scheme.
# ==============================================================================
set -euo pipefail

echo "--- [ORCHESTRATING DEVELOPER WORKSPACE VIA RECTANGLE] ---"

snap_app() {
    local app_name="$1"
    local action="$2"

    echo "Focusing '$app_name' and applying action '$action'..."
    open -a "$app_name"
    sleep 0.4 # Allow AppKit focus transition
    open -g "rectangle://execute-action?name=$action"
    sleep 0.2
}

# 1. Tile Visual Studio Code to Left Half
snap_app "Visual Studio Code" "left-half"

# 2. Tile Terminal to Top-Right Quarter
snap_app "Terminal" "top-right"

# 3. Tile Google Chrome / Safari to Bottom-Right Quarter
snap_app "Safari" "bottom-right"

echo "✅ Developer workspace tiled successfully!"
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`open -g rectangle://...` Does Not Move Window** | Target window does not hold active keyboard focus at the moment the URL scheme executes. | Insert a brief `sleep 0.3` after focusing the target application via `open -a AppName`. |
| **`defaults write` Changes Do Not Take Effect** | Rectangle was running and overwrote `com.knollsoft.Rectangle.plist` from in-memory cache upon exit. | 1. Quit Rectangle first: `killall Rectangle`.<br>2. Run `defaults write ...`.<br>3. Relaunch Rectangle: `open -a Rectangle`. |
| **URL Action Name Unrecognized** | Action name in query parameter contains typos or invalid syntax. | Use standard action names: `left-half`, `right-half`, `top-half`, `bottom-half`, `top-left`, `top-right`, `bottom-left`, `bottom-right`, `maximize`, `almost-maximize`, `center`, `first-third`, `center-third`, `last-third`, `next-display`, `previous-display`. |
| **App Store Version vs Direct Download Version Conflict** | Preference domain or sandboxing container differences between MAS and GitHub release builds. | Direct download uses `~/Library/Preferences/com.knollsoft.Rectangle.plist`. |

---

## Command Line Syntax & Batch Processing

```bash
# 1. Configure Zero Gap Size via defaults CLI
defaults write com.knollsoft.Rectangle gapSize -float 0.0

# 2. Set Spectacle Shortcut Preset
defaults write com.knollsoft.Rectangle alternateDefaultShortcuts -int 1

# 3. Execute Next Display Move
open -g "rectangle://execute-action?name=next-display"
```

### Essential File Locations
- **Preferences Plist**: `~/Library/Preferences/com.knollsoft.Rectangle.plist`
- **Application Binary**: `/Applications/Rectangle.app`

---

## Agent Operational Directive
> **MANDATORY**: Always terminate the Rectangle process (`killall Rectangle`) before modifying preference values via `defaults write` to prevent in-memory cache overrides upon application quit.
