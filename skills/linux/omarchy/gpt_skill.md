---
title: "Omarchy Linux Distribution AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT & Codex to script, automate, extend, and manage Omarchy — the omakase Arch Linux distribution by DHH built on Hyprland, Quickshell, Neovim, and modern development tools."
category: "Linux Desktop Distribution & Tiling Window Manager"
tags: ["omarchy", "arch-linux", "hyprland", "quickshell", "neovim", "tiling-wm", "linux-distribution", "dhh", "wayland", "gpt", "codex"]
---

# Omarchy Linux Distribution AI Skill Guide (GPT & Codex)

## Overview & Scripting Architecture
Omarchy is a **beautiful, modern, and opinionated** omakase Linux distribution created by **David Heinemeier Hansson (DHH)**. Built on **Arch Linux** with the **Hyprland** Wayland tiling compositor and **Quickshell** QML desktop construction kit, Omarchy ships with a complete development environment including Neovim, Ghostty terminal, Tmux, and 30+ curated CLI tools. Version 4.0 "Quattro" is the current release. GPT/Codex operates as a Linux Automation Engineer and Shell Script Developer, specializing in **Bash/Zsh automation scripts**, **Hyprland IPC socket programming**, **Neovim Lua plugin development**, **Quickshell QML widget authoring**, **systemd service unit creation**, and **pacman/paru package management pipelines**.

### Scripting & Automation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│               Omarchy Automation Architecture                   │
│                                                                 │
│  Shell Scripting & CLI Automation                               │
│  ├── Bash/Zsh Scripts (~/.local/bin/)                           │
│  ├── Omarchy CLI (omarchy update/theme/install/plugin)          │
│  ├── fzf + fd + ripgrep Composition Pipelines                   │
│  └── jq JSON Processing (hyprctl JSON output parsing)           │
│                                                                 │
│  Hyprland IPC Socket Programming                                │
│  ├── hyprctl dispatch (window/workspace manipulation)           │
│  ├── hyprctl keyword (runtime config modification)              │
│  ├── UNIX Socket: /tmp/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.sock  │
│  └── Event Subscription: socat + hyprctl event stream           │
│                                                                 │
│  Neovim Lua Plugin Development                                  │
│  ├── lazy.nvim Plugin Manager (plugin specs & lazy-loading)     │
│  ├── nvim-lspconfig (Language Server Protocol configuration)    │
│  ├── telescope.nvim (fuzzy finder framework)                    │
│  └── Custom Lua modules (lua/plugins/, lua/config/)             │
│                                                                 │
│  System Service & Package Management                            │
│  ├── systemd Unit Files (user & system services)                │
│  ├── pacman (official repos) + paru (AUR helper)                │
│  ├── Omarchy Shell Plugins (Zsh plugin framework)               │
│  └── mise (polyglot version manager for dev runtimes)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Bash/Zsh Script Development**: Author shell scripts for workspace automation, system monitoring, backup routines, and Omarchy CLI extensions using POSIX-compliant and Bash-specific constructs.
2. **Hyprland IPC Socket Automation**: Program the Hyprland compositor via `hyprctl` commands and UNIX domain sockets for dynamic window placement, workspace management, and event-driven automation.
3. **Neovim Lua Plugin Authoring**: Develop Neovim plugins using Lua, configure LSP servers with `mason.nvim`/`lspconfig`, create Telescope pickers, and define custom keymaps.
4. **Quickshell QML Widget Development**: Create custom Quickshell panels and widgets using Qt Quick/QML declarative syntax for system information displays, media controls, and notifications.
5. **systemd Service Unit Creation**: Write and manage systemd service, timer, and socket units for daemon management, scheduled tasks, and auto-start services.
6. **Package Management Automation**: Script pacman/paru operations for batch installs, system upgrades, orphan cleanup, and AUR package building pipelines.

---

## Production Script: Hyprland IPC Workspace Manager

