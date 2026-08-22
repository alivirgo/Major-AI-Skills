# Cross-Platform Systems, Networking & Media Engineering Suite (`skills/cross-platform/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for industry-standard cross-platform utilities, high-performance networking, media transcoding, cloud synchronization, and systems engineering tools.

Each tool ecosystem includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (analytical diagnostics, systems safety, network forensics, step-by-step pipeline reasoning).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal inspection of network graphs, video artifact triage, UI dashboards, latency waterfalls).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (Python automation wrappers, Lua dissectors, Jinja2 config generators, JSON-RPC APIs).

---

## Cross-Platform Domain Architecture & Pipeline Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Cross-Platform Systems & Utilities Map                      │
│                                                             │
│  [1] Bruno (`bruno/`)                                                       │
│  • Domain: Git-Native Offline-First API Testing & Request Chaining          │
│  • Automation: Plain-Text Bru Markup DSL, `@usebruno/cli` CI/CD Runner      │
│                                                             │
│  [2] FFmpeg (`ffmpeg/`)                                                     │
│  • Domain: Universal Multimedia Transcoding, Stream Slicing, Audio Normaliz.│
│  • Automation: NVENC/QSV/VideoToolbox Accel, Complex Filtergraphs, HLS Pack.│
│                                                             │
│  [3] LosslessCut (`losslesscut/`)                                           │
│  • Domain: Lossless Video/Audio Slicing & Merging via Stream Copying        │
│  • Automation: Keyframe (IDR) GOP Alignment, `.llc` JSON Projects, Silence   │
│                                                             │
│  [4] Nginx (`nginx/`)                                                       │
│  • Domain: High-Performance Web Server, Reverse Proxy & Load Balancer       │
│  • Automation: Master-Worker Event Loop, Hardened TLS 1.3, Micro-Caching    │
│                                                             │
│  [5] Rclone (`rclone/`)                                                     │
│  • Domain: Multi-Cloud Data Synchronization, Virtual FUSE Mounts, Crypto    │
│  • Automation: Remote Control JSON-RPC, Systemd Mounts, S3/GCS/Drive Sync   │
│                                                             │
│  [6] Sniffnet (`sniffnet/`)                                                 │
│  • Domain: Zero-Copy Real-Time Network Traffic & Bandwidth Monitoring       │
│  • Automation: Rust `pnet`/`pcap` Engine, BPF Packet Filtering, ASN Lookup  │
│                                                             │
│  [7] Tailscale (`tailscale/`)                                               │
│  • Domain: Zero-Config WireGuard Mesh VPN, Subnet Routing, Zero-Trust ACLs  │
│  • Automation: Local Unix Socket API, Subnet NAT Forwarding, Funnel / Serve │
│                                                             │
│  [8] Ventoy (`ventoy/`)                                                     │
│  • Domain: Multiboot USB Creation, Dynamic In-Memory ISO Bootloader         │
│  • Automation: UEFI Secure Boot MOK Enrollment, `ventoy.json`, Unattended   │
│                                                             │
│  [9] Wireshark (`wireshark/`)                                               │
│  • Domain: Deep Packet Inspection (DPI), Protocol Forensics, TCP Analysis   │
│  • Automation: TShark Headless Mining, Lua Dissectors, TLS Key Decryption   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Tool Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[bruno/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cross-platform/bruno)** | Offline API Client & Testing | Declarative `.bru` DSL, CLI test runner, OAuth2 token chaining |
| **[ffmpeg/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cross-platform/ffmpeg)** | Transcoding & Stream Packaging | NVENC GPU acceleration, ABR HLS packaging, VMAF benchmarks |
| **[losslesscut/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cross-platform/losslesscut)** | Lossless Media Trimmer | Keyframe GOP alignment, Smart Cut mode, Auto-silence slicing |
| **[nginx/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cross-platform/nginx)** | Reverse Proxy & Load Balancer | TLS 1.3 hardening, WebSocket proxies, Micro-caching, SPA routing |
| **[rclone/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cross-platform/rclone)** | Multi-Cloud Sync & FUSE Mount | VFS full cache mounts, JSON-RPC automation, S3/Drive transfers |
| **[sniffnet/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cross-platform/sniffnet)** | Real-Time Network Traffic Monitor | Zero-copy packet capture, BPF filters, IP Geolocation/ASN lookups |
| **[tailscale/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cross-platform/tailscale)** | WireGuard Mesh VPN & Subnet Routes | Subnet router NAT forwarding, MagicDNS, Zero-trust HuJSON ACLs |
| **[ventoy/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cross-platform/ventoy)** | Multiboot USB ISO Bootloader | MOK Secure Boot enrollment, `ventoy.json` plugins, Unattended XML |
| **[wireshark/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/cross-platform/wireshark)** | Deep Packet Inspection & DPI | TShark automation, TLS session decryption, Custom Lua dissectors |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, DevOps automation scripts, and local developer workflows. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
