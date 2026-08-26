---
title: "Wireshark Deep Packet Analyzer AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Wireshark, TShark automation, custom Lua dissectors, and Python pyshark mining."
category: "Network Packet Analyzer & Inspection Engine"
tags: ["wireshark", "tshark", "lua-dissector", "pyshark", "gpt-codex", "packet-automation"]
---

# Wireshark Deep Packet Analyzer AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Wireshark and TShark provide an extensible C/Lua dissection runtime for deep packet analysis. GPT/Codex acts as a Principal Network Protocol Developer and Security Forensics Architect, delivering **custom Lua protocol dissectors**, **Python `pyshark` automated triage scripts**, **TShark headless pipelines**, and **automated network verification fixtures**.

### Architecture & Lua Dissector Engine

```
┌─────────────────────────────────────────────────────────────┐
│                 Wireshark Developer Platform                │
│                                                             │
│  Dissection & Extensibility Layer                           │
│  ├── Native C Protocol Dissectors (`plugins/epan/`)         │
│  ├── Embedded Lua 5.2 Scripting Engine (`Proto`, `ProtoField`)│
│  └── Custom Post-Dissectors & Tap Listeners                 │
│                                                             │
│  Automation & Headless Pipeline                             │
│  ├── TShark Streaming JSON Output (`-T ek` / `-T json`)     │
│  ├── Python `pyshark` Asynchronous Event Loop Wrapper       │
│  └── Automated PCAP Slicing & Merging (`editcap`, `mergecap`)│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Custom Lua Protocol Dissector Development**: Author clean, high-performance Wireshark Lua dissectors (`Proto`, `ProtoField`, `dissector()` function) to decode proprietary binary and telemetry protocols over TCP/UDP.
2. **Asynchronous Python `pyshark` Scripting**: Build Python tools utilizing `pyshark.FileCapture` to iterate through packets, evaluate display filters, and extract protocol fields without subprocess parsing boilerplate.
3. **Automated ElasticSearch / NDJSON Export**: Script TShark pipelines using `-T ek` to stream network events directly into Elasticsearch / OpenSearch clusters.
4. **PCAP Sanitization & Anonymization**: Author scripts to scrub sensitive payload data, normalize timestamps, and obfuscate private IPv4/IPv6 addresses using `editcap` and `tcprewrite`.

---

## Production Lua Automation: Custom Binary Protocol Dissector

Save this script as `custom_telemetry_dissector.lua` in Wireshark's plugins folder to decode a custom binary telemetry protocol on UDP Port 9999:

```lua
-- Wireshark Custom Binary Telemetry Protocol Dissector
local telemetry_proto = Proto("telemetry", "Custom Robot Telemetry Protocol")

-- Protocol Fields Definition
local f_magic   = ProtoField.uint16("telemetry.magic", "Magic Header", base.HEX)
local f_seq     = ProtoField.uint32("telemetry.seq", "Sequence Number", base.DEC)
local f_battery = ProtoField.float("telemetry.battery", "Battery Voltage (V)")
local f_status  = ProtoField.string("telemetry.status", "Status String")

telemetry_proto.fields = { f_magic, f_seq, f_battery, f_status }

-- Dissector Function
function telemetry_proto.dissector(buffer, pinfo, tree)
    local length = buffer:len()
    if length < 10 then return end -- Minimum header size check

    pinfo.cols.protocol = "TELEMETRY"
    local subtree = tree:add(telemetry_proto, buffer(), "Custom Telemetry Data")

    -- Parse Fields (Byte Offsets)
    subtree:add(f_magic, buffer(0, 2))
    subtree:add(f_seq, buffer(2, 4))
    subtree:add(f_battery, buffer(6, 4))
    
    local status_len = length - 10
    if status_len > 0 then
        subtree:add(f_status, buffer(10, status_len))
    end
end

-- Register Dissector on UDP Port 9999
local udp_port = DissectorTable.get("udp.port")
udp_port:add(9999, telemetry_proto)
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`pyshark.tshark.tshark.TSharkNotFoundException`** | TShark binary is not in the system `PATH` environment variable. | 1. Add `C:\Program Files\Wireshark` to system `PATH`.<br>2. Or initialize in Python: `pyshark.FileCapture(..., tshark_path='C:/Program Files/Wireshark/tshark.exe')`. |
| **Lua Script Fails: `attempt to call field 'ProtoField' (a nil value)`** | Lua script executed in a standalone Lua CLI rather than inside Wireshark/TShark embedded engine. | Lua dissectors must be loaded via Wireshark or TShark: `tshark -X lua_script:custom_telemetry_dissector.lua`. |
| **`pyshark` Exhausts Memory on 500MB+ PCAP** | Storing all packet objects in a Python list rather than streaming with an iterator generator. | Use `for packet in capture:` generator loop and call `packet.clear()` or avoid storing past packets in memory. |
| **TShark Output Field Extraction Returns Blank** | Display filter field name is misspelled or field only exists in certain protocol variations. | Verify field syntax using `tshark -G fields \| grep -i <term>`. |

---

## Command Line Syntax & Batch Processing

```bash
# Execute TShark with Custom Lua Dissector
tshark -X lua_script:custom_telemetry_dissector.lua -r telemetry.pcap -Y "telemetry"

# Stream Packets Directly to Elasticsearch Bulk NDJSON Format
tshark -r capture.pcap -T ek > packets.ndjson
```

### Essential File Locations
- **Windows Lua Plugins Directory**: `%APPDATA%\Wireshark\plugins`
- **Linux Lua Plugins Directory**: `~/.local/lib/wireshark/plugins`
- **macOS Lua Plugins Directory**: `~/.config/wireshark/plugins`

---

## Agent Operational Directive
> **MANDATORY**: For custom protocol decoding, author modular Lua dissector scripts registered on target ports. In Python `pyshark` processing, stream packets through generator loops to avoid loading entire multi-gigabyte PCAPs into RAM.
