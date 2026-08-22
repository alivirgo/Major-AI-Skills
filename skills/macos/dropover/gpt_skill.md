---
title: "Dropover macOS Drag Shelf Utility AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Dropover, AppleScript automation, custom URL schemes, and macOS Shortcuts actions."
category: "Temporary Floating Drag Shelf Utility"
tags: ["dropover", "applescript", "url-scheme", "macos-shortcuts", "gpt-codex", "drag-drop-automation"]
---

# Dropover macOS Drag Shelf Utility AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Dropover provides automation capabilities through **macOS Shortcuts actions**, **AppleScript dispatch routines**, and a structured **Custom URL Scheme (`dropover://`)**. GPT/Codex acts as a Principal macOS Automation Architect and Swift Tool Developer, delivering **AppleScript file pipeline scripts**, **Shortcuts automation recipes**, **custom floating panel prototype code**, and **batch download ingestion tools**.

### Developer Architecture & Automation Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Dropover Developer Platform                 │
│                                                             │
│  Automation & Ingress Layer                                 │
│  ├── Custom URL Scheme API (`dropover://create-shelf?...`)  │
│  ├── macOS Shortcuts Actions (Add to Shelf, Get Shelf Items)│
│  └── AppleScript / JXA Integration Pipeline                 │
│                                                             │
│  AppKit Subsystem Implementation                            │
│  ├── `NSDraggingDestination` Protocol Handler               │
│  ├── `NSPasteboard.general` Ingress Parsing                 │
│  └── `NSWorkspace.shared.open(url)` IPC Bridge              │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Dropover URL Scheme Generation**: Author robust Python and Bash scripts generating syntactically valid `dropover://create-shelf?paths=...` requests with strict percent-encoding.
2. **AppleScript Automated Staging**: Write AppleScript (`osascript`) handlers to programmatically stage selected Finder items or Safari downloaded files into active shelves.
3. **AppKit Dragging Destination Prototypes**: Construct Swift AppKit prototypes demonstrating `NSView` / `NSWindow` implementation of `NSDraggingDestination` and `NSItemProvider`.
4. **macOS Shortcuts Workflow Integration**: Design automated Shortcuts recipes extracting URLs, screenshots, and text clippings and pushing them directly to Dropover.

---

## Production AppleScript Automation: Automated Finder Selection to Dropover Shelf

Save this script as `send_selection_to_dropover.scpt` and execute via `osascript send_selection_to_dropover.scpt`:

```applescript
-- =============================================================================
-- AppleScript: Send Selected Finder Items to Dropover Floating Shelf
-- Retrieves currently selected files in Finder and invokes Dropover URL Scheme.
-- =============================================================================
tell application "Finder"
    set selectedItems to selection
    if (count of selectedItems) is 0 then
        display alert "No files selected in Finder."
        return
    end if

    set pathList to {}
    repeat with itemRef in selectedItems
        set posixPath to POSIX path of (itemRef as alias)
        set end of pathList to posixPath
    end repeat
end tell

-- Construct URL Scheme Parameters
set urlQuery to ""
repeat with p in pathList
    set encodedPath to do shell script "python3 -c \"import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))\" " & quoted form of p
    if urlQuery is "" then
        set urlQuery to "paths=" & encodedPath
    else
        set urlQuery to urlQuery & "&paths=" & encodedPath
    end if
end repeat

set targetURL to "dropover://create-shelf?" & urlQuery

-- Trigger Dropover URL Scheme
do shell script "open " & quoted form of targetURL
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`open dropover://...` Throws Syntax Error in Terminal** | File path arguments contained unencoded spaces, ampersands, or Unicode characters. | Always percent-encode POSIX paths (`urllib.parse.quote(path)`) before building URL scheme. |
| **AppleScript Fails: `Finder got an error: User canceled`** | User had no active window open or no files highlighted when script executed. | Wrap Finder selection query in a defensive `try ... on error` block with user alert fallback. |
| **Shortcuts Action Returns `Permission Denied`** | Shortcuts app lacks permission to send events to Dropover in macOS Privacy settings. | In System Settings $\rightarrow$ *Privacy & Security $\rightarrow$ Automation*, ensure **Shortcuts** is allowed to control **Dropover**. |
| **Custom Swift Drag Destination Ignores File Drops** | Target `NSView` failed to register accepted drag types via `registerForDraggedTypes([.fileURL])`. | In Swift `viewDidLoad()`, call `registerForDraggedTypes([NSPasteboard.PasteboardType.fileURL])`. |

---

## Command Line Syntax & Batch Processing

```bash
# Execute AppleScript File Dispatcher
osascript C:\Scripts\send_selection_to_dropover.scpt

# Create Dropover Shelf with Specific Screenshots
python3 -c "import subprocess, urllib.parse, glob; paths = glob.glob('/Users/$USER/Desktop/*.png'); q = '&'.join(['paths=' + urllib.parse.quote(p) for p in paths]); subprocess.run(['open', 'dropover://create-shelf?' + q])"
```

### Essential File Locations
- **Dropover URL Scheme Handler**: `dropover://`
- **Application Bundle**: `/Applications/Dropover.app`

---

## Agent Operational Directive
> **MANDATORY**: When constructing `dropover://` URL queries in Python or Bash, percent-encode every individual file path (`urllib.parse.quote`) to prevent malformed URI errors during batch dispatch.
