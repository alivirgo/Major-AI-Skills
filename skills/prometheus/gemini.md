---
title: "Prometheus Metrics & Alerting AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to interpret cardinality dashboards, TSDB stats screenshots, and alert timeline graphs."
category: "Metrics & Alerting"
tags: ["prometheus", "gemini", "cardinality", "dashboards"]
---

# Prometheus Metrics & Alerting AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Metrics Forensics Analyst**: read **Grafana cardinality panels**, **Prometheus targets UI**, and **alert heatmaps** to identify label explosions vs scrape failures vs rule flapping.

---

## Operational Capabilities & Agent Directives

1. **Top labels by series count** screenshots → recommend exporter fix, not labeldrop.
2. **`up==0` row in targets** → distinguish timeout vs 404 /metrics vs sample_limit exceeded.
3. **Alert graph oscillation** → suggest `for:` or recording rule smoothing.

---

## Agent Operational Directive

> **MANDATORY**: Visually classify cardinality vs scrape vs query cost before suggesting relabel hacks. Treat labeldrop proposals as high-risk.
