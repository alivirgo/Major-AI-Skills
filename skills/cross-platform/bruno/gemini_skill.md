---
title: "Bruno API Client AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Bruno API Client, GraphQL queries, Bru DSL markup, and HTTP diagnostics."
category: "Offline-First Open-Source API Client"
tags: ["bruno", "api-diagnostics", "graphql", "gemini", "http-debugging", "bru-markup"]
---

# Bruno API Client AI Skill Guide (Gemini)

## Overview & Engine Architecture
Bruno is an offline-first, open-source alternative to cloud-dependent API testing tools, organizing HTTP, GraphQL, and gRPC endpoints into Git-versioned folders using human-readable **Bru markup files (`.bru`)**. Gemini acts as an AI API Integration Engineer and Protocol Analyst, specializing in **multimodal response payload inspection**, **GraphQL query/variable authoring**, **HTTP latency and header debugging**, and **declarative Bru collection design**.

### System Architecture & Request Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                 Bruno Request Lifecycle Engine              │
│                                                             │
│  Collection & File Layout                                   │
│  ├── Plain Text Bru DSL Files (.bru format)                 │
│  ├── Environment Scopes (Global, Folder, Request Variables) │
│  └── Git Version Control Repository (Zero Cloud Lock-in)   │
│                                                             │
│  Execution & Verification Subsystem                         │
│  ├── HTTP / GraphQL / gRPC Transport Stack                  │
│  ├── Declarative Assertion Matrix (res.status, res.body)    │
│  └── Pre/Post Request JavaScript Sandbox Hooks              │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal API Response Triage**: Analyze screenshots of Bruno response windows, HTTP status codes, latency waterfalls, and payload diffs to identify server-side errors (4xx/5xx), payload truncation, and slow TTFB (Time to First Byte).
2. **GraphQL Query & Mutation Authoring**: Construct `.bru` GraphQL files with parameterized operation names, variables, and schema introspection headers.
3. **Environment & Path Variable Mapping**: Structure variable replacement tokens (`{{apiUrl}}`, `{{token}}`, `{{tenantId}}`) to ensure seamless switching between Local, Staging, and Production tiers.
4. **Automated Assertion Design**: Formulate robust declarative assertions (`res.body.items: length 10`, `res.headers["content-type"]: contains "json"`).

---

## Production Bru File Recipe: GraphQL Query with Variables

Save this file as `graphql/get-user-query.bru`:

```bru
meta {
  name: Fetch User GraphQL Profile
  type: graphql
  seq: 4
}

post {
  url: {{graphqlEndpoint}}
  body: graphql
  auth: bearer
}

auth:bearer {
  token: {{jwtToken}}
}

body:graphql {
  query GetUserProfile($userId: ID!, $includeHistory: Boolean!) {
    user(id: $userId) {
      id
      username
      email
      accountStatus
      orderHistory @include(if: $includeHistory) {
        orderId
        totalAmount
        createdAt
      }
    }
  }
}

body:graphql:vars {
  {
    "userId": "usr_9812401",
    "includeHistory": true
  }
}

assert {
  res.status: eq 200
  res.body.data.user.id: eq "usr_9812401"
  res.body.data.user.accountStatus: eq "ACTIVE"
  res.body.errors: isUndefined
}
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Response Window Shows `403 Forbidden` / Cloudflare Block** | Missing standard browser User-Agent headers or security origin headers. | 1. In Headers tab, add `User-Agent: Mozilla/5.0 ...` or explicit client header.<br>2. Add `Origin: {{originUrl}}`.<br>3. Check if IP requires VPN/Tailscale access. |
| **GraphQL Returns Status 200 but Payload Contains `errors`** | GraphQL standard returns HTTP 200 even when resolver exceptions occur. | 1. Add strict assertion: `res.body.errors: isUndefined`.<br>2. In Response view, inspect `errors[0].message` and `locations`.<br>3. Verify input variables match GraphQL schema types. |
| **Response Body Shows Garbled Binary Characters** | Server returned compressed Gzip/Brotli or binary file without automatic decompression. | 1. Verify `Accept-Encoding: gzip, deflate, br` header is handled.<br>2. Toggle view mode from Raw to Preview / JSON in Bruno footer.<br>3. Verify endpoint route (e.g. download endpoint vs JSON metadata endpoint). |
| **Variable Token Appears as Literal `{{token}}` in URL** | Typo in variable name or variable was defined in an inactive environment file. | 1. Check spelling in `environments/<env>.bru`.<br>2. Hover over variable in Bruno UI to check resolved tooltip value.<br>3. Check if variable was overwritten in Folder settings. |

---

## Command Line Syntax & Batch Testing

```bash
# Run Bruno Collection with JSON Reporter
npx @usebruno/cli run --env Production --output test-run.json --format json

# Execute Specific Folder with Custom Concurrency
npx @usebruno/cli run collections/auth/ --env Staging

# Run with Strict Fail-Fast Mode
npx @usebruno/cli run --bail
```

### Key Configuration Locations
- **Collection Config**: `bruno.json`
- **Environment Files**: `environments/*.bru`
- **Bruno App Preferences**: `~/.config/bruno`

---

## Agent Operational Directive
> **MANDATORY**: For GraphQL endpoints, always assert `res.body.errors: isUndefined` alongside `res.status: eq 200`. Use Git-friendly `.bru` files to enable distributed team collaboration.
