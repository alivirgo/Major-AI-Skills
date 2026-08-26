---
name: opentelemetry
description: "Operational skill for agents to instrument services with OpenTelemetry - traces, metrics, logs, SDKs, collectors, and context propagation."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["opentelemetry", "otel", "tracing", "metrics", "observability", "collector"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# OpenTelemetry Observability AI Skill Guide

## Overview

OpenTelemetry (OTel) is a vendor-neutral standard for **traces**, **metrics**, and **logs**. Applications use language SDKs/APIs; the **OpenTelemetry Collector** receives, processes, and exports telemetry to backends (Jaeger, Prometheus, cloud APM). Agents should prioritize correct context propagation and low-cardinality attributes over dumping every field into spans.

```
App SDK (traces/metrics/logs)
        |
        | OTLP
        v
OTel Collector (receivers -> processors -> exporters)
        |
        +--> Tempo/Jaeger (traces)
        +--> Prometheus/Mimir (metrics)
        +--> Loki/ELK (logs)
```

## When to use

- Adding instrumentation to HTTP/gRPC clients and servers
- Designing Collector pipelines and sampling strategies
- Debugging missing spans, broken trace IDs, or cardinality explosions
- Standardizing attributes (`service.name`, `deployment.environment`)

## Operational directives

1. Always set `service.name` (and ideally `service.version`) via resource attributes.
2. Propagate W3C Trace Context (`traceparent`) across process boundaries.
3. Prefer semantic conventions for HTTP, DB, messaging attributes.
4. Sample thoughtfully in production - head sampling or tail sampling in Collector.
5. Avoid high-cardinality labels (raw user IDs, unbounded URLs) on metrics.

## Concrete examples

### Collector pipeline sketch

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
processors:
  batch: {}
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
exporters:
  otlp/tempo:
    endpoint: tempo:4317
    tls: { insecure: true }
  prometheus:
    endpoint: 0.0.0.0:8889
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp/tempo]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheus]
```

### Node.js manual span sketch

```javascript
const { trace } = require("@opentelemetry/api");
const tracer = trace.getTracer("api");

async function createOrder(req) {
  return tracer.startActiveSpan("createOrder", async (span) => {
    span.setAttribute("order.items", req.items.length);
    try {
      const id = await saveOrder(req);
      span.setAttribute("order.id", id);
      return id;
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: 2, message: String(err) });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

### Propagation check

```bash
# Expect traceparent on outbound calls; verify backend shows one trace ID
curl -sI https://api.example.com/health | tr -d '\r' | grep -i trace
```

## Common failure modes

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| Orphan spans | Missing propagation | Inject/extract TraceContext |
| Huge bills / load | Over-instrumentation | Sample; drop noisy spans |
| Useless metrics | High cardinality | Bound label sets |
| No data in backend | Exporter endpoint/TLS | Collector logs; otel-debug |

## Best practices

1. Auto-instrument frameworks first; add manual spans at business boundaries.
2. Keep Collector config in Git; use processors for redaction (PII scrubbing).
3. Correlate logs with `trace_id` / `span_id` fields.
4. Define SLOs from RED/USE metrics derived from OTel, not ad-hoc counters only.

## Limitations

- Spec and semantic conventions evolve - pin SDK versions.
- Logs signal maturity varies by language; confirm SDK support.
- OTel does not replace on-call process or runbooks.

## Related skills

- `kubernetes` - sidecars/DaemonSets for Collector deployment
- `elasticsearch` - log backend often paired with traces
- `docker` - local Collector + app compose stacks
- `nginx-hardening` - edge headers and tracing passthrough
