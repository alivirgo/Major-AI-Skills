# Digital Forensics, Incident Response & eDiscovery Engineering Suite (`skills/digital-forensics/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for industry-standard digital forensics platforms, evidence acquisition tools, timeline correlation frameworks, and eDiscovery suites.

Each application suite includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (analytical forensics diagnostics, chain of custody verification, step-by-step artifact triage).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal timeline visualization, communications link graphs, hex sector analysis).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (EnScript API programming, Jython Ingest Modules, FTK Imager automation, PostgreSQL database mining).

---

## Digital Forensics Architecture & Pipeline Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Digital Forensics & Incident Response Map                   │
│                                                                             │
│  [1] Autopsy (`autopsy/`)                                                   │
│  • Domain: Open-Source Forensics, Sleuth Kit (TSK), Apache Solr Search      │
│  • Automation: Python/Jython Ingest Modules, Blackboard Schema, TSK CLI     │
│                                                                             │
│  [2] OpenText EnCase (`encase/`)                                            │
│  • Domain: Court-Validated Enterprise Forensics, E01/Ex01 Files, SAFE Agents│
│  • Automation: EnScript Object-Oriented Scripting, Evidence Processor (EEP) │
│                                                                             │
│  [3] Exterro FTK (`ftk/`)                                                   │
│  • Domain: Distributed Processing (DPE), KFF Hash Filtering, FTK Imager     │
│  • Automation: FTK Imager CLI Live RAM/Disk Acquisition, PostgreSQL Mining  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Application Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[autopsy/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/digital-forensics/autopsy)** | Open-Source Forensics & TSK | Custom Python Ingest modules, Solr keyword search, Blackboard artifacts |
| **[encase/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/digital-forensics/encase)** | Enterprise Forensics & eDiscovery | EnScript automation, E01 hash integrity, Evidence Processor tuning |
| **[ftk/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/digital-forensics/ftk)** | Distributed Forensic Processing | FTK Imager live RAM/E01 scripts, DPE cluster setup, PostgreSQL mining |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, DFIR automated lab pipelines, and forensic investigator systems. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
