---
title: "COMSOL Multiphysics Finite Element Simulation AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize COMSOL Multiphysics, LiveLink for MATLAB (.m scripts), COMSOL Java API (ModelUtil), and Python MPh."
category: "Multiphysics Finite Element Simulation"
tags: ["comsol", "livelink-matlab", "comsol-java-api", "modelutil", "mph-automation", "gpt-codex", "fea-scripting"]
---

# COMSOL Multiphysics Finite Element Simulation AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
COMSOL Multiphysics provides rich programmatic control via the **COMSOL Java API (`com.comsol.model.util.ModelUtil`)**, **LiveLink for MATLAB (`mph*` M-file functions)**, and the **`MPh` Python API**. GPT/Codex acts as a Principal Computational Physics Software Engineer and FEA Automation Developer, delivering **LiveLink for MATLAB simulation scripts**, **standalone COMSOL Java applications**, **automated Python `MPh` parametric sweeps**, and **headless cluster job submission scripts**.

### Developer Architecture & Automation Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 COMSOL Developer Platform                   │
│                                                             │
│  Java & MATLAB Scripting Interfaces                         │
│  ├── COMSOL Java API (`com.comsol.model.*`, `ModelUtil`)    │
│  ├── LiveLink for MATLAB (`mphload`, `mphgeom`, `mpheval`)  │
│  └── COMSOL M-File Export (`Save as Model M-File .m`)       │
│                                                             │
│  Python Automation & Cluster Architecture                   │
│  ├── `MPh` Python Client Layer (`mph.Client(port=2036)`)    │
│  ├── Headless Batch Execution CLI (`comsol batch`)          │
│  └── Automated Parametric DOE (Design of Experiments) Script│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **LiveLink for MATLAB Simulation Development**: Author clean `.m` scripts leveraging LiveLink functions (`mphopen`, `mphglobal`, `mphplot`, `mphmesh`) to execute optimization loops in MATLAB.
2. **COMSOL Java API (`ModelUtil`) Authoring**: Build compiled Java classes constructing parametric CAD geometry, applying physics boundary conditions, and solving studies headlessly.
3. **Automated Design of Experiments (DOE)**: Construct Python/MATLAB pipelines sweeping multi-dimensional parameter spaces (e.g. coil turns, frequency, heat transfer coefficient).
4. **Automated Report Generation**: Script extraction of high-resolution result graphics, probe values, and volumetric integrals into LaTeX/HTML reports.

---

## Production MATLAB Automation: COMSOL LiveLink for MATLAB Script (`.m`)

Save this script as `run_livelink_simulation.m` to execute a parametric geometry sweep and export field data in MATLAB:

```matlab
% ==============================================================================
% COMSOL LiveLink for MATLAB: Automated Parametric Thermal Optimization
% Connects to COMSOL server, modifies geometric radius, solves, and extracts data.
% ==============================================================================
function run_livelink_simulation()
    disp('--- [STARTING COMSOL LIVELINK FOR MATLAB PIPELINE] ---');

    % 1. Connect to COMSOL Server (Default Port 2036)
    import com.comsol.model.*
    import com.comsol.model.util.*

    try
        mphstart(2036);
        disp('✅ Connected to COMSOL Multiphysics Server!');
    catch ME
        disp(['Notice: Connection already established or server starting... ', ME.message]);
    end

    % 2. Load Model File
    modelPath = 'C:\SimulationModels\CylinderCooling.mph';
    disp(['Loading model: ', modelPath]);
    model = mphload(modelPath);

    % 3. Sweep Cylinder Radius Parameter
    radius_values = [0.01, 0.015, 0.02, 0.025]; % meters
    max_temperatures = zeros(size(radius_values));

    for i = 1:length(radius_values)
        r_val = radius_values(i);
        fprintf('Running iteration #%d: Radius = %.3f m...\n', i, r_val);

        % Update Model Parameter
        model.param.set('r_cyl', sprintf('%.4f[m]', r_val));

        % Re-build Geometry and Re-Mesh
        model.geom('geom1').run;
        model.mesh('mesh1').run;

        % Solve Study (std1)
        model.sol('sol1').runAll;

        % Extract Maximum Temperature using mpheval
        data = mpheval(model, 'T', 'dataset', 'dset1');
        max_T = max(data.d1) - 273.15; % Convert Kelvin to Celsius
        max_temperatures(i) = max_T;

        fprintf('  ✅ Iteration #%d Complete. Peak Temperature: %.2f °C\n', i, max_T);
    end

    % 4. Plot Results in MATLAB
    figure('Name', 'COMSOL LiveLink Parametric Results');
    plot(radius_values * 1000, max_temperatures, '-or', 'LineWidth', 2, 'MarkerSize', 8);
    xlabel('Cylinder Radius (mm)');
    ylabel('Maximum Temperature (°C)');
    title('Thermal Performance vs Geometric Dimension');
    grid on;

    disp('✅ Simulation pipeline complete. Results plotted in MATLAB.');
end
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`mphload` Fails: `Java exception occurred: File not found`** | Relative path passed to `mphload` not resolved by COMSOL server process. | Always use absolute file paths: `mphload('C:\Models\MyModel.mph')`. |
| **MATLAB Hangs During `model.sol.runAll`** | Solver encountered an unrecoverable singular matrix and entered an infinite continuation loop. | In CODESYS/COMSOL, set maximum solver iterations to a finite bound ($50-100$) and check boundary conditions. |
| **Java API Throws `ModelUtil.init() failed`** | JVM security manager or classpath missing COMSOL installation JAR files. | Add `comsol.jar` and `comsolapi.jar` from `<COMSOL_DIR>/plugins/` to Java classpath. |
| **LiveLink Port Collision Error on `mphstart(2036)`** | Another COMSOL server instance already bound to port 2036. | Specify an alternate port: `comsol mphserver -port 2037` and connect with `mphstart(2037)`. |

---

## Command Line Syntax & Batch Processing

```bash
# Launch COMSOL with MATLAB LiveLink Desktop Launcher
"C:\Program Files\COMSOL\COMSOL62\Multiphysics\bin\win64\comsolmphserver.exe" -matlab

# Compile Standalone COMSOL Java Application
javac -cp "C:\Program Files\COMSOL\COMSOL62\Multiphysics\plugins\*" CustomSimApp.java
```

### Essential File Locations
- **MATLAB LiveLink Toolkit**: `<COMSOL_DIR>\mli\`
- **Java API JARs**: `<COMSOL_DIR>\plugins\`

---

## Agent Operational Directive
> **MANDATORY**: When orchestrating geometric parametric sweeps via LiveLink for MATLAB, always call `model.geom('geom1').run` and `model.mesh('mesh1').run` before executing the solver to ensure mesh topology updates.
