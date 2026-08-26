---
name: wireshark
description: "Comprehensive operational skill specification for Anthropic Claude to automate, script, troubleshoot, and optimize Wireshark, TShark CLI, TLS session decryption, TCP stream reassembly, and Display Filters."
category: cross-platform
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["wireshark", "tshark", "packet-analysis", "tls-decryption", "pcapng", "tcp-reassembly", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Wireshark Deep Packet Analyzer AI Skill Guide (Claude)

## Overview & Engine Architecture
Wireshark is the world's foremost network protocol analyzer and deep packet inspection (DPI) platform, powered by the **Ethereal Packet Analysis Core (`epan`)**, **Wiretap library**, and **TShark CLI headless engine**. Claude operates as a Principal Network Security Architect and Protocol Forensics Engineer, specializing in **Display Filter syntax (`dfilter`)**, **TCP stream reassembly & state tracking**, **TLS 1.3 session key decryption (`SSLKEYLOGFILE`)**, and **automated headless PCAP mining via TShark**.

### Wireshark Protocol Analysis & Dissection Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Wireshark Core Architecture                 │
│                                                             │
│  Packet Capture & Tap Layer                                 │
│  ├── `dumpcap` (High-speed multi-threaded capture engine)    │
│  ├── Npcap / libpcap Kernel Ring Buffer Tap                 │
│  └── Wiretap Library (PCAP, PCAPNG, ETL, CAP file format I/O)│
│                                                             │
│  Protocol Dissection & Analysis Layer (`epan`)              │
│  ├── Protocol Dissector Pipeline (Ethernet -> IP -> TLS)    │
│  ├── TCP Stream Tracking (ACK/SEQ analysis, retransmissions)│
│  ├── TLS Decryption Subsystem (RSA Key & Pre-Master Secret) │
│  └── Display Filter Engine (Rich contextual boolean queries)│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Precision Display Filter Authoring**: Construct optimized display filters (`tcp.analysis.retransmission`, `http.response.code >= 400`, `tls.handshake.extensions_server_name`, `dns.flags.response == 0`) to isolate security anomalies.
2. **TLS 1.2/1.3 Decryption Setup**: Configure Wireshark and TShark to decrypt encrypted HTTPS and gRPC sessions using browser/OpenSSL pre-master key logs (`SSLKEYLOGFILE`).
3. **TCP Stream Performance Diagnostics**: Diagnose high network latency, packet loss, duplicate ACKs, zero-window probes, and MSS/MTU black holes from TCP header metrics.
4. **Automated TShark Batch Mining**: Author robust CLI scripts using `tshark`, `capinfos`, `editcap`, and `mergecap` to automate large multi-gigabyte PCAP forensics.

---

## Production Python Automation: Automated PCAP Security & Anomaly Miner (`tshark`)

Save this script as `pcap_security_miner.py` to extract DNS queries, TLS handshakes, HTTP errors, and TCP retransmission metrics using headless `tshark`:

```python
"""
Wireshark / TShark Automated PCAP Security Miner
Extracts DNS anomalies, TLS SNI hosts, and TCP retransmission rates.
"""

import sys
import os
import subprocess
import json

def analyze_pcap(pcap_path: str):
    if not os.path.exists(pcap_path):
        print(f"Error: PCAP file '{pcap_path}' not found.")
        return

    print(f"--- [ANALYZING PCAP: {pcap_path}] ---")

    # 1. Extract Queried DNS Hostnames
    dns_cmd = [
        "tshark", "-r", pcap_path,
        "-Y", "dns.flags.response == 0 and dns.qry.name",
        "-T", "fields", "-e", "dns.qry.name"
    ]
    dns_out = subprocess.run(dns_cmd, capture_output=True, text=True).stdout.splitlines()
    unique_dns = sorted(list(set(dns_out)))
    print(f"\n[1] Unique DNS Queries ({len(unique_dns)}):")
    for domain in unique_dns[:10]:
        print(f"  • {domain}")

    # 2. Extract TLS Server Name Indication (SNI) Targets
    tls_cmd = [
        "tshark", "-r", pcap_path,
        "-Y", "tls.handshake.extensions_server_name",
        "-T", "fields", "-e", "tls.handshake.extensions_server_name"
    ]
    tls_out = subprocess.run(tls_cmd, capture_output=True, text=True).stdout.splitlines()
    unique_sni = sorted(list(set(tls_out)))
    print(f"\n[2] TLS Handshake SNI Targets ({len(unique_sni)}):")
    for sni in unique_sni[:10]:
        print(f"  • {sni}")

    # 3. Calculate TCP Retransmission Rate
    total_tcp_cmd = ["tshark", "-r", pcap_path, "-Y", "tcp", "-T", "fields", "-e", "frame.number"]
    total_tcp = len(subprocess.run(total_tcp_cmd, capture_output=True, text=True).stdout.splitlines())

    retrans_cmd = ["tshark", "-r", pcap_path, "-Y", "tcp.analysis.retransmission", "-T", "fields", "-e", "frame.number"]
    retrans_count = len(subprocess.run(retrans_cmd, capture_output=True, text=True).stdout.splitlines())

    if total_tcp > 0:
        loss_rate = (retrans_count / total_tcp) * 100.0
        print(f"\n[3] TCP Health Metrics:")
        print(f"  • Total TCP Packets: {total_tcp:,}")
        print(f"  • Retransmissions: {retrans_count:,} ({loss_rate:.2f}%)")
        if loss_rate > 3.0:
            print("  ⚠️ WARNING: High packet loss / retransmission rate detected!")
        else:
            print("  ✅ TCP connection quality is healthy.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python pcap_security_miner.py <capture.pcapng>")
        sys.exit(1)
    analyze_pcap(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`No interfaces found` (Linux)** | The user running Wireshark/dumpcap is not in the `wireshark` system group and lacks packet capture capabilities. | 1. Add user to group: `sudo usermod -aG wireshark $USER`.<br>2. Set dumpcap permissions: `sudo dpkg-reconfigure wireshark-common`.<br>3. Log out and log back in. |
| **TLS Decryption Fails (Traffic Remains Encrypted)** | `SSLKEYLOGFILE` environment variable was not configured before starting browser, or Diffie-Hellman keys not logged. | 1. Launch browser: `export SSLKEYLOGFILE=~/.ssl-keys.log && google-chrome &`.<br>2. In Wireshark $\rightarrow$ *Edit $\rightarrow$ Preferences $\rightarrow$ Protocols $\rightarrow$ TLS*, set **(Pre)-Master-Secret log filename** to `~/.ssl-keys.log`. |
| **`Packet drops` during High-Throughput (>100MB/s) Capture** | In-memory socket buffer exhausted during disk I/O flush. | 1. Use dedicated `dumpcap` binary with large ring buffer: `dumpcap -i 1 -B 256 -b filesize:500000 -w capture.pcapng`.<br>2. Disable live packet updating in GUI during capture. |
| **TCP Stream Reassembly Incomplete / Truncated** | Captured with snaplen limit (`-s 64`) or packets arrived out-of-order without sufficient TCP timeout buffer. | In *Preferences $\rightarrow$ Protocols $\rightarrow$ TCP*, verify **Allow subdissector to reassemble TCP streams** is checked. |

---

## Command Line Syntax & Production Recipes

```bash
# 1. High-Performance Headless Packet Capture with 256MB Ring Buffer
dumpcap -i eth0 -B 256 -b filesize:500000 -b files:10 -w /var/log/traffic.pcapng

# 2. Decrypt HTTPS Traffic using SSL Key Log via TShark
tshark -r https_traffic.pcapng -o "tls.keylog_file:/path/to/ssl-keys.log" -Y "http" -T fields -e http.request.full_uri

# 3. Slice PCAP by Time Window (First 5 Minutes)
editcap -A "2026-08-22 10:00:00" -B "2026-08-22 10:05:00" input.pcapng output_window.pcapng

# 4. Filter and Export Only HTTP 5xx Server Errors
tshark -r traffic.pcapng -Y "http.response.code >= 500" -w server_errors.pcapng
```

### Essential File Locations
- **Windows User Preferences**: `%APPDATA%\Wireshark`
- **Linux User Preferences**: `~/.config/wireshark`
- **macOS User Preferences**: `~/.config/wireshark`

---

## Agent Operational Directive
> **MANDATORY**: For high-speed packet captures, invoke `dumpcap` directly with `-B <buffer_size_mb>` rather than Wireshark GUI to prevent packet drops. Use `SSLKEYLOGFILE` for modern TLS 1.3 decryption.