```bash
#!/usr/bin/env bash
# ==============================================================================
# Omarchy Hyprland Workspace Manager — IPC Socket Automation Script
# Provides smart workspace creation, window movement, and layout presets.
# Usage: omarchy-workspace.sh <command> [args]
# ==============================================================================
set -euo pipefail

HYPR_SOCK="/tmp/hypr/${HYPRLAND_INSTANCE_SIGNATURE}/.socket.sock"

hypr_dispatch() {
    hyprctl dispatch "$@" 2>/dev/null
}

hypr_json() {
    hyprctl "$@" -j 2>/dev/null
}

# Get active workspace ID
get_active_workspace() {
    hypr_json activeworkspace | jq -r '.id'
}

# Get focused window class
get_focused_class() {
    hypr_json activewindow | jq -r '.class'
}

# Get window count on workspace
get_workspace_window_count() {
    local ws_id="${1}"
    hypr_json clients | jq "[.[] | select(.workspace.id == ${ws_id})] | length"
}

# Move focused window to workspace and follow
move_and_follow() {
    local target_ws="${1}"
    hypr_dispatch movetoworkspace "${target_ws}"
}

# Apply Development Layout Preset (3-column: Terminal | Editor | Browser)
apply_dev_layout() {
    echo "Applying development layout preset..."
    
    # Workspace 1: Terminal (Ghostty)
    hypr_dispatch workspace 1
    hypr_dispatch exec "[workspace 1] ghostty"
    
    # Workspace 2: Editor (Neovim in Ghostty)
    hypr_dispatch exec "[workspace 2] ghostty -e nvim"
    
    # Workspace 3: Browser (Chromium)
    hypr_dispatch exec "[workspace 3] chromium"
    
    # Focus workspace 2 (editor)
    sleep 1
    hypr_dispatch workspace 2
    
    echo "Development layout applied: Terminal(1) | Editor(2) | Browser(3)"
}

# Smart workspace finder — go to first empty workspace
goto_empty_workspace() {
    local occupied
    occupied=$(hypr_json workspaces | jq '[.[].id] | sort | .[]')
    
    for i in $(seq 1 10); do
        if ! echo "$occupied" | grep -qw "$i"; then
            hypr_dispatch workspace "$i"
            echo "Moved to empty workspace ${i}"
            return
        fi
    done
    echo "No empty workspaces found (1-10 all occupied)"
}

# Collect all windows of same class to current workspace
collect_windows() {
    local target_class
    target_class=$(get_focused_class)
    local current_ws
    current_ws=$(get_active_workspace)
    
    echo "Collecting all '${target_class}' windows to workspace ${current_ws}..."
    hypr_json clients | jq -r ".[] | select(.class == \"${target_class}\" and .workspace.id != ${current_ws}) | .address" | while read -r addr; do
        hyprctl dispatch movetoworkspacesilent "${current_ws},address:${addr}"
    done
    echo "Done."
}

# Display workspace overview
show_overview() {
    echo "═══════════════════════════════════════"
    echo "  Omarchy Workspace Overview"
    echo "═══════════════════════════════════════"
    hypr_json workspaces | jq -r 'sort_by(.id) | .[] | "  WS \(.id) [\(.monitor)] — \(.windows) window(s)"'
    echo "───────────────────────────────────────"
    echo "  Active: WS $(get_active_workspace)"
    echo "  Focused: $(get_focused_class)"
    echo "═══════════════════════════════════════"
}

# Command Router
case "${1:-help}" in
    move)    move_and_follow "${2:?Usage: move <workspace_id>}" ;;
    dev)     apply_dev_layout ;;
    empty)   goto_empty_workspace ;;
    collect) collect_windows ;;
    overview|status) show_overview ;;
    *)
        echo "Omarchy Workspace Manager"
        echo "Usage: $(basename "$0") <command>"
        echo ""
        echo "Commands:"
        echo "  move <ws_id>  Move focused window to workspace and follow"
        echo "  dev           Apply development layout preset"
        echo "  empty         Go to first empty workspace"
        echo "  collect       Collect all same-class windows to current workspace"
        echo "  overview      Show workspace overview"
        ;;
esac
```

