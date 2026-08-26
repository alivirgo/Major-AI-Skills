---
title: "Sniffnet Network Traffic Monitor AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Sniffnet, Rust pnet/pcap packet processing, BPF filtering, and cross-platform compilation."
category: "Cross-Platform Network Traffic Monitor"
tags: ["sniffnet", "rust-pnet", "pcap-bindings", "gpt-codex", "network-analysis", "packet-sniffer"]
---

# Sniffnet Network Traffic Monitor AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Sniffnet is an open-source, Rust-engineered network analysis tool leveraging asynchronous multi-threading, zero-copy packet slicing (`pnet`, `etherparse`), and cross-platform capture drivers. GPT/Codex acts as a Principal Rust Systems Programmer and Network Engineer, delivering **packet capture scripting**, **Rust `pnet` / `pcap` code recipes**, **cross-platform compilation guidance (Npcap/libpcap linking)**, and **headless network telemetry tools**.

### Developer Architecture & Rust Slicing Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Sniffnet Rust Architecture                  │
│                                                             │
│  Kernel Packet Pipeline                                     │
│  ├── `pcap::Capture` (Zero-copy raw ethernet frame ingestion│
│  ├── Cross-Thread Ring Buffer Channel (`crossbeam-channel`) │
│  └── SIMD Byte Matching & Header Extraction                 │
│                                                             │
│  Parsing & State Engine                                     │
│  ├── `etherparse` (Ethernet -> IPv4/IPv6 -> TCP/UDP/ICMP)   │
│  ├── Thread-Safe Concurrent DashMap State Cache             │
│  └── Iced Reactive Elm-Architecture Application State       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Rust Zero-Copy Packet Parsing**: Author high-performance Rust / Python packet processing logic utilizing zero-allocation byte slice referencing (`&[u8]`).
2. **Cross-Platform Compilation Troubleshooting**: Remediate build and linking errors related to `pcap-sys`, `wpcap.lib`, and `Packet.lib` on Windows and Linux systems.
3. **Headless Packet Capture Pipelines**: Build command-line utilities and daemon workers that ingest raw PCAP streams and export JSON summaries.
4. **BPF Filter Optimization**: Optimize Berkeley Packet Filter strings for high-throughput packet filtering at the kernel boundary.

---

## Production Python Automation: High-Speed Raw PCAP Stream Analyzer

Save this script as `pcap_stream_analyzer.py` to parse standard PCAP capture files and compute throughput statistics:

```python
"""
Headless PCAP Stream Analyzer & Flow Extractor
Parses raw PCAP files without GUI overhead.
"""

import sys
import struct
import socket

def parse_pcap(file_path: str):
    with open(file_path, "rb") as f:
        # Read PCAP Global Header (24 bytes)
        global_header = f.read(24)
        if len(global_header) < 24:
            print("Error: Invalid PCAP file.")
            return

        magic_number, = struct.unpack("<I", global_header[0:4])
        if magic_number not in (0xa1b2c3d4, 0xd4c3b2a1):
            print("Error: Unrecognized PCAP magic number.")
            return

        pkt_count = 0
        total_wire_bytes = 0

        while True:
            # Read Packet Header (16 bytes)
            pkt_hdr = f.read(16)
            if len(pkt_hdr) < 16:
                break
            
            ts_sec, ts_usec, incl_len, orig_len = struct.unpack("<IIII", pkt_hdr)
            pkt_data = f.read(incl_len)
            
            pkt_count += 1
            total_wire_bytes += orig_len

    print(f"--- [PCAP ANALYSIS SUMMARY: {file_path}] ---")
    print(f"Total Packets Processed: {pkt_count:,}")
    print(f"Total Wire Volume: {total_wire_bytes / (1024*1024):.2f} MB")
    print(f"Average Packet Size: {total_wire_bytes / max(pkt_count, 1):.1f} bytes")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python pcap_stream_analyzer.py <capture.pcap>")
        sys.exit(1)
    parse_pcap(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Cargo Build Fails: `cannot find -lpcap` or `wpcap.lib`** | `pcap-sys` cannot locate the native C library headers or import libraries on the build host. | 1. **Windows**: Download Npcap SDK; set `LIB="C:\Npcap-SDK\Lib\x64"` and `INCLUDE="C:\Npcap-SDK\Include"`.<br>2. **Linux**: Install development headers: `sudo apt install -y libpcap-dev`.<br>3. **macOS**: `xcode-select --install` provides standard libpcap headers. |
| **`Packet buffer overflow` / Dropped Packets under Load** | Processing thread cannot keep up with high-speed packet ingestion channel. | 1. In Rust, decouple packet ingestion from DNS resolution using background worker pools (`rayon` / `tokio`).<br>2. Increase kernel socket buffer size via `pcap::Capture::buffer_size()`. |
| **High Memory Growth during Long Capture Sessions** | Unbounded growth in historical packet flow hash tables. | Implement LRU cache eviction or sliding time window expiry on connection maps. |
| **GUI Crash on Windows: `WGPU error: Adapter not found`** | System graphics driver lacks Vulkan / DirectX 12 WGPU support. | Force DX11/OpenGL backend in Rust: `std::env::set_var("WGPU_BACKEND", "dx11")`. |

---

## Command Line Syntax & Build Recipes

```bash
# Compile Sniffnet from Source with Cargo
cargo build --release

# Run Headless PCAP Analyzer
python pcap_stream_analyzer.py "C:\Captures\network_traffic.pcap"
```

### Essential File Locations
- **Windows Npcap SDK**: `C:\Npcap-SDK`
- **Sniffnet Source Repo**: `https://github.com/GyulyVGC/sniffnet`

---

## Agent Operational Directive
> **MANDATORY**: When building or compiling Sniffnet or `pcap-sys` projects on Windows, ensure the Npcap SDK is linked via `LIB` and `INCLUDE` environment variables. Decouple network packet ingestion from DNS lookups.
