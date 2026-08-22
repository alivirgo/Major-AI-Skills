# Enterprise Systems, PLM & IT Service Management Suite (`skills/enterprise/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for mission-critical Enterprise Asset Management (EAM), Product Lifecycle Management (PLM), and IT Service Management (ITSM) software suites.

Each tool ecosystem includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (analytical diagnostics, systems safety, enterprise transactional integrity, root-cause troubleshooting).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal UI canvas inspection, Flow Designer triage, 3D Creo View markups, CMDB dependency maps).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (MBO Jython automation, Windchill Info*Engine XML, GlideRecord scripting, Table REST APIs).

---

## Enterprise Domain Architecture & Pipeline Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Enterprise Systems & ITOM Architecture                      │
│                                                                             │
│  [1] IBM Maximo (`ibm-maximo/`)                                             │
│  • Domain: Enterprise Asset Management (EAM), Work Orders, Prevent. Maint.  │
│  • Automation: MBO Jython Scripts, Maximo Integration Framework, OSLC REST  │
│                                                                             │
│  [2] PTC Windchill (`ptc-windchill/`)                                       │
│  • Domain: Enterprise PLM, Multi-CAD Data Vaulting, eBOM/mBOM, Change Mgmt  │
│  • Automation: OData REST APIs, LoadFromFile XML, MethodServer Tuning       │
│                                                                             │
│  [3] ServiceNow Desktop (`servicenow-desktop/`)                             │
│  • Domain: ITSM, ITOM Discovery, CMDB Governance, MID Server Orchestration  │
│  • Automation: GlideRecord / GlideAggregate, Script Includes, Table REST    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Application Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[ibm-maximo/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/enterprise/ibm-maximo)** | Enterprise Asset Management (EAM) | Jython Automation scripts, OSLC REST APIs, MIF JMS queue triage |
| **[ptc-windchill/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/enterprise/ptc-windchill)** | Product Lifecycle Management (PLM) | OData BOM traversal, Workgroup Manager CAD vaulting, CMII Change |
| **[servicenow-desktop/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/enterprise/servicenow-desktop)** | IT Service Management & ITOM | MID Server clustering, Flow Designer triage, GlideRecord JavaScript |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, enterprise DevOps automation scripts, and corporate systems administration tools. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
