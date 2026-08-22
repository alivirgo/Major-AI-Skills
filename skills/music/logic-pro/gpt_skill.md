---
title: "Apple Logic Pro 11 Music Production AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Logic Pro 11, Scripter MIDI FX JavaScript API, AppleScript dictionaries, and OSC controller mappings."
category: "Professional macOS Music Production"
tags: ["logic-pro", "scripter-api", "applescript-logic", "osc-control", "gpt-codex", "midi-fx-dev"]
---

# Apple Logic Pro 11 Music Production AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Logic Pro 11 provides deep scripting capabilities via the **Scripter MIDI FX JavaScript API**, the **macOS AppleScript Scripting Dictionary (`tell app "Logic Pro"`)**, and open **OSC (Open Sound Control) bridges**. GPT/Codex acts as a Principal Audio Software Engineer and Logic Pro Extensibility Architect, delivering **custom Scripter MIDI FX scripts**, **AppleScript workflow automations**, **automated stem bounce handlers**, and **OSC controller integrations**.

### Developer Architecture & Scripting Interface Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Logic Pro Developer Platform                │
│                                                             │
│  Scripter MIDI FX JavaScript Architecture                   │
│  ├── Event Hooks (`HandleMIDI`, `ProcessMIDI`, `Reset`)     │
│  ├── `PluginParameters` Array (Sliders, Menus, Checkboxes)  │
│  └── Real-Time Transport API (`GetTimingInfo()`)            │
│                                                             │
│  macOS Automation & Control Protocol Tier                   │
│  ├── AppleScript Scripting Dictionary (`Logic Pro.sdef`)    │
│  ├── OSC / TouchOSC Control Surface Protocol                │
│  └── Logic Remote iPad Pro Bidirectional Network Protocol   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Scripter JavaScript MIDI Engine Development**: Author advanced real-time MIDI processors (*e.g. polyphonic step sequencers, chord harmonizers, strummers, and microtonal micro-tuners*) for Logic Pro's Scripter plugin.
2. **AppleScript Workflow Automation**: Write AppleScript routines to automate project opening, track creation, and bounce-in-place operations.
3. **`GetTimingInfo()` Synchronization**: Implement tempo-synced LFOs and arpeggiators inside Scripter using `GetTimingInfo()` (bars, beats, tempo, time signature, playing state).
4. **Custom Key Command & Preference Scripting**: Script batch updates to Logic Pro's key commands and controller assignments plist files.

---

## Production JavaScript Code: Logic Pro Scripter Polyphonic Arpeggiator (`Scripter`)

Paste this script into Logic Pro's built-in **Scripter** MIDI FX plugin:

```javascript
// ==============================================================================
// Logic Pro 11 Scripter: Tempo-Synced Polyphonic Arpeggiator
// Reads active chord notes, sorts by pitch, and arpeggiates at 1/16th note rate.
// ==============================================================================
var NeedsTimingInfo = true;

var PluginParameters = [
    {
        name: "Rate",
        type: "menu",
        valueStrings: ["1/8", "1/16", "1/32"],
        defaultValue: 1
    },
    {
        name: "Octave Range",
        type: "linear",
        minValue: 1,
        maxValue: 3,
        numberOfSteps: 2,
        defaultValue: 1
    },
    {
        name: "Gate Length",
        type: "linear",
        minValue: 10,
        maxValue: 100,
        numberOfSteps: 90,
        defaultValue: 80,
        unit: "%"
    }
];

var heldNotes = [];
var currentStep = 0;
var lastBeat = -1;

function HandleMIDI(event) {
    if (event instanceof NoteOn) {
        heldNotes.push(event);
        heldNotes.sort(function(a, b) { return a.pitch - b.pitch; });
    } else if (event instanceof NoteOff) {
        heldNotes = heldNotes.filter(function(n) { return n.pitch !== event.pitch; });
    } else {
        event.send();
    }
}

function ProcessMIDI() {
    var info = GetTimingInfo();
    if (!info.playing || heldNotes.length === 0) {
        return;
    }

    // Rate division (1/16 = 0.25 beats)
    var stepSize = (GetParameter("Rate") === 0) ? 0.5 : (GetParameter("Rate") === 1) ? 0.25 : 0.125;
    var currentQuantizedBeat = Math.floor(info.blockStartBeat / stepSize) * stepSize;

    if (currentQuantizedBeat > lastBeat) {
        lastBeat = currentQuantizedBeat;

        // Select note from held chord
        var noteIndex = currentStep % heldNotes.length;
        var baseNote = heldNotes[noteIndex];

        var arpNote = new NoteOn(baseNote);
        arpNote.send();

        // Calculate Gate Duration in beats
        var gatePercent = GetParameter("Gate Length") / 100.0;
        var noteOff = new NoteOff(arpNote);
        noteOff.sendAfterBeats(stepSize * gatePercent);

        currentStep++;
    }
}

function Reset() {
    heldNotes = [];
    currentStep = 0;
    lastBeat = -1;
}
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`ReferenceError: GetTimingInfo is not defined`** | Script omitted mandatory global declaration `var NeedsTimingInfo = true;`. | Add `var NeedsTimingInfo = true;` at the top of the Scripter script. |
| **Scripter Generates Stuck Notes (No NoteOff)** | `sendAfterBeats()` or `sendAfterMilliseconds()` passed negative or invalid floating duration. | Ensure gate duration is positive and call `Reset()` to flush active note buffers. |
| **AppleScript Fails to Control Logic Pro UI** | macOS Accessibility permissions not granted to Terminal / Script Editor. | In macOS System Settings $\rightarrow$ Privacy & Security $\rightarrow$ **Accessibility**, enable Script Editor / Terminal. |
| **Scripter High CPU in `ProcessMIDI`** | Heavy memory allocations (`new Array()`) executed inside the real-time audio block callback. | Pre-allocate arrays globally outside `ProcessMIDI()`. |

---

## Command Line Syntax & Batch Processing

```bash
# Execute Logic Pro AppleScript via macOS osascript CLI
osascript -e 'tell application "Logic Pro" to play'

# Stop Logic Pro Playback
osascript -e 'tell application "Logic Pro" to stop'
```

### Essential File Locations
- **Scripter Presets**: `~/Music/Audio Music Apps/Plug-In Settings/Scripter/`
- **Logic Key Commands**: `~/Music/Audio Music Apps/Key Commands/`

---

## Agent Operational Directive
> **MANDATORY**: When developing Scripter JavaScript plugins that rely on playback tempo or bar position, always declare `var NeedsTimingInfo = true;` at the top level of the script.
