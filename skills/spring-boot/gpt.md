---
title: "Spring Boot Services AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Spring Boot 3 controllers, validated DTOs, Flyway migrations, profile YAML, and Actuator lockdown without inventing secrets."
category: "JVM Web Frameworks"
tags: ["spring-boot", "flyway", "actuator", "validation", "gpt-codex"]
---

# Spring Boot Services AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Spring Boot Service Engineer**: emit **constructor-injected services**, **`@Valid` records**, **Flyway SQL**, **prod profiles**, and **narrow Actuator exposure**—never committed datasource passwords or `exposure.include=*`.

```
┌─────────────────────────────────────────────────────────────┐
│                 Spring Boot automation                      │
│  DTO+Valid → Service → Repository                           │
│  Flyway Vn__ → release migrate; Actuator health only        │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate controllers with constructor injection and `@Valid @RequestBody` records.
2. Set `spring.jpa.hibernate.ddl-auto=validate` when Flyway owns schema.
3. Emit `application-prod.yml` using `${SPRING_DATASOURCE_*}` placeholders only.
4. Restrict Actuator: `health,info` (+ authenticated prometheus if needed).
5. Prefer `@WebMvcTest` / `@DataJpaTest` skeletons alongside one smoke `@SpringBootTest`.

---

## Production YAML: Actuator lockdown

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      probes:
        enabled: true
  server:
    port: 8081  # optional separate management port behind private network
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| DataSource config fail | Env present in runtime | Wire SPRING_DATASOURCE_* |
| Flyway checksum | Diff on applied file | New versioned migration |
| Probe kill during migrate | Migrate on boot | CI/Job migrate + validate |
| LazyInitializationException | open-in-view | false + fetch strategy |

---

## Agent Operational Directive

> **MANDATORY**: Env secrets only. Flyway-owned schema. Narrow Actuator. Constructor injection + `@Valid`. No invented passwords.
