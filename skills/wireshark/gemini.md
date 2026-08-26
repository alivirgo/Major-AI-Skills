---
title: "Wireshark Deep Packet Analyzer AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Wireshark IO graphs, TCP stream ladder charts, and protocol dissections."
category: "Network Packet Analyzer & Inspection Engine"
tags: ["wireshark", "packet-analysis", "gemini", "io-graphs", "tcp-stream", "flow-graphs"]
---

# Wireshark Deep Packet Analyzer AI Skill Guide (Gemini)

## Overview & Engine Architecture
Wireshark provides deep packet inspection across thousands of protocols, generating rich visual timeline graphs, flow ladder sequences, and round-trip time (RTT) plots. Gemini acts as an AI Protocol Analyst and Visual Forensics Engineer, specializing in **multimodal IO Graph anomaly detection**, **TCP stream sequence ladder analysis (SYN/ACK handshakes)**, **VoIP RTP jitter graph interpretation**, and **display filter formulation**.

### Visual Analytics & Dissector Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                 Wireshark Visual Analytics                  │
│                                                             │
│  Protocol & Flow Visualization Layer                        │
│  ├── IO Graphs (Throughput, TCP Errors, Retransmissions/sec)│
│  ├── TCP Stream Graphs (Stevens Time-Sequence, RTT, Window) │
│  └── VoIP / RTP Stream Analysis & Audio Playback Engine     │
│                                                             │
│  Inspection & Dissection Interface                          │
│  ├── Packet Details Tree & Hex Dump Byte Slicer             │
│  ├── Flow Graph / Ladder Diagram Generator                  │
│  └── Expert Information Matrix (Chat, Note, Warn, Error)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal IO Graph Interpretation**: Analyze screenshots of Wireshark IO Graphs (Bits/s vs Time, Packets/s) to isolate bandwidth micro-bursts, zero-window freezes, and TCP reset storms.
2. **TCP Stream Ladder Diagram Diagnostics**: Interpret Flow Graph / Ladder sequence screenshots to diagnose unacknowledged SYN packets, 3-way handshake delays, asymmetric routing, and RST teardowns.
3. **VoIP & RTP Quality Auditing**: Evaluate RTP stream jitter graphs and delta time histograms to identify audio dropouts, packet reordering, and codec clock drift.
4. **Display Filter Formulation**: Generate targeted display filter expressions (`tcp.flags.reset == 1`, `dns.flags.rcode != 0`, `http.time > 1.0`).

---

## Production Python Automation: Automated HTTP/DNS Latency Histogram

Execute this script to calculate response latency percentiles ($P_{50}, P_{95}, P_{99}$) across HTTP transactions in a PCAP capture file:

```python
"""
Wireshark / TShark HTTP & DNS Response Time Analyzer
Computes transaction latency distributions from PCAP files.
"""

import sys
import subprocess
import statistics

def compute_latency_metrics(pcap_file: str):
    # Query HTTP response times (http.time is in seconds)
    cmd = [
        "tshark", "-r", pcap_file,
        "-Y", "http.response and http.time",
        "-T", "fields", "-e", "http.time"
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    latencies = [float(x.strip()) * 1000.0 for x in res.stdout.splitlines() if x.strip()] # In ms

    if not latencies:
        print("No HTTP response timing data found in capture.")
        return

    latencies.sort()
    count = len(latencies)
    avg_lat = statistics.mean(latencies)
    p50 = statistics.median(latencies)
    p95 = latencies[int(count * 0.95)]
    p99 = latencies[int(count * 0.99)]

    print(f"--- [HTTP LATENCY DISTRIBUTION: {count:,} TRANSACTIONS] ---")
    print(f"Average Response Time: {avg_lat:.2f} ms")
    print(f"Median (P50):          {p50:.2f} ms")
    print(f"95th Percentile (P95): {p95:.2f} ms")
    print(f"99th Percentile (P99): {p99:.2f} ms")
    print(f"Max Latency:           {max(latencies):.2f} ms")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python http_latency_analyzer.py <capture.pcapng>")
        sys.exit(1)
    compute_latency_metrics(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **IO Graph Shows Sharp Spike in Black/Red Lines** | High volume of `TCP Retransmission` and `TCP Dup ACK` events indicating packet loss or network link congestion. | 1. Filter by `tcp.analysis.flags` in packet list.<br>2. Inspect RTT graph under *Statistics $\rightarrow$ TCP Stream Graphs $\rightarrow$ Round Trip Time*.<br>3. Check intermediate switch/router interface queue drops. |
| **TCP Window Flatlines at Zero (`TCP ZeroWindow`)** | Receiving application socket buffer is full; sender is forced to halt data transmission. | 1. In Expert Info, check for `TCP Window Full` and `ZeroWindow`.<br>2. Profile receiving backend server CPU and memory usage.<br>3. Increase TCP socket buffer limits (`SO_RCVBUF`). |
| **DNS Traffic Shows Hundreds of `Server Failure / Refused`** | Internal DNS resolver unreachable or recursion limits exceeded. | 1. Apply filter: `dns.flags.rcode != 0`.<br>2. Inspect `dns.qry.name` to identify failing domains.<br>3. Check upstream DNS server health. |
| **Wireshark Viewport Slows to Crawl on 1GB+ PCAP** | GUI attempting to render all dissect fields in memory without filter index. | 1. Split large capture into smaller chunks: `editcap -c 100000 large.pcap split.pcap`.<br>2. Or use headless `tshark` with specific field extraction `-T fields`. |

---

## Command Line Syntax & Configuration

```bash
# Print Expert Info Summary via TShark
tshark -r capture.pcapng -q -z expert

# Generate Protocol Hierarchy Statistics
tshark -r capture.pcapng -q -z io,phs
```

### Essential File Locations
- **Windows Color Filters**: `%APPDATA%\Wireshark\colorfilters`
- **Linux Color Filters**: `~/.config/wireshark/colorfilters`

---

## Agent Operational Directive
> **MANDATORY**: For large captures ($>500\text{MB}$), slice files with `editcap` before loading into the GUI or execute queries via headless `tshark` to prevent memory exhaustion. Use TCP Stream Graphs to diagnose retransmissions.
