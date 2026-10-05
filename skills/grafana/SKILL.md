---
name: grafana
description: "Build operable Grafana dashboards with template variables, provisioning-as-code, and unified alerts wired to Prometheus/Loki; avoid high-cardinality panels agents love to ship."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["grafana", "dashboards", "alerting", "provisioning", "observability", "prometheus"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Grafana Dashboards & Alerts AI Skill Guide (Claude)

## Overview & Engine Architecture

Grafana visualizes telemetry from **data sources** (Prometheus, Loki, Tempo, CloudWatch, …) via **dashboards** (panels + variables) and **unified alerting** (multi-source rules → contact points). Agents design **on-call-first layouts** (RED at top), **provision JSON/YAML in Git**, and keep alert expressions **identical** to `@prometheus` rule sources of truth.

```
┌─────────────────────────────────────────────────────────────┐
│                 Grafana operational stack                   │
│                                                             │
│  Data sources (Prometheus/Loki/…)                           │
│       ↓ queries (PromQL/LogQL)                              │
│  Dashboards (variables, rows, panels)                       │
│  Unified alerting → contact points → Slack/PagerDuty        │
│  Provisioning: datasources.yaml + dashboards/*.json         │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Building service SLO dashboards, infra overviews, or migration from click-ops UI to Git.
- Wiring datasource UIDs, folder RBAC, and alert routes with runbooks.
- Debugging “no data”, variable cascades, or alert notification storms.

**Do not use when**

- Defining canonical alert rules without Prometheus—prefer recording/alert rules in Prometheus when already used; Grafana alerts duplicate logic if unmanaged.
- SSO/LDAP enterprise auth design (deployment-specific pointers only).

---

## Operational Capabilities & Agent Directives

1. **One dashboard = one operational question** (on-call service view vs capacity planning).
2. **Variables**: `env`, `namespace`, `service` via `label_values`; never hardcode prod names in panel queries.
3. **Top row RED**: request rate, error ratio, latency percentiles from recording rules when available.
4. **Limit series per panel**; use aggregations (`sum by (status)`)—no 500-line legends.
5. **Provision critical dashboards** under `grafana/provisioning/dashboards/`; review in PRs like code.
6. **Alerts**: severity label, `runbook_url` annotation, mute windows documented; test contact point in staging.
7. **Datasource UIDs stable** in JSON—random UID breaks provisioning across envs; set explicitly.
8. **Explore** for ad-hoc debug; durable knowledge lives in dashboards/runbooks, not screenshots.

---

## Production Example: provisioning + panel query

`provisioning/datasources/prometheus.yaml`:

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    uid: prom-main
    isDefault: true
    jsonData:
      timeInterval: 30s
```

Panel PromQL (uses variables):

```promql
sum(rate(http_requests_total{service="$service", env="$env"}[5m])) by (status)
```

Variable query example:

```text
label_values(http_requests_total{env="$env"}, service)
```

Unified alert sketch (mirror Prometheus rule):

- Condition: error ratio > 5% for 10m
- Labels: `severity=page`, `service=$service`
- Annotations: summary + `runbook_url`
- Contact point: on-call Slack with severity routing

---

## Technical Troubleshooting Matrix

| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| All panels “No data” | Datasource URL/UID drift | Fix provisioning UID; test Explore |
| Variable empty | Label mismatch or ACL | Check metric exists for `env`; widen metric selector |
| Slow dashboard | High-cardinality query | Recording rules; reduce `$__interval` abuse |
| Alert never fires | Grafana rule vs Prometheus duplicate | Single source of truth; align expr |
| Alert storms | Missing `for` / no inhibit | Add pending period; route warnings separately |
| Broken JSON on deploy | Dashboard export noise | Strip ephemeral ids; pin schemaVersion thoughtfully |

---

## Best Practices

1. Units on every axis (s, bytes, percent, ops/s).
2. Annotations for deploy markers (GitOps sync times from `@argocd`).
3. Folder per team/env; RBAC least privilege.
4. Version control + optional dashboard lint in CI (`@github-actions`).
5. Link panels to runbooks and related `@prometheus` alert names.

---

## Limitations

- Some plugins and SSO features are enterprise-licensed.
- Grafana alerting availability depends on Grafana itself—design fallbacks for observability stack outages meta-alerts carefully.
- Stop and ask if datasource credentials, org IDs, or contact point tokens are required.

---

## Related Skills

- `@prometheus` — metrics backend and recording rules
- `@kubernetes` — kube dashboards and default metrics
- `@opentelemetry` — trace/log correlation in Explore
- `@nginx` — edge latency panels vs origin

---

## Agent Operational Directive

> **MANDATORY**: Provision production-critical dashboards and datasource UIDs as code. Use template variables for env/service—no hardcoded prod labels in queries. Keep alert expressions synchronized with Prometheus rules or document intentional divergence. Cap panel cardinality; prefer recording rules over raw high-cardinality PromQL in every refresh.

---

## Source anchors (research)

- [Grafana provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [Unified alerting](https://grafana.com/docs/grafana/latest/alerting/)
- Community: UID stability in dashboard JSON; variable cascade failures
