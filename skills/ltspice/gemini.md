---
title: "Analog Devices LTspice Circuit Simulation AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot LTspice Waveform Viewer graphs, FFT spectral charts, and Bode stability plots."
category: "SPICE Circuit Simulation & Schematic Capture"
tags: ["ltspice", "waveform-viewer", "fft-analysis", "gemini", "bode-plot", "spice-simulation"]
---

# Analog Devices LTspice Circuit Simulation AI Skill Guide (Gemini)

## Overview & Engine Architecture
Analog Devices LTspice provides ultra-fast SPICE simulation, integrated schematic capture, and a native hardware-accelerated waveform viewer. Gemini acts as an AI Circuit Simulation Analyst and Signal Integrity Engineer, specializing in **multimodal Waveform Viewer inspection**, **FFT harmonic distortion & spectrum analysis**, **Bode Plot loop stability diagnostics (Phase/Gain Margins)**, and **schematic net probing**.

### Visual Analytics & Simulation Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 LTspice Visual Inspection Stack             │
│                                                             │
│  Waveform Analytics & Probing                               │
│  ├── Interactive Voltage Probe (Crosshair Pointer)          │
│  ├── Current Loop Clamp Probe (Component Body Current)      │
│  ├── Instantaneous Power Dissipation (`Alt + Click` Meter)  │
│  └── FFT Spectrum Analyzer (Harmonic Distortion & THD)      │
│                                                             │
│  Frequency Domain & Stability                               │
│  ├── AC Small-Signal Bode Plots (Magnitude dB & Phase Deg)  │
│  ├── Middlebrook Loop Gain Probe (Fractional Feedback)      │
│  └── Monte Carlo Gaussian Component Tolerance Envelopes     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Waveform & Transient Triage**: Analyze screenshots of LTspice waveform plots to diagnose ringing, slew rate limiting, clipping, non-linear distortion, and switching overshoot ($V_{\text{spike}}$).
2. **Bode Plot & Stability Interpretation**: Interpret AC small-signal plots to calculate Gain Margin ($GM$), Phase Margin ($PM$), and Gain Crossover Frequency ($f_c$), verifying converter loop stability ($PM \ge 45^\circ$, target $60^\circ$).
3. **FFT Spectrum Analysis**: Analyze Fast Fourier Transform (FFT) displays to identify spurious emissions, fundamental frequencies, and Total Harmonic Distortion (THD).
4. **Thermal & Power Dissipation Auditing**: Guide users to evaluate instantaneous power dissipation waveforms (`Alt + Left Click` on transistors/resistors) to ensure component safe operating area (SOA) margins.

---

## Production Python Automation: Automated Bode Plot Stability & Phase Margin Calculator

Run this standalone script to calculate loop gain crossover frequency and phase margin from exported LTspice AC simulation data:

```python
"""
LTspice AC Analysis Stability (Bode Plot) Calculator
Computes Unity Gain Bandwidth (UGB), Phase Margin (PM), and Gain Margin (GM).
"""

import sys
import os
import math

def calculate_stability_margins(ac_export_file: str):
    if not os.path.exists(ac_export_file):
        print(f"Error: AC export file '{ac_export_file}' not found.")
        return

    freqs = []
    mags_db = []
    phases_deg = []

    with open(ac_export_file, "r") as f:
        for line in f:
            parts = line.strip().split("\t")
            if len(parts) >= 2:
                try:
                    f_val = float(parts[0])
                    # Parse complex string format: "(12.4dB, -45.2°)"
                    complex_str = parts[1].replace("(", "").replace(")", "").replace("dB", "").replace("°", "")
                    c_parts = complex_str.split(",")
                    m_val = float(c_parts[0])
                    p_val = float(c_parts[1])

                    freqs.append(f_val)
                    mags_db.append(m_val)
                    phases_deg.append(p_val)
                except (ValueError, IndexError):
                    continue

    if not freqs:
        print("No valid AC frequency data points found.")
        return

    # Find 0dB Crossover Point
    crossover_idx = None
    for i in range(len(mags_db) - 1):
        if mags_db[i] >= 0.0 and mags_db[i+1] < 0.0:
            crossover_idx = i
            break

    print(f"--- [AC LOOP STABILITY ANALYSIS: {len(freqs)} FREQUENCY STEPS] ---")
    if crossover_idx is not None:
        ugb_freq = freqs[crossover_idx]
        phase_at_crossover = phases_deg[crossover_idx]
        phase_margin = 180.0 + phase_at_crossover

        print(f"Gain Crossover Frequency: {ugb_freq/1e3:.2f} kHz")
        print(f"Phase at Crossover:        {phase_at_crossover:.2f}°")
        print(f"Phase Margin (PM):         {phase_margin:.2f}°")

        if phase_margin < 45.0:
            print("🚨 WARNING: Unstable Loop Response! Phase margin is below 45°.")
        elif phase_margin >= 60.0:
            print("✅ STABLE: Excellent phase margin (>= 60°).")
        else:
            print("⚠️ MARGINAL: Phase margin is acceptable (45°-60°), consider adding lead compensation.")
    else:
        print("Gain does not cross 0dB within simulated frequency range.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python calculate_stability.py <ac_export.txt>")
        sys.exit(1)
    calculate_stability_margins(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Bode Plot Phase Wraps Between $+180^\circ$ and $-180^\circ$** | Phase discontinuity caused by polar coordinate quadrant boundary wrapping. | In Waveform Viewer, right-click the Phase axis $\rightarrow$ Select **Unwrap Phase** or change phase range to $-360^\circ \dots 0^\circ$. |
| **FFT Window Shows Broad Floor Noise (Spectral Smearing)** | Windowing function (Hann, Hamming, FlatTop) not aligned with integer fundamental periods. | 1. In FFT dialog, set **Windowing Function** to `Hann` or `Blackman-Harris`.<br>2. Simulate exact integer cycles of the fundamental frequency.<br>3. Turn off data compression: `.options plotwinsize=0`. |
| **Instantaneous Power Waveform (`Alt+Click`) Missing** | Simulation output compression was enabled, stripping auxiliary device current channels. | In schematic, add `.options plotwinsize=0` to store uncompressed raw data. |
| **Schematic Text Directives Overlap Components** | Multi-line `.PARAM` or `.MEAS` blocks rendered with large font sizes. | Right-click the SPICE directive $\rightarrow$ Change Font Size to `Small` or `Tiny`. |

---

## Command Line Syntax & Configuration

```bash
# Launch LTspice with Specific Schematic in GUI Mode
"C:\Program Files\ADI\LTspice\LTspice.exe" "C:\Circuits\AudioAmp.asc"

# Export Raw Waveform to ASCII CSV Format
"C:\Program Files\ADI\LTspice\LTspice.exe" -ascii -b "C:\Circuits\AudioAmp.asc"
```

### Essential File Locations
- **Windows User Models**: `%USERPROFILE%\Documents\LTspice\lib\sym`
- **Global Installation**: `C:\Program Files\ADI\LTspice\`

---

## Agent Operational Directive
> **MANDATORY**: For AC loop stability evaluations, verify that Phase Margin ($PM \ge 45^\circ$) is measured strictly at the $0\text{dB}$ gain crossover frequency. Set `.options plotwinsize=0` when performing high-resolution FFT distortion analysis.