---

## Neovim Lua Plugin: Omarchy Workspace Picker

```lua
-- ==============================================================================
-- Neovim Lua Plugin: Omarchy Hyprland Workspace Picker for Telescope
-- Place at: ~/.config/nvim/lua/plugins/omarchy-picker.lua
-- ==============================================================================

return {
  "nvim-telescope/telescope.nvim",
  dependencies = { "nvim-lua/plenary.nvim" },
  config = function()
    local telescope = require("telescope")
    local pickers = require("telescope.pickers")
    local finders = require("telescope.finders")
    local sorters = require("telescope.sorters")
    local actions = require("telescope.actions")
    local action_state = require("telescope.actions.state")

    -- Custom picker: Switch Hyprland workspace from Neovim
    local function omarchy_workspace_picker()
      local handle = io.popen("hyprctl workspaces -j 2>/dev/null")
      if not handle then
        vim.notify("Failed to query Hyprland workspaces", vim.log.levels.ERROR)
        return
      end

      local result = handle:read("*a")
      handle:close()

      local ok, workspaces = pcall(vim.fn.json_decode, result)
      if not ok or type(workspaces) ~= "table" then
        vim.notify("Failed to parse Hyprland workspace data", vim.log.levels.ERROR)
        return
      end

      table.sort(workspaces, function(a, b) return a.id < b.id end)

      local entries = {}
      for _, ws in ipairs(workspaces) do
        table.insert(entries, {
          display = string.format("WS %d [%s] — %d windows", ws.id, ws.monitor, ws.windows),
          value = ws.id,
        })
      end

      pickers.new({}, {
        prompt_title = "Omarchy Workspaces",
        finder = finders.new_table({
          results = entries,
          entry_maker = function(entry)
            return {
              value = entry.value,
              display = entry.display,
              ordinal = entry.display,
            }
          end,
        }),
        sorter = sorters.get_generic_fuzzy_sorter(),
        attach_mappings = function(prompt_bufnr, _)
          actions.select_default:replace(function()
            local selection = action_state.get_selected_entry()
            actions.close(prompt_bufnr)
            if selection then
              vim.fn.system("hyprctl dispatch workspace " .. selection.value)
              vim.notify("Switched to workspace " .. selection.value)
            end
          end)
          return true
        end,
      }):find()
    end

    -- Register command and keymap
    vim.api.nvim_create_user_command("OmarchyWorkspace", omarchy_workspace_picker, {})
    vim.keymap.set("n", "<leader>ow", omarchy_workspace_picker, { desc = "Omarchy: Switch Workspace" })
  end,
}
```

---

## Quickshell QML Widget: System Monitor Panel

