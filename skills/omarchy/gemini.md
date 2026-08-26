---
title: "Omarchy Linux Distribution AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually inspect, configure, troubleshoot, and optimize Omarchy - the omakase Arch Linux distribution by DHH built on Hyprland, Quickshell, and modern CLI tools."
category: "Linux Desktop Distribution & Tiling Window Manager"
tags: ["omarchy", "arch-linux", "hyprland", "quickshell", "neovim", "tiling-wm", "linux-distribution", "dhh", "wayland", "gemini"]
---

# Omarchy Linux Distribution AI Skill Guide (Gemini)

## Overview & Visual Diagnostic Architecture
Omarchy is a **beautiful, modern, and opinionated** omakase Linux distribution created by **David Heinemeier Hansson (DHH)**. Built on **Arch Linux** with the **Hyprland** Wayland tiling compositor and **Quickshell** QML desktop panels, Omarchy delivers an aesthetics-first, productivity-focused Linux experience. Version 4.0 "Quattro" is the current release. Gemini operates as a Multimodal Linux Desktop Diagnostician, specializing in **visual UI inspection of tiling layouts**, **screenshot-based compositor debugging**, **Quickshell QML panel verification**, **theme color accuracy validation**, and **real-time system telemetry monitoring**.

### Visual Inspection Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              Omarchy Visual Diagnostic Architecture             │
│                                                                 │
│  Visual Layer (Screenshot & Screen Analysis)                    │
│  ├── Hyprland Tiling Layout Verification (window gaps, borders) │
│  ├── Quickshell Top Bar Panel Rendering (icons, clock, status)  │
│  ├── Theme Color Consistency Audit (wallpaper, accent matching) │
│  └── Font Rendering Quality Assessment (hinting, anti-aliasing) │
│                                                                 │
│  Compositor & Display Telemetry                                 │
│  ├── hyprctl monitors (resolution, scale, refresh rate)         │
│  ├── hyprctl clients (window tree, workspace assignments)       │
│  ├── hyprctl layers (overlay, top, bottom layer surfaces)       │
│  └── GPU driver status (nvidia-smi / lspci / vainfo)           │
│                                                                 │
│  System Performance Monitoring                                  │
│  ├── btop / htop (CPU, memory, process monitoring)              │
│  ├── PipeWire / WirePlumber (audio routing telemetry)           │
│  ├── systemd journal (service status, boot errors)              │
│  └── pacman database (package versions, update status)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Visual Tiling Layout Analysis**: Inspect screenshots of Hyprland desktop to verify window arrangement, gap sizes, border colors, and workspace distribution across monitors.
2. **Quickshell Panel Diagnostics**: Visually audit top bar panel rendering - clock accuracy, workspace indicators, system tray icons, notification badges, and media controls.
3. **Theme Color Validation**: Compare applied theme colors against `theme.toml` definitions, verifying wallpaper integration, accent consistency across bar, borders, and application windows.
4. **Monitor Configuration Verification**: Analyze `hyprctl monitors` output to validate resolution, scaling factors, refresh rates, and multi-monitor positioning.
5. **Performance Telemetry Interpretation**: Read btop/htop outputs, systemd journal logs, and PipeWire status to diagnose resource bottlenecks and audio routing issues.
6. **Font & DPI Rendering Audit**: Inspect text rendering quality across terminal (Ghostty), editor (Neovim), and GUI applications for proper font hinting and HiDPI scaling.

---

## Visual Diagnostic Commands & Telemetry Collection

```bash
# ═══════════════════════════════════════════════════
# Omarchy Visual Diagnostic Data Collection Script
# Run to gather system state for Gemini inspection
# ═══════════════════════════════════════════════════

# 1. Compositor State
echo "=== Hyprland Version ===" && hyprctl version
echo "=== Monitor Configuration ===" && hyprctl monitors
echo "=== Active Windows ===" && hyprctl clients
echo "=== Active Workspaces ===" && hyprctl workspaces
echo "=== Layer Surfaces ===" && hyprctl layers

# 2. GPU & Display Info
echo "=== GPU Devices ===" && lspci -k | grep -A2 VGA
echo "=== Wayland Session ===" && echo "XDG_SESSION_TYPE=$XDG_SESSION_TYPE"
echo "=== Display Scale ===" && hyprctl monitors | grep -E 'scale|Monitor'

# 3. System Resources
echo "=== Memory ===" && free -h
echo "=== Disk ===" && df -h / /home
echo "=== CPU ===" && lscpu | grep -E 'Model name|CPU\(s\)|MHz'

# 4. Audio Pipeline
echo "=== PipeWire Status ===" && systemctl --user status pipewire --no-pager
echo "=== WirePlumber Devices ===" && wpctl status

# 5. Theme State
echo "=== Current Theme ===" && cat ~/.config/omarchy/current-theme 2>/dev/null || echo "default"
echo "=== Hyprland Colors ===" && grep -E 'col\.' ~/.config/hypr/hyprland.conf

# 6. Package Versions
echo "=== Core Packages ===" && pacman -Q hyprland quickshell ghostty neovim tmux zsh 2>/dev/null

# 7. Screenshot for Visual Analysis
grim /tmp/omarchy-screenshot.png && echo "Screenshot saved to /tmp/omarchy-screenshot.png"
```

---

## Hyprland Window Layout Diagnostic Reference

### Layout Inspection via hyprctl

