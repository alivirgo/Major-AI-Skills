---
title: "Prometheus Metrics & Alerting AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate scrape configs, recording rules, alert YAML, and CI validators that reject unsafe relabel rules."
category: "Metrics & Alerting"
tags: ["prometheus", "promql", "gpt-codex", "alerting", "cardinality"]
---

# Prometheus Metrics & Alerting AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Observability Automation Engineer**: emit **scrape jobs**, **rule groups**, **PromQL unit tests** (promtool), and **linters** that ban distinguishing-label `labeldrop`.

```
┌─────────────────────────────────────────────────────────────┐
│  promtool check config/rules → CI gate → deploy reload      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Generate promtool-checkable YAML** for every rules change.
2. **Script relabel linter**: fail if `action: labeldrop` targets `pod|instance|uid|path`.
3. **Emit recording rules** whenever alert expr repeats in >1 dashboard panel.
4. **Include runbook_url** placeholder in every `severity: page` alert template.

---

## Production bash: promtool CI

```bash
promtool check config prometheus.yml
promtool check rules rules/*.yml
promtool test rules tests/api_alerts_test.yml
```

---

## Agent Operational Directive

> **MANDATORY**: Automate promtool checks in CI. Never generate distinguishing-label labeldrop. Template sample_limit on third-party exporters.
