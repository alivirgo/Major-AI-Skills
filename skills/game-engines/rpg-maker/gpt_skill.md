---
title: "RPG Maker MZ/MV Game Development AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize RPG Maker MZ/MV, JavaScript plugin development, Window/Scene UI extensions, and JSON database automation."
category: "RPG Game Development & Event Scripting"
tags: ["rpg-maker", "javascript-plugins", "rpgmaker-mz", "gpt-codex", "window-base", "gamedev-automation"]
---

# RPG Maker MZ/MV Game Development AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
RPG Maker MZ and MV feature a modular object-oriented JavaScript engine enabling complete customization of scenes, windows, battle formulas, and entity managers. GPT/Codex acts as a Principal RPG Maker Systems Developer and JavaScript Plugin Architect, delivering **custom `Window_Base` / `Scene_MenuBase` UI extensions**, **complex combat mechanics**, **programmatic JSON database generators**, and **automated asset deployment scripts**.

### Developer Architecture & Plugin Runtime Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 RPG Maker Developer Platform                │
│                                                             │
│  Scene & Window Presentation Hierarchy                      │
│  ├── `Scene_Base` $\rightarrow$ `Scene_MenuBase` (Custom UI)│
│  ├── `Window_Base` $\rightarrow$ `Window_Selectable` (Lists)│
│  └── `Sprite_Base` $\rightarrow$ `Sprite_Battler` (Graphics)│
│                                                             │
│  Core Logic & State Management                              │
│  ├── `BattleManager` & `Scene_Battle` (Turn Phase Execution)│
│  ├── `Game_Action` & `Game_Battler` (Combat Damage & States)│
│  └── `DataManager` (JSON Database Ingestion & Serialization)│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Custom Window & Scene Development**: Author clean JavaScript classes inheriting from `Window_Selectable` and `Scene_MenuBase` with responsive coordinate calculations (`Rectangle`) and touch input handling.
2. **Combat Formula & State Effect Scripting**: Override `Game_Action.prototype.evalDamageFormula` and `Game_BattlerBase.prototype.paySkillCost` to implement custom resource bars (TP/Fury/Stamina).
3. **Programmatic JSON Database Ingestion**: Build Python/Node.js scripts to generate or patch `Armors.json`, `Weapons.json`, and `MapInfos.json` programmatically.
4. **Plugin Command Registration**: Build structured MZ Plugin Commands using `PluginManager.registerCommand()` with strongly typed schema arguments.

---

## Production JavaScript Plugin: Custom HUD & Party Status Window

Save this file as `js/plugins/CustomPartyHUD.js` and activate in `js/plugins.js`:

```javascript
// ==============================================================================
// RPG Maker MZ Plugin: Custom Lightweight Party HUD Window
// Displays active party member portraits, HP, and MP bars on the map screen.
// ==============================================================================
/*:
 * @target MZ
 * @plugindesc v1.0.0 Adds a custom real-time Party HUD to the Map Screen.
 * @author AI Systems Engineering
 */

(() => {
  'use strict';

  // 1. Define Custom Window
  class Window_PartyHUD extends Window_Base {
    constructor(rect) {
      super(rect);
      this.opacity = 200;
      this.refresh();
    }

    refresh() {
      this.contents.clear();
      const leader = $gameParty.leader();
      if (!leader) return;

      const lineHeight = this.lineHeight();
      
      // Draw Leader Name and HP/MP Status
      this.changeTextColor(ColorManager.systemColor());
      this.drawText(leader.name(), 10, 0, 160, 'left');
      
      this.changeTextColor(ColorManager.normalColor());
      this.drawText(`HP: ${leader.hp} / ${leader.mhp}`, 10, lineHeight, 160, 'left');
      this.drawText(`MP: ${leader.mp} / ${leader.mmp}`, 10, lineHeight * 2, 160, 'left');
    }

    update() {
      super.update();
      if (Graphics.frameCount % 15 === 0) {
        this.refresh();
      }
    }
  }

  // 2. Inject Window into Scene_Map
  const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
  Scene_Map.prototype.createAllWindows = function() {
    _Scene_Map_createAllWindows.call(this);
    this.createPartyHUD();
  };

  Scene_Map.prototype.createPartyHUD = function() {
    const rect = new Rectangle(20, 20, 200, 130);
    this._partyHudWindow = new Window_PartyHUD(rect);
    this.addWindow(this._partyHudWindow);
  };
})();
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`TypeError: this.drawText is not a function`** | Attempting to invoke drawing methods on `Window_Base` before `this.contents` bitmap is initialized. | Ensure drawing methods are called inside or after `Window_Base.prototype.initialize` / `refresh()`. |
| **Custom Window Not Visible on Map Screen** | Window was instantiated with `new Window_Custom(rect)` but never added via `this.addWindow(window)`. | In `Scene_Map.prototype.createAllWindows`, invoke `this.addWindow(this._myCustomWindow)`. |
| **`Maximum call stack size exceeded` in Plugin Override** | Recursive alias loop created by re-aliasing a method multiple times or omitting the alias call. | Use unique local `const _alias = ...` names wrapped in an immediately invoked function expression (IIFE). |
| **Plugin Parameter Returns String Instead of Number** | `PluginManager.parameters()` returns raw JSON string values for all declared arguments. | Wrap numeric arguments with `Number(params['myParam'])` or `JSON.parse()`. |

---

## Command Line Syntax & Batch Processing

```bash
# Validate All Project JSON Files via Node.js CLI
node -e "const fs=require('fs'); fs.readdirSync('data').filter(f=>f.endsWith('.json')).forEach(f=>JSON.parse(fs.readFileSync('data/'+f))); console.log('All JSON files valid!');"

# Launch Game in Browser without NW.js Desktop Wrapper
npx serve .
```

### Essential File Locations
- **Core Library Headers**: `js/rmmz_core.js`
- **Plugin Manifest File**: `js/plugins.js`
- **Map Event Data**: `data/Map001.json`

---

## Agent Operational Directive
> **MANDATORY**: Encapsulate all JavaScript plugins inside an IIFE (`(() => { 'use strict'; ... })();`) to avoid polluting the global namespace. Always parse `PluginManager.parameters` strings into typed numbers or booleans.
