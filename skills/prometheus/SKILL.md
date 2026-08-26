---
name: prometheus
description: "Operational skill for Prometheus: scrape configs, PromQL, recording rules, alerting rules, cardinality control, and exporter hygiene."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["prometheus", "promql", "alerting", "metrics", "observability", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Prometheus Metrics & Alerting AI Skill Guide

## Overview & Engine Architecture

Prometheus scrapes metrics from HTTP endpoints on an interval, stores time series locally, and evaluates recording/alerting rules. PromQL queries aggregates over time. Agents design low-cardinality labels, write actionable alerts with `for:` durations, and avoid scrape configs that overwhelm the server.

```
Exporters / app /metrics
        ^ scrape
        |
  Prometheus server
   |- TSDB
   |- rule evaluator  -> Alertmanager
   |- PromQL API      -> Grafana
```

## When to use this skill

- Adding scrape jobs and relabeling
- Writing PromQL for dashboards and alerts
- Diagnosing high cardinality or slow queries
- Defining recording rules for expensive expressions

## Operational directives

1. Labels must be bounded (no raw user IDs, emails, or unbounded URLs as label values).
2. Alert on symptoms users feel (latency, error rate, saturation) plus a few causes.
3. Always set `for:` on alerts to absorb flakes unless the signal is already windowed.
4. Prefer recording rules for repeated heavy queries.
5. Keep scrape intervals realistic; not everything needs 5s.

## Scrape config sketch

```yaml
scrape_configs:
  - job_name: api
    metrics_path: /metrics
    static_configs:
      - targets: ["api:8080"]
        labels:
          service: api
          env: prod
```

## PromQL examples

```promql
# Request rate
sum(rate(http_requests_total{service="api"}[5m])) by (status)

# p95 latency from histogram
histogram_quantile(
  0.95,
  sum(rate(http_request_duration_seconds_bucket{service="api"}[5m])) by (le)
)

# Error ratio
sum(rate(http_requests_total{service="api",status=~"5.."}[5m]))
/
sum(rate(http_requests_total{service="api"}[5m]))
```

## Alert rule sketch

```yaml
groups:
  - name: api
    rules:
      - alert: ApiHighErrorRate
        expr: |
          (
            sum(rate(http_requests_total{service="api",status=~"5.."}[5m]))
            /
            sum(rate(http_requests_total{service="api"}[5m]))
          ) > 0.05
        for: 10m
        labels:
          severity: page
        annotations:
          summary: "API 5xx ratio > 5% for 10m"
          runbook_url: "https://wiki.example/runbooks/api-5xx"
```

## Best practices

- Use RED (Rate, Errors, Duration) for services; USE for resources.
- Name metrics with `_total`, `_seconds`, `_bytes` suffixes per conventions.
- Unit-test alert expressions against recorded fixtures when possible.
- Pair every page-level alert with a runbook link.

## Limitations

- Long-term retention usually needs Thanos, Mimir, or a vendor backend.
- Alertmanager routing/inhibition is a separate configuration surface.
- Histograms need explicit bucket design; bad buckets hide latency issues.

## Related skills

- `@grafana` - dashboards and alert UX on top of Prometheus
- `@opentelemetry` - producing metrics/traces from apps
- `@kubernetes` - scraping pod/service discovery targets
