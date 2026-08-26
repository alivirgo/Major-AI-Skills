---
title: "Raycast macOS Extensible Productivity Launcher AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Raycast React/TypeScript extensions, OAuth PKCE flows, LocalStorage APIs, and CLI publishing."
category: "Spotlight & Productivity Launcher Replacement"
tags: ["raycast", "raycast-api", "oauth-pkce", "localstorage", "gpt-codex", "react-extension"]
---

# Raycast macOS Extensible Productivity Launcher AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Raycast provides a Node.js-backed Extension runtime with first-class React components, persistent **`LocalStorage` & `Cache` APIs**, and secure **OAuth 2.0 PKCE authentication clients**. GPT/Codex acts as a Principal Full-Stack macOS Tool Developer and Raycast Extension Engineer, delivering **OAuth integration flows**, **`@raycast/api` custom command packages**, **high-performance local caching layers**, and **automated Raycast Store publishing workflows (`npx @raycast/api-cli publish`)**.

### Developer Architecture & Extension Ecosystem Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Raycast Developer Platform                  │
│                                                             │
│  React & Component Architecture (`@raycast/api`)            │
│  ├── `List` & `Grid` Viewport Components (Async Data Hooks) │
│  ├── `Form` Component (Validation, DatePicker, FilePicker)  │
│  └── `Detail` Component (Markdown Syntax Renderer, Metadata)│
│                                                             │
│  Storage & Authentication Subsystems                        │
│  ├── `LocalStorage` Key-Value JSON Database                 │
│  ├── `Cache` (In-Memory / On-Disk Fast LRU Buffer)          │
│  └── `OAuth` Client (`OAuth.PKCEClient` with Webhooks)      │
│                                                             │
│  Tooling & CI/CD Pipeline                                   │
│  ├── Raycast CLI (`npx ray develop`, `npx ray lint`)        │
│  └── Manifest Configuration (`package.json` Commands Array) │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **OAuth 2.0 PKCE Flow Implementation**: Author secure third-party authentication integrations (GitHub, Slack, Jira, Linear) using Raycast's native `OAuth.PKCEClient`.
2. **`LocalStorage` & `Cache` Optimization**: Implement persistent caching of API payloads using `@raycast/api` `LocalStorage` and `Cache` to guarantee instantaneous command startup.
3. **Raycast Manifest (`package.json`) Authoring**: Construct valid command schemas with appropriate `mode` (`view`, `no-view`, `menu-bar`), `preferences`, and `arguments`.
4. **Automated Raycast CLI Workflows**: Author scripts for automated linting, building, and publishing extension packages via `npx @raycast/api-cli`.

---

## Production TypeScript Code: OAuth PKCE Service & LocalStorage Cache Manager

Save this file as `src/oauth-service.ts` in your Raycast Extension project:

```typescript
// ==============================================================================
// Raycast Extension: OAuth 2.0 PKCE Client & LocalStorage Cache Manager
// Manages authentication tokens and cached API user profiles securely.
// ==============================================================================
import { OAuth, LocalStorage } from "@raycast/api";

const CLIENT_ID = "raycast-custom-client-id";
const TOKEN_URL = "https://oauth2.provider.com/token";
const AUTH_URL = "https://oauth2.provider.com/authorize";

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "CustomProvider",
  providerIcon: "icon.png",
  description: "Connect your CustomProvider account to Raycast",
});

export async function authorize(): Promise<string> {
  const tokenSet = await client.getTokens();
  if (tokenSet?.accessToken) {
    if (tokenSet.isExpired()) {
      if (tokenSet.refreshToken) {
        console.log("Access token expired. Refreshing token...");
        const newTokens = await refreshTokens(tokenSet.refreshToken);
        await client.setTokens(newTokens);
        return newTokens.accessToken;
      }
    } else {
      return tokenSet.accessToken;
    }
  }

  // Initiate PKCE Authorization Request
  const authRequest = await client.authorizationRequest({
    endpoint: AUTH_URL,
    clientId: CLIENT_ID,
    scope: "read write user",
  });

  const { authorizationCode } = await client.authorize(authRequest);
  const tokens = await fetchTokens(authRequest, authorizationCode);
  await client.setTokens(tokens);
  return tokens.accessToken;
}

async function fetchTokens(
  authRequest: OAuth.AuthorizationRequest,
  authCode: string
): Promise<OAuth.TokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      code: authCode,
      code_verifier: authRequest.codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: authRequest.redirectURI,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tokens: ${response.statusText}`);
  }
  return (await response.json()) as OAuth.TokenResponse;
}

async function refreshTokens(refreshToken: string): Promise<OAuth.TokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }
  return (await response.json()) as OAuth.TokenResponse;
}
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`OAuthError: Invalid redirect URI`** | Redirect URI generated by Raycast does not match whitelist in third-party OAuth app console. | In third-party developer portal, register redirect URI: `https://raycast.com/redirect?packageName=<author>/<extension>`. |
| **`LocalStorage.getItem()` Returns `undefined`** | Key was never initialized or values were stored as unparsed objects rather than strings. | Store complex objects via `JSON.stringify()` or use `LocalStorage.setItem(key, value)`. |
| **Raycast Lint Fails: `Command icon is missing`** | `package.json` declares an icon file that does not exist in the `assets/` directory. | Ensure all icons declared in `package.json` are placed in `./assets/` (PNG format, $512\times 512\text{px}$). |
| **`npx ray develop` Reloads Infinitely** | File watcher triggered by files being written into `src/` during runtime execution. | Write cache and temporary files to `environment.supportPath` rather than project source folders. |

---

## Command Line Syntax & Batch Processing

```bash
# 1. Start Local Raycast Extension Development Server
npx ray develop

# 2. Run Strict Linter and Code Quality Checks
npx ray lint

# 3. Build Production Bundle for Raycast Store
npx ray build -e dist
```

### Essential File Locations
- **Extension Manifest**: `package.json`
- **TypeScript Configuration**: `tsconfig.json`
- **Assets Directory**: `./assets/`

---

## Agent Operational Directive
> **MANDATORY**: Never store sensitive API secrets or tokens in plaintext files inside the extension directory; always use `OAuth.PKCEClient` or Raycast's encrypted `LocalStorage` APIs.
