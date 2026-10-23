---
name: spring-boot
description: "Ship Spring Boot 3 services with profiles, Bean Validation, Flyway/Liquibase release migrations, locked-down Actuator, and test slices agents routinely skip."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["spring-boot", "java", "flyway", "actuator", "validation", "jpa", "profiles"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Spring Boot Services AI Skill Guide (Claude)

## Overview & Engine Architecture

Spring Boot **auto-configures** a Spring `ApplicationContext` from **starters** on the classpath. Web apps expose **MVC controllers** (embedded Tomcat) or **WebFlux** handlers. Configuration is **profile- and env-driven** (`application.yml` + `SPRING_DATASOURCE_*`). Agents prefer **constructor injection**, **Bean Validation** on DTOs, **Flyway/Liquibase** for schema (ideally as an explicit release step in prod), and **Actuator** limited to health/probes—never open `env`/`heapdump` to the internet.

```
┌─────────────────────────────────────────────────────────────┐
│                 Spring Boot request path                      │
│                                                             │
│  Client → LB / @nginx                                       │
│       → embedded Tomcat (servlet) or Netty (WebFlux)        │
│       → Filter chain / Security                             │
│       → @RestController → @Service → @Repository / JPA      │
│            └── @postgresql (+ pool: HikariCP)               │
│                                                             │
│  Boot lifecycle                                             │
│  ├── Auto-config from starters                              │
│  ├── Flyway/Liquibase (dev migrate / prod validate+job)     │
│  └── Actuator: health/liveness/readiness (narrow exposure)  │
│                                                             │
│  Async: @Async / Spring AMQP / Kafka — not the HTTP thread  │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Building Java (or Kotlin) REST services with Spring Boot 3.x.
- Structuring controller/service/repository, profiles, and focused tests.
- Wiring Flyway/Liquibase and production Actuator exposure safely.

**Do not use when**

- The stack is reactive end-to-end and the team is not on WebFlux idioms—do not casually mix blocking JPA on `elastic` threads.
- Infrastructure-only changes belong in `@terraform` / `@kubernetes` without app code.
- Someone asks to expose Actuator `env`/`shutdown`/`heapdump` publicly → refuse; lock down or disable.

---

## Operational Capabilities & Agent Directives

1. **Constructor injection only** for components; avoid field `@Autowired` (harder tests, hidden deps).
2. **Validate at the edge**: `@Valid` + `@NotBlank`/`@Size` on request records; `@ControllerAdvice` → RFC 7807 problem details.
3. **Secrets via env / secret store**: `SPRING_DATASOURCE_PASSWORD`, etc.—never commit prod passwords in YAML.
4. **Migrations**: Flyway/Liquibase versioned SQL; in production prefer **migrate in release job**, app profile **validate** (avoid N pods racing long locks on startup).
5. **Actuator**: `management.endpoints.web.exposure.include=health,info` (add `prometheus` only if scraped privately); secure or disable sensitive endpoints.
6. **Test slices**: `@WebMvcTest`, `@DataJpaTest` over only `@SpringBootTest` for speed; use `@SpringBootTest` for wiring smoke.
7. **Java LTS ↔ Boot generation**: Boot 3 requires Java 17+; match toolchain in CI and `@docker` base images.

---

## Production Example: API + Flyway + Actuator

`application.yml` (non-secret defaults):

```yaml
spring:
  application:
    name: items-api
  jpa:
    open-in-view: false
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      probes:
        enabled: true

---
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
  flyway:
    # Prefer CI migrate; app validates schema at boot
    enabled: true
```

Controller + DTO:

```java
@RestController
@RequestMapping("/api/items")
public class ItemController {
  private final ItemService items;

  public ItemController(ItemService items) {
    this.items = items;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ItemResponse create(@Valid @RequestBody ItemRequest body) {
    return items.create(body);
  }
}

public record ItemRequest(
    @NotBlank @Size(max = 64) String sku,
    @Min(0) int qty
) {}
```

Flyway: `src/main/resources/db/migration/V1__items.sql`

```sql
CREATE TABLE items (
  id           BIGSERIAL PRIMARY KEY,
  sku          VARCHAR(64) NOT NULL UNIQUE,
  qty          INT NOT NULL CHECK (qty >= 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Commands:

```bash
./mvnw -DskipTests package
./mvnw flyway:migrate   # release job against prod URL from CI secrets
java -jar target/items-api.jar --spring.profiles.active=prod
./mvnw -Dtest=ItemControllerTest test
```

Optional prod-only validate strategy (conceptual):

```java
@Bean
@Profile("prod")
public FlywayMigrationStrategy validateOnly() {
  return Flyway::validate;
}
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `Failed to configure a DataSource` | Missing JDBC URL/driver starter | Set `SPRING_DATASOURCE_*`; add `postgresql` driver |
| Flyway checksum mismatch | Edited applied migration | Never edit applied versions; add new `Vn__` repair only with ops approval |
| Long startup / probe kills pod | Migrate on boot under lock + slow SQL | Move migrate to Job; shorten startup path; tune probes |
| Actuator leaks config | Broad `exposure.include=*` | Restrict to health/info; authenticate management port |
| LazyInitializationException | `open-in-view` + lazy nav after session | `open-in-view: false`; fetch joins / DTO queries |
| Slow CI | Only full `@SpringBootTest` | Add `@WebMvcTest` / `@DataJpaTest` slices |
| Validation returns empty 400 | Missing `@Valid` / advice | Add `@Valid` + `@ControllerAdvice` ProblemDetail |

---

## Best Practices

1. Immutable API records/DTOs; map to entities in the service layer.
2. Central `@ControllerAdvice` for exceptions; structured logs with correlation IDs.
3. Hikari pool sized to DB limits (`@postgresql`); fail fast on migrate validate errors.
4. Use `@Transactional` on services, not controllers; keep transactions short.
5. Prefer `@Async` + broker (or queue) for email/webhooks—do not block Tomcat threads.
6. Native image (GraalVM) needs extra reachability—treat as a separate project track.

---

## Limitations

- MVC vs WebFlux are different programming models; do not mix blocking JPA on event-loop threads.
- Boot major upgrades change defaults (Jakarta EE, Flyway major)—read migration guides.
- Multi-module / multi-tenant schemes need explicit design beyond starters.
- Stop and ask if prod datasource credentials, migrate ownership, or Actuator network exposure is unclear.

---

## Related Skills

- `@postgresql` — indexes, locks, pool sizing under Hikari
- `@docker` — JDK runtime images and healthchecks hitting `/actuator/health`
- `@kubernetes` — probes using liveness/readiness Actuator paths
- `@redis` — cache or session when added via Spring Data Redis
- `@kotlin` — idiomatic Spring Boot on Kotlin

---

## Agent Operational Directive

> **MANDATORY**: Constructor injection, `@Valid` DTOs, and env-backed secrets. Schema via Flyway/Liquibase—prefer release-job migrate + boot validate in prod. Lock Actuator exposure. Prefer test slices. Never invent datasource passwords or open sensitive Actuator endpoints.

---

## Source anchors (research)

- [Spring Boot Actuator endpoints](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html)
- [Spring Boot 3 migration guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide)
- Production pattern: decouple Flyway migrate from multi-replica app startup
