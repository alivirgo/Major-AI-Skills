---
name: prometheus
description: "Design Prometheus scrape configs, bounded-label metrics, and alert rules with symptom-first PromQL; avoid cardinality fires and silent relabel collisions agents cause."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["prometheus", "promql", "alertmanager", "cardinality", "scrape", "observability"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Prometheus Metrics & Alerting AI Skill Guide (Claude)

## Overview & Engine Architecture

Prometheus **pull-scrapes** HTTP `/metrics` endpoints on an interval, appends samples to a local **TSDB**, evaluates **recording/alerting rules**, and forwards alerts to **Alertmanager** for routing/silencing. Grafana queries Prometheus via PromQL. Agents optimize for **bounded cardinality**, **RED/USE** signal, and **actionable alerts**—not “scrape everything every 5s.”

```
┌─────────────────────────────────────────────────────────────┐
│                 Prometheus data path                        │
│                                                             │
│  Targets (apps, kube-state-metrics, exporters)              │
│       ↓ scrape (+ relabel_configs / metric_relabel_configs) │
│  TSDB (local) ← recording rules                             │
│       ↓ alert rules (for: duration)                         │
│  Alertmanager → routes / inhibits → on-call                 │
│       ↑ queries ← Grafana / API                             │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Adding scrape jobs, relabeling, recording rules, or alert rules.
- Debugging missing metrics, `up==0`, high cardinality, or slow PromQL.
- Designing histogram buckets and label sets for services.

**Do not use when**

- Long-term retention at petabyte scale → Thanos/Mimir/VictoriaMetrics (mention limits only).
- Log/trace analysis → Loki/Tempo (`@opentelemetry`, `@grafana`).
- **Fixing cardinality by `labeldrop` on distinguishing labels**—that silently corrupts series (see matrix).

---

## Operational Capabilities & Agent Directives

1. **Labels must be bounded**: no raw `user_id`, email, unbounded URL paths, or UUIDs as label values.
2. **Fix cardinality at the exporter** (template paths, status class `2xx`) before scrape hacks.
3. **`metric_relabel_configs`**: safe to **drop entire metrics** (`action: drop` on `__name__`); **never** `labeldrop`/`replace` that merges distinct series (pod, instance, le, quantile).
4. **Guard rails**: `sample_limit`, `label_limit`, `label_value_length_limit` on noisy jobs; alert on `prometheus_target_scrapes_exceeded_sample_limit_total`.
5. **Alerts**: page on user-visible symptoms (error rate, latency, saturation) with `for:` unless expr already windowed; every page links a runbook.
6. **Histograms**: use `_seconds` buckets aligned to SLOs; avoid default buckets hiding tail latency.
7. **Recording rules** for expensive dashboards/alerts; keep expr identical between alert and dashboard.
8. **relabel vs metric_relabel**: target metadata vs post-scrape samples—agents confuse these constantly.

---

## Production Example: scrape + alert + recording

`prometheus.yml` excerpt:

```yaml
scrape_configs:
  - job_name: api
    scrape_interval: 30s
    metrics_path: /metrics
    sample_limit: 10000
    static_configs:
      - targets: ["api:8080"]
        labels:
          service: api
          env: prod
    metric_relabel_configs:
      - source_labels: [__name__]
        regex: go_.*|process_.*
        action: drop
```

Alert + recording:

```yaml
groups:
  - name: api-slo
    rules:
      - record: job:api_http_requests:rate5m
        expr: sum(rate(http_requests_total{service="api"}[5m])) by (status)
      - alert: ApiHighErrorRate
        expr: |
          sum(rate(http_requests_total{service="api",status=~"5.."}[5m]))
          /
          sum(rate(http_requests_total{service="api"}[5m]))
          > 0.05
        for: 10m
        labels:
          severity: page
        annotations:
          summary: "API 5xx ratio > 5% for 10m"
          runbook_url: "https://wiki.example/runbooks/api-5xx"
```

PromQL snippets:

```promql
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service="api"}[5m])) by (le))
sum by (__name__) ({__name__=~".+"})  # cardinality exploration — run offline, not in prod UI habitually
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix |
| :--- | :--- | :--- |
| TSDB memory/CPU spike | High cardinality label | Find label via `topk`; fix exporter; drop whole metric if emergency |
| `rate()` gaps / nonsense | Counter reset or series collision | Check relabel merges; collision from labeldrop |
| `up==0` | Scrape fail, timeout, sample_limit | Target logs; increase timeout; fix exporter crash |
| Alerts flapping | Missing `for:` | Add `for: 5m` or improve expr window |
| Missing kube pod metrics | wrong SD config | Verify kubernetes_sd role/endpoints |
| Duplicate sample errors | Relabel normalized paths at scrape | Fix at source; never merge `/users/123` → `/users/:id` at scrape |

---

## Best Practices

1. RED for services; USE for nodes/datastores.
2. Metric names: `_total`, `_seconds`, `_bytes` suffix conventions.
3. Run `@grafana` dashboards from recording rules, not raw heavy queries on every refresh.
4. Test alert expr against historical range in Grafana Explore before paging.
5. Pair with `@kubernetes` service discovery and pod annotations for scrape.

---

## Limitations

- Single-server Prometheus HA is limited; federation/remote write adds ops complexity.
- Alertmanager routing/inhibition is separate YAML surface.
- Agents cannot see your on-call rotation—stop and ask for severity/runbook standards if missing.

---

## Related Skills

- `@grafana` — dashboards and unified alerting UX
- `@kubernetes` — pod/service discovery targets
- `@opentelemetry` — modern metric exposition
- `@nginx` — upstream latency at edge vs origin

---

## Agent Operational Directive

> **MANDATORY**: Never recommend `labeldrop` or value-normalizing relabel rules on labels that distinguish series (pod, instance, path, user). Emergency cardinality reduction drops **entire metrics** or fixes instrumentation. Every page alert includes `for:`, severity, and runbook_url. Set sample_limit on untrusted exporters.

---

## Source anchors (research)

- [Prometheus relabeling](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config)
- [Prometheus issue: silent series collision via relabel](https://github.com/prometheus/prometheus/issues/11725)
- [Grafana Cloud cardinality guidance (labeldrop rule)](https://github.com/grafana/skills/blob/main/skills/grafana-cloud/prometheus-cardinality-troubleshooter/SKILL.md)
- [sample_limit / scrape limits discussion](https://github.com/prometheus/prometheus/issues/11061)
