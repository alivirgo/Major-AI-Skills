---
title: "Cadence Virtuoso IC Design AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Cadence Virtuoso, SKILL programming, OCEAN batch simulation scripts, and OpenAccess (OA) database automation."
category: "Analog & Mixed-Signal IC Design"
tags: ["cadence-virtuoso", "cadence-skill", "ocean-scripting", "gpt-codex", "openaccess", "ic-automation"]
---

# Cadence Virtuoso IC Design AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Cadence Virtuoso provides an extensive, programmatic Lisp-dialect scripting runtime (**Cadence SKILL**) and the **OCEAN** simulation harness, interacting directly with the OpenAccess (OA) database. GPT/Codex acts as a Principal IC Design Automation Developer and EDA Tool Architect, delivering **custom SKILL layout generator functions**, **automated testbench & OCEAN sweep scripts**, **PDK techfile automation**, and **headless CLI batch verification pipelines**.

### SKILL API Architecture & Database Model

```
┌─────────────────────────────────────────────────────────────┐
│                 Cadence SKILL API Platform                  │
│                                                             │
│  OpenAccess (OA) Database Access                            │
│  ├── `dbOpenCellViewByType` (Open / Create Schematics/Layout│
│  ├── `dbCreateRect`, `dbCreatePath`, `dbCreateInst`         │
│  └── `dbSave`, `dbClose`, `dbPurge` Lifecycle Handlers      │
│                                                             │
│  Simulation & Automation Framework                          │
│  ├── OCEAN Engine (`simulator`, `analysis`, `run`, `desVar`)│
│  ├── SKILL IDE & Debugger (`sstatus`, `pp`, `trace`)        │
│  └── Automated Netlisting (`nlGenerateNetlist`)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Procedural Layout Generation in SKILL**: Author clean, parameterized SKILL procedures to instantiate transistors, route inter-digitized common-centroid differential pairs, and place guard ring diffusions.
2. **Batch OCEAN Simulation Scripting**: Generate headless OCEAN automation scripts that iterate across temperature steps, supply voltage rails, and Monte Carlo statistical distributions.
3. **Netlisting & PDK Automation**: Programmatically generate Spectre netlists (`.scs`) from OpenAccess schematic cellviews without GUI interaction.
4. **PDK Technology File Verification**: Validate layer definitions, via rules (`stdVia`), and design grid resolution against foundry design manuals.

---

## Production Cadence SKILL Automation: Procedural Guard Ring Layout Generator

Save this script as `create_guard_ring.il` and load inside the Cadence Virtuoso CIW (Command Interpreter Window):

```lisp
;; ==============================================================================
;; Cadence SKILL Procedure: Procedural Substrate Guard Ring Generator
;; Generates a rectangular P-Tap / N-Tap guard ring around target bounding box.
;; ==============================================================================

procedure( CreateGuardRing( cvId bBox tapLayer contLayer metLayer tapWidth )
  let( (llX llY urX urY ringLL ringUR contSpacing contSize numContX numContY)
    
    llX = xCoord(lowerLeft(bBox)) - tapWidth
    llY = yCoord(lowerLeft(bBox)) - tapWidth
    urX = xCoord(upperRight(bBox)) + tapWidth
    urY = yCoord(upperRight(bBox)) + tapWidth

    printf("Generating Guard Ring: [%.3f, %.3f] to [%.3f, %.3f]\n" llX llY urX urY)

    ;; 1. Create Outer Diffusion / Tap Rectangles
    ;; Top Bar
    dbCreateRect(cvId tapLayer list(list(llX urY - tapWidth) list(urX urY)))
    ;; Bottom Bar
    dbCreateRect(cvId tapLayer list(list(llX llY) list(urX llY + tapWidth)))
    ;; Left Bar
    dbCreateRect(cvId tapLayer list(list(llX llY + tapWidth) list(llX + tapWidth urY - tapWidth)))
    ;; Right Bar
    dbCreateRect(cvId tapLayer list(list(urX - tapWidth llY + tapWidth) list(urX urY - tapWidth)))

    ;; 2. Create Metal1 Overlap Rectangles
    dbCreateRect(cvId metLayer list(list(llX urY - tapWidth) list(urX urY)))
    dbCreateRect(cvId metLayer list(list(llX llY) list(urX llY + tapWidth)))
    dbCreateRect(cvId metLayer list(list(llX llY + tapWidth) list(llX + tapWidth urY - tapWidth)))
    dbCreateRect(cvId metLayer list(list(urX - tapWidth llY + tapWidth) list(urX urY - tapWidth)))

    ;; 3. Insert Uniform Substrate Contacts (Vias)
    contSize = 0.22
    contSpacing = 0.28
    
    ;; Simple contact fill along bottom bar
    for(x 0 floor((urX - llX - tapWidth) / (contSize + contSpacing))
      let( (cx cy)
        cx = llX + (tapWidth - contSize)/2.0 + x * (contSize + contSpacing)
        cy = llY + (tapWidth - contSize)/2.0
        dbCreateRect(cvId contLayer list(list(cx cy) list(cx + contSize cy + contSize)))
      )
    )

    dbSave(cvId)
    printf("Guard ring generation completed successfully.\n")
    t
  )
)

;; Example Execution in CIW:
;; cv = dbOpenCellViewByType("MyLib" "MyCell" "layout" "maskLayout" "a")
;; CreateGuardRing(cv list(list(0.0 0.0) list(10.0 10.0)) "DIFF" "CONT" "METAL1" 1.0)
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`*Error* eval: unbound variable` in SKILL Script** | Variable used inside procedure without declaration in local `let` binding list or missing quote `'` on symbol. | 1. Always declare local variables inside `let( (var1 var2 ...) ... )`.<br>2. Quote symbols when passing names (e.g. `'spectre` or `'ac`). |
| **`dbCreateRect` Fails: `Invalid Layer-Purpose Pair`** | The specified layer name is not defined in the active technology file or spelled incorrectly. | 1. Check technology file using `techGetTechFile(cvId)`.<br>2. Verify layer name against `display.drf`. |
| **OCEAN Script Error: `design() failed: netlist not found`** | Netlist was not generated before running OCEAN batch mode, or path is incorrect. | 1. Open schematic cellview and generate netlist in ADE.<br>2. Or use SKILL command `nlGenerateNetlist()` to generate headless netlists. |
| **CIW Freezes during Recursive SKILL Tree Traversal** | Infinite loop in hierarchical cellview traversal without circular reference detection. | Track visited cellviews in an association table (`makeTable("visited" nil)`). |

---

## Command Line Syntax & Batch Execution

```bash
# Execute SKILL File from Linux Command Line via Virtuoso Headless Mode
virtuoso -nograph -replay ~/scripts/create_guard_ring.il

# Run Batch Monte Carlo Simulation with Multi-Threading
spectre +mt=16 -raw ./mc_results input.scs
```

### Essential File Locations
- **SKILL Startup Script**: `~/.cdsinit`
- **CIW Log File**: `~/CDS.log`

---

## Agent Operational Directive
> **MANDATORY**: In Cadence SKILL procedures, always scope local variables within `let()` blocks to prevent namespace pollution in the Virtuoso CIW. Validate Layer-Purpose Pairs (LPP) against active PDK technology files.
