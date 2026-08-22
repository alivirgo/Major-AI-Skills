# Scientific Computing, Multiphysics & Instrument Control Suite (`skills/scientific/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for premier numerical computing environments, finite element multiphysics solvers, automated laboratory instrument controllers, and technical scientific graphing suites.

Each tool ecosystem includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (numerical solver architectures, high-speed DAQ streaming pipelines, MPh/Java API bridges, non-linear optimization).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal 3D stress/thermal visualization, convergence rate curves, front panel UI scaling, journal publication figure review).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (MEX C++ acceleration, MATLAB Engine for Python, PyVISA SCPI drivers, `originpro` batch pipelines, LabTalk automation).

---

## Scientific & Engineering Domain Architecture & Pipeline Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Scientific Computing & Simulation Map                       │
│                                                             │
│  [1] COMSOL Multiphysics (`comsol/`)                                        │
│  • Domain: Coupled PDE Multiphysics, FEA Solvers, Thermal/CFD/EM Modeling   │
│  • Automation: Python `mph` Bridge, Java API `ModelUtil`, MATLAB LiveLink   │
│                                                                             │
│  [2] NI LabVIEW (`labview/`)                                                │
│  • Domain: Graphical Dataflow (G), DAQmx Streaming, Test & Measurement      │
│  • Automation: Python `nidaqmx`, PyVISA SCPI Controllers, `g-cli` CI/CD     │
│                                                                             │
│  [3] MathWorks MATLAB (`matlab/`)                                           │
│  • Domain: Matrix Computing, Signal Processing, JIT, Simulink Model Design  │
│  • Automation: `matlab.engine` Python API, MEX C++ Multi-Threading, `parfor`│
│                                                                             │
│  [4] OriginLab OriginPro (`originpro/`)                                     │
│  • Domain: Publication Technical Graphing, NLFit Non-Linear Optimization    │
│  • Automation: `originpro` Python Package, LabTalk `.ogs`, COM Automation   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Application Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[comsol/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/scientific/comsol)** | Multiphysics FEA Simulation | `mph` Python client, Segregated solvers, Java API, MATLAB LiveLink |
| **[labview/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/scientific/labview)** | Data Acquisition & Testing | `nidaqmx` continuous streaming, PyVISA SCPI, QMH pattern, `g-cli` |
| **[matlab/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/scientific/matlab)** | Numerical Computing & Algorithms | `matlab.engine` Python bridge, MEX C++, `parfor`, Simulink, `mcc` |
| **[originpro/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/scientific/originpro)** | Scientific Graphing & NLFit | `originpro` Python API, Gaussian peak deconvolution, LabTalk scripts |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, computational laboratory pipelines, and automated test environments. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
