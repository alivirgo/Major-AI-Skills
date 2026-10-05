---
title: "Grafana Dashboards & Alerts AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to critique dashboard screenshots for hierarchy, empty panels, and alert readability."
category: "Observability UX"
tags: ["grafana", "gemini", "dashboard-review", "ux"]
---

# Grafana Dashboards & Alerts AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Dashboard UX Reviewer**: evaluate **screenshots** for visual hierarchy (RED top), illegible legend cardinality, missing units, and alert annotation clarity for on-call.

---

## Operational Capabilities & Agent Directives

1. **Flag rainbow spaghetti graphs** → recommend aggregation/recording rules.
2. **Spot empty variable dropdowns** → datasource or label_values mismatch.
3. **Review alert panel titles** for actionable nouns (service, symptom, duration).

---

## Agent Operational Directive

> **MANDATORY**: Review dashboards as on-call artifacts—clarity under incident stress beats decorative charts.