```bash
# List all managed windows with geometry
hyprctl clients -j | jq '.[] | {class: .class, title: .title, workspace: .workspace.id, 
  size: "\(.size[0])x\(.size[1])", pos: "\(.at[0]),\(.at[1])", floating: .floating}'

# Verify workspace distribution
hyprctl workspaces -j | jq '.[] | {id: .id, monitor: .monitor, windows: .windows}'

# Check active monitor configurations
hyprctl monitors -j | jq '.[] | {name: .name, resolution: "\(.width)x\(.height)", 
  scale: .scale, refreshRate: .refreshRate, position: "\(.x),\(.y)"}'

# Inspect layer surfaces (panels, overlays)
hyprctl layers -j | jq 'to_entries[] | {monitor: .key, layers: [.value[][] | .namespace]}'
```

---

## Theme Visual Verification Workflow

```bash
# Step 1: Capture current desktop screenshot
grim ~/Pictures/theme-audit-$(date +%s).png

# Step 2: Extract applied theme colors
echo "=== Active Hyprland Border Colors ==="
grep 'col.active_border' ~/.config/hypr/hyprland.conf
grep 'col.inactive_border' ~/.config/hypr/hyprland.conf

# Step 3: Check Quickshell panel colors
echo "=== Quickshell QML Colors ==="
grep -r 'color:' ~/.config/quickshell/ 2>/dev/null | head -20

# Step 4: Verify wallpaper path
echo "=== Current Wallpaper ==="
hyprctl hyprpaper listloaded 2>/dev/null || \
  grep 'wallpaper' ~/.config/hypr/hyprpaper.conf 2>/dev/null

# Step 5: Check GTK theme for GUI apps
echo "=== GTK Theme ==="
grep 'gtk-theme-name' ~/.config/gtk-3.0/settings.ini 2>/dev/null
grep 'gtk-icon-theme-name' ~/.config/gtk-3.0/settings.ini 2>/dev/null
```

---

## Multi-Monitor Layout Verification

```
┌──────────────────────────────────────────────────────────┐
│  Expected Multi-Monitor Layout (Visual Reference)        │
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │  Monitor: DP-1  │  │  Monitor: HDMI  │               │
│  │  3840x2160@144  │  │  2560x1440@60   │               │
│  │  Scale: 1.5     │  │  Scale: 1.0     │               │
│  │  Primary        │  │  Secondary      │               │
│  │  WS: 1,2,3,4,5  │  │  WS: 6,7,8,9   │               │
│  │                 │  │                 │               │
│  │  [Term] [Code]  │  │  [Browser]      │               │
│  │  [Term] [Chat]  │  │  [Docs]         │               │
│  └─────────────────┘  └─────────────────┘               │
│                                                          │
│  Validation: hyprctl monitors -j | jq '.[] | .name'     │
└──────────────────────────────────────────────────────────┘
```

---

## Technical Troubleshooting Matrix (Visual Diagnostic Focus)

| Visual Symptom | Diagnostic Command | Root Cause & Resolution |
| :--- | :--- | :--- |
| **Window gaps uneven or missing** | `hyprctl getoption general:gaps_in` | Check `general { gaps_in = 5; gaps_out = 10; }` in hyprland.conf. Reload: `hyprctl reload`. |
| **Top bar panel is blank or invisible** | `hyprctl layers -j \| jq '.[][]["top"]'` | Quickshell crash. Check: `journalctl --user -u quickshell`. Restart: `killall quickshell && quickshell &`. |
| **Border colors don't match theme** | `grep col. ~/.config/hypr/hyprland.conf` | Update `col.active_border` and `col.inactive_border` in hyprland.conf. Apply: `hyprctl reload`. |
| **Blurry text on HiDPI monitor** | `hyprctl monitors -j \| jq '.[].scale'` | Adjust monitor scale: `monitor = DP-1, 3840x2160@144, 0x0, 1.5`. Set `env = GDK_SCALE,2` for GTK apps. |
| **Wallpaper not displaying** | `hyprctl hyprpaper listloaded` | Re-apply: `hyprctl hyprpaper preload ~/Pictures/wall.jpg && hyprctl hyprpaper wallpaper "DP-1,~/Pictures/wall.jpg"`. |
| **Screen tearing during video playback** | `hyprctl getoption misc:vfr` | Enable VFR: Add `misc { vfr = true }` to hyprland.conf. For Nvidia: `env = __GL_GSYNC_ALLOWED,1`. |
| **No audio output (PipeWire)** | `wpctl status` | Check default sink: `wpctl inspect @DEFAULT_AUDIO_SINK@`. Set default: `wpctl set-default <id>`. Restart: `systemctl --user restart pipewire wireplumber`. |

---

## Essential File Locations

```
~/.config/hypr/hyprland.conf       # Compositor configuration
~/.config/quickshell/              # Panel QML configuration
~/.config/ghostty/config           # Terminal configuration
~/.config/nvim/init.lua            # Neovim entry point
~/.config/tmux/tmux.conf           # Terminal multiplexer
~/.config/rofi/                    # Application launcher
~/.config/starship.toml            # Shell prompt
~/.config/omarchy/                 # Omarchy settings & themes
~/.config/gtk-3.0/settings.ini     # GTK3 theme settings
~/.config/gtk-4.0/settings.ini     # GTK4 theme settings
~/.local/share/hyprland/           # Hyprland runtime logs
/tmp/omarchy-screenshot.png        # Diagnostic screenshot output
```

---

## Agent Operational Directive
> **MANDATORY**: When performing visual diagnostics on Omarchy systems, always capture a screenshot using `grim` for compositor-level analysis, collect `hyprctl monitors` and `hyprctl clients` output for layout verification, and cross-reference theme colors between `hyprland.conf` border definitions and Quickshell QML color definitions. Report discrepancies with hex color code comparisons.