```qml
// ==============================================================================
// Quickshell QML Widget: System Resource Monitor for Omarchy Top Bar
// Place at: ~/.config/quickshell/components/SystemMonitor.qml
// ==============================================================================

import QtQuick 2.15
import QtQuick.Layouts 1.15
import Quickshell 1.0

Item {
    id: systemMonitor
    width: metricsRow.width
    height: parent.height

    property string cpuUsage: "0%"
    property string memUsage: "0%"
    property string diskUsage: "0%"

    Timer {
        interval: 3000
        running: true
        repeat: true
        triggeredOnStart: true
        onTriggered: {
            // CPU usage from /proc/stat
            var cpuProc = Process { command: ["bash", "-c", 
                "top -bn1 | grep 'Cpu(s)' | awk '{print int($2)}'"
            ] }
            cpuProc.onFinished.connect(function() {
                systemMonitor.cpuUsage = cpuProc.stdout.trim() + "%"
            })
            cpuProc.start()

            // Memory usage
            var memProc = Process { command: ["bash", "-c",
                "free | awk '/Mem:/ {printf \"%.0f\", $3/$2 * 100}'"
            ] }
            memProc.onFinished.connect(function() {
                systemMonitor.memUsage = memProc.stdout.trim() + "%"
            })
            memProc.start()

            // Disk usage
            var diskProc = Process { command: ["bash", "-c",
                "df / --output=pcent | tail -1 | tr -d ' %'"
            ] }
            diskProc.onFinished.connect(function() {
                systemMonitor.diskUsage = diskProc.stdout.trim() + "%"
            })
            diskProc.start()
        }
    }

    RowLayout {
        id: metricsRow
        anchors.verticalCenter: parent.verticalCenter
        spacing: 12

        // CPU Metric
        Row {
            spacing: 4
            Text { text: "CPU"; color: "#88C0D0"; font.pixelSize: 11; font.family: "monospace" }
            Text { text: systemMonitor.cpuUsage; color: "#ECEFF4"; font.pixelSize: 11; font.family: "monospace" }
        }

        // Memory Metric
        Row {
            spacing: 4
            Text { text: "MEM"; color: "#A3BE8C"; font.pixelSize: 11; font.family: "monospace" }
            Text { text: systemMonitor.memUsage; color: "#ECEFF4"; font.pixelSize: 11; font.family: "monospace" }
        }

        // Disk Metric
        Row {
            spacing: 4
            Text { text: "DSK"; color: "#EBCB8B"; font.pixelSize: 11; font.family: "monospace" }
            Text { text: systemMonitor.diskUsage; color: "#ECEFF4"; font.pixelSize: 11; font.family: "monospace" }
        }
    }
}
```

---

## systemd Service Unit: Auto-Start Omarchy Services

```ini
# ==============================================================================
# systemd User Service: Omarchy Desktop Session Watchdog
# Place at: ~/.config/systemd/user/omarchy-watchdog.service
# Enable: systemctl --user enable --now omarchy-watchdog.service
# ==============================================================================

[Unit]
Description=Omarchy Desktop Session Watchdog
After=graphical-session.target
PartOf=graphical-session.target

[Service]
Type=simple
ExecStart=/bin/bash -c '\
  while true; do \
    # Restart Quickshell if crashed
    if ! pgrep -x quickshell > /dev/null; then \
      quickshell & \
      notify-send "Omarchy" "Quickshell restarted automatically"; \
    fi; \
    # Check PipeWire
    if ! systemctl --user is-active --quiet pipewire; then \
      systemctl --user restart pipewire wireplumber; \
      notify-send "Omarchy" "PipeWire audio restarted"; \
    fi; \
    sleep 30; \
  done'
Restart=always
RestartSec=10

[Install]
WantedBy=graphical-session.target
```

---

## Package Management Automation

