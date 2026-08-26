---
title: "CryEngine AAA Real-Time Engine AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize CryEngine C++ plugins, Schematyc signals, Resource Compiler (rc.exe) asset pipelines, and CMake builds."
category: "AAA Game Engine & Real-Time Rendering"
tags: ["cryengine", "cpp-game-plugin", "schematyc-nodes", "gpt-codex", "resource-compiler", "cmake-cryengine"]
---

# CryEngine AAA Real-Time Engine AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
CryEngine provides an extensible C++ Plugin Architecture, the **Schematyc Visual Component System**, and an automated asset pipeline powered by the **CryEngine Resource Compiler (`rc.exe`)**. GPT/Codex acts as a Principal Game Engine Developer and Build Systems Engineer, delivering **custom C++ Game Plugins**, **Schematyc custom action nodes**, **automated asset compilation scripts (`rc.exe`)**, and **CMake project build configurations**.

### Developer Architecture & C++ Plugin Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 CryEngine Developer Platform                │
│                                                             │
│  C++ Game Framework & Plugins                               │
│  ├── `ICryPlugin` (Engine Plugin Lifecycle: Init, Update)   │
│  ├── CryEntity Component Reflection (`IEntityComponent`)    │
│  └── Schematyc Custom Elements (`EnvElement`, `EnvAction`)  │
│                                                             │
│  Asset & Build Toolchain                                    │
│  ├── CryEngine Resource Compiler (`rc.exe` Mesh/Texture)    │
│  ├── CMake Meta-Build Generator (`cry_cmake.exe`)           │
│  └── Dynamic C++ Hot-Reload System                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **C++ Plugin & Entity Component Development**: Author clean, type-safe C++ plugins implementing `ICryPlugin` and register custom components into the CryEngine reflection registry.
2. **Schematyc Custom Action Node Authoring**: Develop modular visual scripting nodes in C++ implementing `Schematyc::IAction` for designers to trigger gameplay events.
3. **Automated Resource Compiler (`rc.exe`) Scripting**: Author batch processing scripts to convert FBX meshes into `.cgf` geometry and TIF images into CryEngine `.dds` texture formats.
4. **CMake Project Generation**: Configure `CMakeLists.txt` for CryEngine games and tools, resolving SDK paths and compiler toolsets (MSVC v143 / Clang).

---

## Production C++ Automation: Custom Schematyc Gameplay Action Node

Save this file as `SchematycSpawnEntityAction.cpp` within your CryEngine C++ Game Plugin:

```cpp
// ==============================================================================
// CryEngine Schematyc Custom Action Node: Spawn Dynamic Entity
// Allows visual scripting graphs to instantiate physical entities at runtime.
// ==============================================================================
#include <CrySchematyc/Action.h>
#include <CrySchematyc/Env/IEnvRegistrar.h>
#include <CryEntitySystem/IEntitySystem.h>

struct SSpawnEntityParams
{
    Schematyc::CSharedString entityClass = "DefaultEntity";
    Vec3 spawnPosition = Vec3(0, 0, 0);

    static void ReflectType(Schematyc::CTypeDesc<SSpawnEntityParams>& desc)
    {
        desc.SetGUID("B1A2C3D4-E5F6-7890-1234-567890ABCDEF"_cry_guid);
        desc.SetLabel("Spawn Entity Parameters");
        desc.AddMember(&SSpawnEntityParams::entityClass, 'cls', "EntityClass", "Entity Class", "Class name of entity to spawn", "DefaultEntity");
        desc.AddMember(&SSpawnEntityParams::spawnPosition, 'pos', "SpawnPos", "Spawn Position", "World position coordinates", Vec3(0, 0, 0));
    }
};

class CActionSpawnEntity final : public Schematyc::CAction
{
public:
    CActionSpawnEntity(const SSpawnEntityParams& params) : m_params(params) {}

    void Start() override
    {
        SEntitySpawnParams spawnParams;
        spawnParams.pClass = gEnv->pEntitySystem->GetClassRegistry()->FindClass(m_params.entityClass.c_str());
        spawnParams.vPosition = m_params.spawnPosition;

        if (spawnParams.pClass)
        {
            IEntity* pEntity = gEnv->pEntitySystem->SpawnEntity(spawnParams);
            if (pEntity)
            {
                CryLog("[Schematyc] Successfully spawned entity: %s (ID: %u)", pEntity->GetName(), pEntity->GetId());
            }
        }
    }

    static void ReflectType(Schematyc::CTypeDesc<CActionSpawnEntity>& desc)
    {
        desc.SetGUID("C2B3A4D5-E6F7-8901-2345-678901BCDEFG"_cry_guid);
        desc.SetLabel("Spawn Entity Action");
        desc.AddMember(&CActionSpawnEntity::m_params, 'prm', "Params", "Parameters", "Configuration parameters", SSpawnEntityParams());
    }

private:
    SSpawnEntityParams m_params;
};

// Register Action in Schematyc Environment
void RegisterSpawnAction(Schematyc::IEnvRegistrar& registrar)
{
    Schematyc::CEnvRegistrationScope scope = registrar.Scope(g_gameGUID);
    {
        Schematyc::CEnvRegistrationScope actionScope = scope.Register(CRY_MAKE_ENV_ACTION(CActionSpawnEntity, "Gameplay::SpawnEntity"));
    }
}
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`CMake Error: Could not find CryEngine SDK`** | `CRYENGINE_DIR` environment variable not set, or missing `cryproject` descriptor path. | In terminal, set `set CRYENGINE_DIR=C:\CryEngine\5.7` before running `cmake -B build`. |
| **Resource Compiler Fails: `rc.exe: Error converting texture`** | Source TIF texture format has unsupported bit depth (e.g. 16-bit float) or invalid image dimensions (non power-of-two). | 1. Ensure texture resolution is power-of-two (e.g. $1024\times 1024$, $2048\times 2048$).<br>2. Export textures as 8-bit uncompressed TIF.<br>3. Verify preset argument in `rc.exe` (e.g. `/userpreset=Albedo`). |
| **`LNK2019: Unresolved external symbol gEnv`** | Game Plugin DLL linking without linking `CrySystem.lib` or missing `CryModule.h` header inclusions. | Add `target_link_libraries(${PROJECT_NAME} PRIVATE CrySystem CryEntitySystem)` in `CMakeLists.txt`. |
| **Schematyc Compilation Error: Duplicate GUID** | Copy-pasting component or action code without generating a new unique GUID. | Generate a fresh random GUID using Visual Studio Tools $\rightarrow$ *Create GUID* or Python `uuid.uuid4()`. |

---

## Command Line Syntax & Batch Processing

```bash
# Compile Asset Textures via CryEngine Resource Compiler (rc.exe)
"C:\CryEngine\bin\win_x64\rc\rc.exe" "C:\Assets\Textures\*.tif" /userpreset=Albedo /threads=8

# Generate Visual Studio 2022 Solution via CryEngine CMake Engine
cmake -B build -G "Visual Studio 17 2022" -A x64
```

### Essential File Locations
- **Resource Compiler Executable**: `<CryEngineRoot>\bin\win_x64\rc\rc.exe`
- **Plugin Module Header**: `<ProjectRoot>\code\GamePlugin.h`

---

## Agent Operational Directive
> **MANDATORY**: Every Schematyc class and parameter struct must define a globally unique GUID (`_cry_guid`) to prevent registration collisions in the CryEngine reflection database. Link against `CrySystem` in CMake.
