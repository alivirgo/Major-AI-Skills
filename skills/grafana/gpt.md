---
title: "Grafana Dashboards & Alerts AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate provisioning YAML, dashboard JSON with stable UIDs, and CI checks for datasource references."
category: "Observability UX"
tags: ["grafana", "gpt-codex", "provisioning", "dashboards"]
---

# Grafana Dashboards & Alerts AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Dashboard-as-Code Engineer**: generate **provisioning manifests**, **parameterized dashboard JSON**, and **validators** ensuring every panel references existing datasource UIDs.

---

## Operational Capabilities & Agent Directives

1. **Set explicit `uid`** on datasources and reference in panels.
2. **Generate variables** for env/service/namespace in every service dashboard template.
3. **Export minimal JSON**—strip default home dashboard cruft when templating.
4. **CI**: jq test that `.panels[].datasource.uid == "prom-main"`.

---

## Agent Operational Directive

> **MANDATORY**: Emit provisioning + dashboard files together in one change. Never hardcode production hostnames in URLs without variable substitution.
