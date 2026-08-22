# Enterprise Resource Planning (ERP) & Business Systems Suite (`skills/erp/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for tier-one Enterprise Resource Planning (ERP), supply chain, accounting, and business transactional systems.

Each tool ecosystem includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (analytical transaction validation, ledger posting consistency, three-tier architecture diagnostics, deadlock resolution).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal UI inspection, Role Center cues, ALV Grid table layouts, Status Bar error triage).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (AL/CAL codeunits, PyRFC / BAPI automation, PL/SQL APPS packages, SAP GUI Scripting COM APIs).

---

## ERP Domain Architecture & Pipeline Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Enterprise Resource Planning (ERP) Map                      │
│                                                                             │
│  [1] Microsoft Dynamics NAV / Business Central (`dynamics-nav/`)            │
│  • Domain: SMB/Enterprise Financials, Supply Chain, Posting Routines        │
│  • Automation: AL Extension Language, Event Subscribers, OData V4 APIs      │
│                                                                             │
│  [2] Oracle E-Business Suite (`oracle-ebs/`)                                │
│  • Domain: Global Financials (GL/AP/AR), Supply Chain, HR, Manufacturing    │
│  • Automation: APPS PL/SQL APIs, Concurrent Processing, FNDLOAD Migrations  │
│                                                                             │
│  [3] SAP GUI & NetWeaver / S/4HANA (`sap-gui/`)                             │
│  • Domain: Core Enterprise Business Transactions (FI, CO, MM, SD, PP)       │
│  • Automation: SAP GUI Scripting API (COM), PyRFC / BAPIs, ALV Grid Scrapers │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Application Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[dynamics-nav/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/erp/dynamics-nav)** | Dynamics NAV & Business Central | AL codeunit automation, OData credit auditing, Posting inconsistency triage |
| **[oracle-ebs/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/erp/oracle-ebs)** | Oracle E-Business Suite R12.2 | PL/SQL Concurrent Request Dispatcher, FNDLOAD pipelines, Forms JNLP debug |
| **[sap-gui/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/erp/sap-gui)** | SAP NetWeaver & S/4HANA GUI | Python COM GUI Scripting, PyRFC BAPI orders, ALV grid extraction |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, enterprise RPA automation pipelines, and corporate systems administration tools. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