```bash
# ==============================================================================
# Omarchy Package Management Automation Scripts
# ==============================================================================

# Full system update with safety checks
omarchy_safe_update() {
    echo "╔══════════════════════════════════════╗"
    echo "║   Omarchy Safe System Update         ║"
    echo "╚══════════════════════════════════════╝"
    
    # Check for pacman lock
    if [ -f /var/lib/pacman/db.lck ]; then
        echo "[!] Pacman database locked. Another instance running?"
        echo "    Remove lock: sudo rm /var/lib/pacman/db.lck"
        return 1
    fi
    
    # Preview available updates
    echo "=== Available Updates ==="
    checkupdates 2>/dev/null || echo "No official repo updates"
    paru -Qua 2>/dev/null || echo "No AUR updates"
    
    # Prompt before proceeding
    read -rp "Proceed with update? [y/N] " confirm
    if [[ "${confirm}" =~ ^[Yy]$ ]]; then
        sudo pacman -Syu --noconfirm
        paru -Sua --noconfirm
        echo "[✓] System updated successfully"
    fi
}

# Cleanup orphaned packages
omarchy_cleanup() {
    echo "=== Orphaned Packages ==="
    ORPHANS=$(pacman -Qtdq 2>/dev/null)
    if [ -n "$ORPHANS" ]; then
        echo "$ORPHANS"
        read -rp "Remove orphaned packages? [y/N] " confirm
        if [[ "${confirm}" =~ ^[Yy]$ ]]; then
            sudo pacman -Rns $ORPHANS --noconfirm
        fi
    else
        echo "No orphaned packages found"
    fi
    
    # Clear pacman cache (keep last 2 versions)
    echo "=== Cache Cleanup ==="
    sudo paccache -rk2
    echo "[✓] Cleanup complete"
}

# Install development essentials
omarchy_dev_setup() {
    local DEV_PACKAGES=(
        "base-devel" "git" "mise" "nodejs" "npm" "python" "python-pip"
        "ruby" "go" "rust" "docker" "docker-compose"
    )
    echo "Installing development packages: ${DEV_PACKAGES[*]}"
    paru -S --needed --noconfirm "${DEV_PACKAGES[@]}"
    
    # Enable Docker
    sudo systemctl enable --now docker
    sudo usermod -aG docker "$USER"
    echo "[✓] Development environment ready (re-login for Docker group)"
}
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Hyprland IPC socket not found** | `$HYPRLAND_INSTANCE_SIGNATURE` not set or Hyprland not running. | 1. Verify: `echo $HYPRLAND_INSTANCE_SIGNATURE`.<br>2. Check socket: `ls /tmp/hypr/`.<br>3. Ensure running inside Hyprland session, not SSH or bare TTY. |
| **Neovim LSP server fails to start** | Language server not installed via mason.nvim or binary not in PATH. | 1. Open Neovim: `:Mason` to check installed servers.<br>2. Install: `:MasonInstall lua-language-server pyright typescript-language-server`.<br>3. Verify: `:LspInfo` for active clients. |
| **paru AUR build fails with GPG error** | Missing PGP key for package maintainer. | 1. Identify key: read error output for key ID.<br>2. Import: `gpg --recv-keys <KEY_ID>`.<br>3. Retry: `paru -S <package>`. |
| **Ghostty font rendering broken** | Missing Nerd Font or wrong font config. | 1. List fonts: `fc-list \| grep -i nerd`.<br>2. Install: `paru -S ttf-jetbrains-mono-nerd`.<br>3. Set in `~/.config/ghostty/config`: `font-family = JetBrainsMono Nerd Font`. |
| **mise version manager not activating** | Shell hook not sourced in .zshrc. | 1. Add to `~/.zshrc`: `eval "$(mise activate zsh)"`.<br>2. Reload: `source ~/.zshrc`.<br>3. Verify: `mise doctor`. |
| **Docker permission denied** | User not in docker group. | 1. Add: `sudo usermod -aG docker $USER`.<br>2. Re-login or: `newgrp docker`.<br>3. Test: `docker run hello-world`. |

---

## Essential File Locations

```
~/.config/hypr/hyprland.conf           # Compositor config
~/.config/quickshell/                   # Panel QML widgets
~/.config/ghostty/config                # Terminal config
~/.config/nvim/init.lua                 # Neovim entry
~/.config/nvim/lua/plugins/             # Neovim lazy.nvim plugin specs
~/.config/tmux/tmux.conf                # Tmux config
~/.config/rofi/config.rasi              # App launcher config
~/.config/starship.toml                 # Shell prompt
~/.config/omarchy/                      # Omarchy settings
~/.config/systemd/user/                 # User systemd services
~/.local/bin/                           # Custom scripts
/tmp/hypr/$HYPRLAND_INSTANCE_SIGNATURE/ # Hyprland IPC sockets
```

---

## Agent Operational Directive
> **MANDATORY**: When scripting Omarchy automation, always verify the Hyprland IPC socket exists before dispatching commands (`test -S "/tmp/hypr/${HYPRLAND_INSTANCE_SIGNATURE}/.socket.sock"`), use `set -euo pipefail` in all Bash scripts, parse `hyprctl` output with `-j` (JSON) flag piped through `jq` for reliable field extraction, and test scripts in a non-destructive mode before applying workspace or window changes.
