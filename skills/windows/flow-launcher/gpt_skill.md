---
title: "Flow Launcher Extensible Productivity AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Flow Launcher, C# Plugin API (IPlugin), Python JSON-RPC frameworks, and automated plugin deployments."
category: "Productivity Application & File Launcher"
tags: ["flow-launcher", "csharp-iplugin", "flow-plugin-dev", "jsonrpc-protocol", "gpt-codex", "windows-productivity-dev"]
---

# Flow Launcher Extensible Productivity AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Flow Launcher provides a powerful extensibility framework for developers through the **Native C# Plugin API (`Flow.Launcher.Plugin.IPlugin`)** and the **Out-of-Process JSON-RPC Engine (Python, Node.js, C++)**. GPT/Codex acts as a Principal Windows Software Engineer and Flow Launcher Plugin Developer, delivering **high-performance compiled C# plugins**, **modular Python JSON-RPC adapters**, **context menu action extensions (`IContextMenu`)**, and **automated plugin packaging pipelines**.

### Developer Architecture & Plugin API Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Flow Launcher Developer Platform            │
│                                                             │
│  Native C# .NET In-Process API (`Flow.Launcher.Plugin`)     │
│  ├── `IPlugin` Interface (`Init(PluginInitContext)`, `Query`)│
│  ├── `IContextMenu` Interface (`LoadContextMenus(Result)`)  │
│  └── `Result` Model (`Title`, `SubTitle`, `Action`, `Icon`) │
│                                                             │
│  JSON-RPC Standard I/O Subsystem                            │
│  ├── Python / Node.js Process Spawner (stdin/stdout Pipes)  │
│  ├── JSON Request/Response Serialization Engine             │
│  └── `JsonRPCAction` Dynamic Callback Dispatcher            │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Native C# Plugin Development**: Author compiled C# plugins implementing `IPlugin` and `IAsyncPlugin` targeting .NET 8, executing non-blocking asynchronous queries with zero memory allocations.
2. **Python JSON-RPC Adapter Engineering**: Construct clean Python plugin wrappers handling the JSON-RPC lifecycle, parsing `query` parameters, and emitting `Result` JSON objects.
3. **Context Menu Actions & Settings Integration**: Implement `IContextMenu` to provide secondary actions (*e.g. Copy to Clipboard, Open Containing Folder, Execute as Administrator*).
4. **Automated Plugin Packaging**: Script automated build routines producing compliant `.zip` release packages containing `plugin.json`, compiled binaries/scripts, and assets.

---

## Production C# Code: High-Performance Flow Launcher Native C# Plugin (`IPlugin`)

Save this file as `Main.cs` in a C# Class Library project referencing `Flow.Launcher.Plugin.dll`:

```csharp
// ==============================================================================
// Flow Launcher Native C# Plugin: GitHub Repository Quick-Search
// Implements IPlugin and IContextMenu for instant search result rendering.
// ==============================================================================
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Windows;
using Flow.Launcher.Plugin;

namespace Flow.Launcher.Plugin.GitHubQuickSearch {
    public class Main : IPlugin, IContextMenu {
        private PluginInitContext _context;

        public void Init(PluginInitContext context) {
            _context = context;
        }

        public List<Result> Query(Query query) {
            var results = new List<Result>();
            string searchTerm = query.Search.Trim();

            if (string.IsNullOrEmpty(searchTerm)) {
                results.Add(new Result {
                    Title = "Search GitHub Repositories",
                    SubTitle = "Type your query (e.g. 'gh flow launcher')",
                    IcoPath = "Images\\github.png",
                    Action = _ => {
                        Process.Start(new ProcessStartInfo("https://github.com") { UseShellExecute = true });
                        return true;
                    }
                });
                return results;
            }

            // Generate GitHub Search Action
            string targetUrl = $"https://github.com/search?q={Uri.EscapeDataString(searchTerm)}";
            results.Add(new Result {
                Title = $"Search GitHub for '{searchTerm}'",
                SubTitle = $"Open in default browser: {targetUrl}",
                IcoPath = "Images\\github.png",
                Action = _ => {
                    Process.Start(new ProcessStartInfo(targetUrl) { UseShellExecute = true });
                    return true;
                }
            });

            return results;
        }

        public List<Result> LoadContextMenus(Result selectedResult) {
            var contextMenus = new List<Result>();

            contextMenus.Add(new Result {
                Title = "Copy Search URL to Clipboard",
                SubTitle = "Copies the full GitHub query URL to Windows clipboard",
                IcoPath = "Images\\copy.png",
                Action = _ => {
                    Clipboard.SetText(selectedResult.SubTitle.Replace("Open in default browser: ", ""));
                    _context.API.ShowMsg("Copied!", "GitHub Search URL copied to clipboard.");
                    return true;
                }
            });

            return contextMenus;
        }
    }
}
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`JsonReaderException` on Plugin Execution** | Python plugin emitted debug `print()` statements to stdout, corrupting the JSON-RPC stream. | Redirect debug logs to `sys.stderr` or a log file: `print("debug", file=sys.stderr)`. |
| **C# Plugin Fails with `BadImageFormatException`** | Plugin compiled for wrong architecture (e.g. x86 instead of x64 / AnyCPU). | Configure build target to `x64` or `AnyCPU` targeting .NET 8.0 Windows Desktop. |
| **`plugin.json` Validation Error: `Missing ID`** | Manifest missing a valid unique GUID in the `"ID"` field. | Generate a new GUID (`[guid]::NewGuid()`) and populate the `"ID"` property. |
| **Action Keyword Not Triggering Plugin** | `"ActionKeyword"` in `plugin.json` conflicts with another plugin or was overridden in user settings. | In Flow Settings $\rightarrow$ Plugins, verify the Action Keyword matches the expected trigger. |

---

## Command Line Syntax & Batch Processing

```bash
# Test Flow Launcher Plugin via Command Line Query
"%LOCALAPPDATA%\FlowLauncher\Flow.Launcher.exe" --query "gh react"

# Package Plugin Directory into .zip Release
powershell -Command "Compress-Archive -Path '.\SystemDiagnostics\*' -DestinationPath '.\SystemDiagnostics.zip' -Force"
```

### Essential File Locations
- **Plugin SDK NuGet**: `Flow.Launcher.Plugin`
- **Installed Plugins**: `%APPDATA%\FlowLauncher\Plugins\`

---

## Agent Operational Directive
> **MANDATORY**: In Flow Launcher Python plugins, never output raw debug text to `stdout`. All logging must be redirected to `sys.stderr` to prevent JSON-RPC serialization corruption.
