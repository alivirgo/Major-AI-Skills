---
name: spring-boot
description: "Operational skill for Spring Boot: starters, dependency injection, REST controllers, validation, profiles, Actuator, and test slices."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["spring-boot", "java", "rest", "dependency-injection", "actuator", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Spring Boot Services AI Skill Guide

## Overview & Engine Architecture

Spring Boot auto-configures a Spring application from starters on the classpath. Components are wired by dependency injection; web apps expose controllers or WebFlux handlers. Agents keep configuration in `application.yml` profiles, validate request bodies with Bean Validation, and use test slices (`@WebMvcTest`, `@DataJpaTest`) instead of only full-context boot tests.

```
Starters -> Auto-config -> ApplicationContext
                |
         Controllers / Services / Repositories
                |
         Embedded Tomcat (default servlet)
```

## When to use this skill

- Creating Java REST services with Spring Boot
- Structuring packages (controller/service/repository)
- Configuring profiles for local vs prod
- Writing focused MVC or JPA tests

## Operational directives

1. Prefer constructor injection over field `@Autowired`.
2. Use `@Valid` + constraint annotations on DTOs; return problem details on failure.
3. Externalize secrets via env / secrets manager - not checked-in YAML.
4. Enable Actuator carefully; lock down sensitive endpoints in prod.
5. Match Java LTS version to the Spring Boot generation in use.

## Controller sketch

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

## Commands

```bash
./mvnw spring-boot:run
./gradlew bootRun
./mvnw -Dtest=ItemControllerTest test
java -jar target/app.jar --spring.profiles.active=prod
```

## Common pitfalls

| Pitfall | Why it hurts | Fix |
| --- | --- | --- |
| Field injection | Hard to test | Constructor injection |
| God `@SpringBootTest` only | Slow CI | Test slices |
| Open Actuator in prod | Info leak | Secure / disable |
| Business logic in controllers | Unmaintainable | Service layer |

## Best practices

- Use Flyway/Liquibase for schema migrations.
- Prefer records or immutable DTOs at API boundaries.
- Centralize exception handling with `@ControllerAdvice`.
- Structured logging with correlation IDs for request traces.

## Limitations

- Reactive WebFlux is a different programming model than MVC.
- Native image (GraalVM) needs extra reachability config.
- Version upgrades across Boot majors can change defaults - read release notes.

## Related skills

- `@kotlin` - Kotlin idioms on Spring Boot
- `@docker` - packaging Boot jars
- `@graphql-apis` - Spring GraphQL when needed
