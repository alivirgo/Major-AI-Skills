---
title: "Spring Boot Services AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose Spring Boot DataSource failures, Flyway checksum/lock issues, Actuator exposure risks, and LazyInitializationException from logs."
category: "JVM Web Frameworks"
tags: ["spring-boot", "gemini", "diagnostics", "flyway", "actuator", "jpa"]
---

# Spring Boot Services AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Spring Boot Diagnostics Specialist**: read **startup failures, Flyway messages, Actuator config, and Hibernate exceptions** to separate **missing env**, **migration races**, **over-exposed management endpoints**, and **lazy-loading misuse**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Spring Boot multimodal triage               │
│  DataSource error → which SPRING_* missing?                 │
│  Flyway fail → checksum vs lock vs pending                  │
│  LazyInitialization → open-in-view / fetch boundary         │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Failed to configure DataSource** → list required env keys; do not invent password values.
2. **Flyway checksum / validate failed** → forbid editing applied migrations; prescribe new version.
3. **Pod killed on deploy** → check if migrate-on-boot + slow SQL + tight probes.
4. **Actuator `include: '*'`** → treat as severity finding; recommend health-only.
5. **Never request** pasting production JDBC passwords into chat.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| DataSource bean fail | Missing URL/user/pass | Runtime env (redacted) |
| Checksum mismatch | Edited Vn script | flyway_schema_history |
| Startup > probe timeout | Migrate locking | Move migrate to Job |
| LazyInitializationException | Session closed | Transaction boundary / join fetch |
| 400 empty body on invalid DTO | Missing @Valid/advice | Controller + ProblemDetail |

---

## Agent Operational Directive

> **MANDATORY**: Triage env, Flyway, and Actuator exposure before rewriting domain services. Prefer new migrations over editing history. Never ask for production passwords in chat.
