---
title: "RPG Maker MZ/MV Game Development AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot RPG Maker Event Editor pages, Database Damage Formulas, and Tilemap passability."
category: "RPG Game Development & Event Scripting"
tags: ["rpg-maker", "event-editor", "damage-formulas", "gemini", "tilemap-passability", "rpgmaker-mz"]
---

# RPG Maker MZ/MV Game Development AI Skill Guide (Gemini)

## Overview & Engine Architecture
RPG Maker MZ/MV empowers indie developers to design expansive 2D JRPGs through visual tile-based map editing, event-driven dialogue triggers, and mathematical database damage formulas. Gemini acts as an AI JRPG Game Designer and Event Scripting Specialist, specializing in **multimodal Event Editor state page triage**, **Database Damage Formula optimization**, **Tilemap collision/passability grid validation (O/X/Star flags)**, and **UI Window layout customization**.

### Visual Analytics & Event Scripting Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 RPG Maker Visual Workflow                   │
│                                                             │
│  Map & Collision Authoring                                  │
│  ├── 2D Tilemap Editor (Layer 1-4, Parallax, Shadow Pen)    │
│  ├── Passability Matrix Flags (Circle 'O', Cross 'X', Star) │
│  └── Region ID Painting (Dynamic Encounter & Spawn Zones)   │
│                                                             │
│  Eventing & Database System                                 │
│  ├── Multi-Page Event Editor (Self Switches, Triggers)      │
│  ├── Damage Formula Calculator (`a.atk * 4 - b.def * 2`)    │
│  └── Troop Battle Event Pages (Turn Triggers, HP% Checks)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Event Page Triage**: Analyze screenshots of the Event Editor dialog to identify trigger misconfigurations (*Action Button vs Player Touch vs Autorun vs Parallel*), missing Self Switch transitions, and unclosed conditional branches.
2. **Database Damage Formula Balancing**: Formulate and balance mathematical damage formulas (`a.atk * 4 - b.def * 2`, `b.isStateAffected(10) ? a.mat * 6 : a.mat * 3`), ensuring defense stat scaling without zero-damage flatlines.
3. **TileSet Passability & Collision Debugging**: Audit TileSet collision settings, diagnosing 4-direction passability blocks and Star (`*`) roof layering bugs.
4. **Troop Event Battle Phasing**: Construct phase-triggered battle events (e.g. boss dialogue at $50\%$ HP, phase transformations, summon mechanics).

---

## Production Python Automation: Automated RPG Maker Database Balance Auditor

Run this standalone script on an RPG Maker project's `data/` folder to analyze and plot weapon damage curves and enemy HP balances:

```python
"""
RPG Maker MZ/MV Database Balance Auditor
Parses JSON database files (Enemies.json, Items.json, Skills.json) to audit stat curves.
"""

import sys
import os
import json

def audit_rpgmaker_database(project_dir: str):
    data_dir = os.path.join(project_dir, "data")
    if not os.path.exists(data_dir):
        print(f"Error: Data directory '{data_dir}' not found.")
        return

    enemies_file = os.path.join(data_dir, "Enemies.json")
    skills_file = os.path.join(data_dir, "Skills.json")

    print(f"--- [AUDITING RPG MAKER DATABASE: {project_dir}] ---\n")

    # 1. Audit Enemy Stats
    if os.path.exists(enemies_file):
        with open(enemies_file, "r", encoding="utf-8") as f:
            enemies = json.load(f)
            print("[1] Enemy Stat Progression:")
            for enemy in enemies:
                if enemy:
                    eid = enemy.get("id")
                    name = enemy.get("name")
                    params = enemy.get("params", []) # [MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK]
                    if len(params) >= 8:
                        print(f"  • #{eid:>3} {name:<18} | HP: {params[0]:>6} | ATK: {params[2]:>4} | DEF: {params[3]:>4} | EXP: {enemy.get('exp'):>5}")

    # 2. Audit Skill Damage Formulas
    if os.path.exists(skills_file):
        with open(skills_file, "r", encoding="utf-8") as f:
            skills = json.load(f)
            print("\n[2] Skill Damage Formulas:")
            for skill in skills:
                if skill:
                    sid = skill.get("id")
                    sname = skill.get("name")
                    dmg = skill.get("damage", {})
                    formula = dmg.get("formula", "")
                    if formula:
                        print(f"  • #{sid:>3} {sname:<18} | Formula: '{formula}'")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python audit_rpg_db.py <Project_Root>")
        sys.exit(1)
    audit_rpgmaker_database(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Damage Formula Always Deals 0 Damage** | Target defense ($b.def \times 2$) is higher than attacker power ($a.atk \times 4$), or formula typo caused NaN. | 1. In Database $\rightarrow$ Skills, modify formula to guarantee minimum damage: `Math.max(1, a.atk * 4 - b.def * 2)`.<br>2. Ensure custom JavaScript within formulas returns a number. |
| **Player Walks Through Solid Walls on Map** | TileSet passability flag set to Circle (`O`) or Star (`*`) on the upper layer. | In Database $\rightarrow$ **Tilesets**, check passability grid: set wall tiles to **Cross (`X`)** and canopy/roof tiles to **Star (`*`)**. |
| **Boss Health Bar UI Freezes on Zero** | Custom plugin conflict with `Window_BattleStatus` or battle event loop executing every frame. | In Troop events, change event condition frequency from `Moment` to **`Turn`** or **`Battle`**. |
| **Parallax Background Moves Too Fast / Stutters** | Parallax image dimensions do not match the map tile width/height ratio. | Ensure parallax image width equals Map Width $\times 48\text{px}$ and prefix filename with `!` to lock scrolling. |

---

## Command Line Syntax & Server Control

```bash
# Launch Game Directly into Specific Map via NW.js CLI
nw.exe . --test --map=1

# Query Project System Configuration via JSON Tooling
jq .gameTitle data/System.json
```

### Key Configuration Locations
- **Database Directory**: `<ProjectRoot>/data/*.json`
- **System Config**: `data/System.json`

---

## Agent Operational Directive
> **MANDATORY**: In RPG Maker damage formulas, wrap evaluations with `Math.max(1, ...)` to avoid negative or zero damage calculation anomalies. Ensure Troop battle event pages are set to Span: `Battle` or `Turn` rather than `Moment` to prevent frame locks.
