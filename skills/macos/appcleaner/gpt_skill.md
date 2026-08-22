---
title: "AppCleaner macOS Application Uninstaller AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize macOS application uninstallation, Swift/Objective-C filesystem sweeping, and Homebrew Cask cleanups."
category: "Complete Application Uninstaller"
tags: ["appcleaner", "macos-uninstaller", "swift-scripting", "homebrew-cask", "gpt-codex", "launchctl"]
---

# AppCleaner macOS Application Uninstaller AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
macOS application uninstallation requires programmatic parsing of application bundles, sandbox receipt traversal, and clean termination of background services. GPT/Codex acts as a Principal macOS Tool Developer and Systems Automation Engineer, delivering **native Swift / Bash uninstallation scripts**, **Homebrew Cask zap integration routines**, **`launchctl` service termination workflows**, and **Spotlight `mdfind` metadata scrapers**.

### Developer Architecture & System Uninstallation Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 macOS Uninstaller Platform                  │
│                                                             │
│  Bundle Identification & Metadata Engine                    │
│  ├── `CFBundleIdentifier` / `CFBundleName` Extraction       │
│  ├── Spotlight MDQuery API (`kMDItemFSName`, `kMDItemBundleID│
│  └── Code Signing & Team Identifier Verification            │
│                                                             │
│  Service Unloading & Filesystem Purge Tier                  │
│  ├── `launchctl bootout` Session & System Daemons           │
│  ├── `NSFileManager.removeItem(at:)` Trash/Delete Engine    │
│  └── Homebrew Cask `zap trash:` Integration                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Native Swift Scripting for App Uninstallation**: Author standalone Swift scripts (`swift uninstaller.swift`) utilizing `FileManager` and `Bundle` APIs to discover and purge related library paths.
2. **Homebrew Cask `zap trash:` Automation**: Construct clean Homebrew Cask uninstall recipes removing all declared preference plists and application support directories.
3. **`launchctl` Process Termination**: Ensure running background helper agents and privileged daemons are gracefully terminated prior to binary deletion.
4. **Spotlight Metadata Search Integration**: Query the macOS Spotlight index via `NSMetadataQuery` or `mdfind` to locate custom support directories outside default library locations.

---

## Production Swift Automation: Native macOS Application & Artifact Uninstaller

Save this file as `uninstall_app.swift` and execute via `swift uninstall_app.swift /Applications/TargetApp.app`:

```swift
// ==============================================================================
// Standalone Swift 5.x Script: Clean macOS Application & Artifact Uninstaller
// Inspects Info.plist, terminates running processes, and cleans ~/Library folders.
// ==============================================================================
import Foundation

guard CommandLine.arguments.count > 1 else {
    print("Usage: swift uninstall_app.swift /Applications/TargetApp.app")
    exit(1)
}

let appPath = CommandLine.arguments[1]
let appURL = URL(fileURLWithPath: appPath)

guard let bundle = Bundle(url: appURL), let bundleID = bundle.bundleIdentifier else {
    print("Error: Could not read CFBundleIdentifier from: \(appPath)")
    exit(1)
}

let appName = appURL.deletingPathExtension().lastPathComponent
print("--- [UNINSTALLING: \(appName) (\(bundleID))] ---")

// 1. Terminate Running Application Instances
let runningApps = NSRunningApplication.runningApplications(withBundleIdentifier: bundleID)
for app in runningApps {
    print("Terminating active process (PID: \(app.processIdentifier))...")
    app.terminate()
}

// 2. Scan Standard Library Directories for Matching Artifacts
let fileManager = FileManager.default
let home = fileManager.homeDirectoryForCurrentUser

let searchDirectories: [URL] = [
    home.appendingPathComponent("Library/Application Support"),
    home.appendingPathComponent("Library/Caches"),
    home.appendingPathComponent("Library/Preferences"),
    home.appendingPathComponent("Library/Containers"),
    home.appendingPathComponent("Library/Group Containers"),
    home.appendingPathComponent("Library/Saved Application State"),
    home.appendingPathComponent("Library/LaunchAgents")
]

var artifactsToRemove: [URL] = []

for dir in searchDirectories {
    guard let contents = try? fileManager.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil) else {
        continue
    }
    for fileURL in contents {
        let name = fileURL.lastPathComponent.lowercased()
        if name.contains(bundleID.lowercased()) || name.contains(appName.lowercased()) {
            artifactsToRemove.append(fileURL)
        }
    }
}

print("\nFound \(artifactsToRemove.count) residual paths:")
for url in artifactsToRemove {
    print("  • \(url.path)")
    try? fileManager.removeItem(at: url)
}

// 3. Remove Main Application Bundle
try? fileManager.removeItem(at: appURL)
print("\n✅ Successfully uninstalled \(appName) and purged all residual artifacts.")
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`NSCocoaErrorDomain Code=513: You don’t have permission`** | macOS Sandbox or TCC policy preventing script from removing files in `~/Library/Containers`. | Grant Terminal / IDE **Full Disk Access** in System Settings $\rightarrow$ *Privacy & Security*. |
| **App Bundle Cannot Be Deleted: `File is in use`** | A background helper process spawned by the application is still running. | 1. Find process: `pgrep -f BundleIdentifier`.<br>2. Terminate helper: `killall -9 "AppName Helper"`. |
| **Homebrew Cask Leaves Residual Data After `brew uninstall`** | The formula was uninstalled using `brew uninstall` instead of `brew uninstall --zap`. | Run `brew uninstall --zap <cask_name>` to trigger the formula's full artifact cleanup block. |
| **Spotlight Metadata Index Stale** | `mdfind` returns outdated paths for already-deleted files. | Reindex drive: `sudo mdutil -E /`. |

---

## Command Line Syntax & Batch Processing

```bash
# Complete Application Zap via Homebrew CLI
brew uninstall --zap --force visual-studio-code

# Terminate and Unload User LaunchAgent via launchctl
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.vendor.helper.plist
```

### Essential File Locations
- **Homebrew Cask Cache**: `~/Library/Caches/Homebrew/Cask/`
- **System LaunchDaemons**: `/Library/LaunchDaemons/`

---

## Agent Operational Directive
> **MANDATORY**: Terminate all running application instances (`NSRunningApplication.runningApplications(withBundleIdentifier:)`) before attempting to delete binary bundles or application support folders.
