---
name: firebase
description: "Operational skill for Firebase: Auth, Firestore/RTDB rules, Cloud Functions, FCM, Emulator Suite, and client SDK security boundaries."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["firebase", "firestore", "auth", "cloud-functions", "fcm", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Firebase Platform AI Skill Guide

## Overview & Engine Architecture

Firebase provides Auth, Firestore/Realtime Database, Storage, Cloud Functions, Hosting, and FCM under Google Cloud projects. Security is enforced by Security Rules and Admin SDK privileges - not by hiding client config. Agents design rules first, use the Emulator Suite for local tests, and keep service-account credentials server-only.

```
Client SDKs (anon/authenticated)
      |
 Auth tokens
      |
 Firestore / Storage (+ Security Rules)
      |
 Cloud Functions (Admin SDK) / FCM
```

## When to use this skill

- Adding Firebase Auth and Firestore to mobile/web apps
- Writing and testing Security Rules
- Implementing callable/HTTP Cloud Functions
- Wiring push notifications (FCM) safely

## Operational directives

1. Treat client Firebase config as public; protect data with Rules + Auth claims.
2. Never embed service account JSON in apps or public repos.
3. Model Firestore for query patterns; avoid unbounded collection scans.
4. Test Rules with Emulator Suite before production.
5. Use least-privilege IAM on Functions service accounts.

## Firestore rules sketch

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{itemId} {
      allow read: if request.auth != null
                   && resource.data.ownerId == request.auth.uid;
      allow create: if request.auth != null
                    && request.resource.data.ownerId == request.auth.uid
                    && request.resource.data.keys().hasOnly(['ownerId', 'sku', 'qty'])
                    && request.resource.data.qty is int
                    && request.resource.data.qty >= 0;
      allow update, delete: if request.auth != null
                            && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

## Commands

```bash
firebase login
firebase init
firebase emulators:start
firebase deploy --only firestore:rules,functions
```

## Common pitfalls

| Pitfall | Why it hurts | Fix |
| --- | --- | --- |
| Open Rules (`allow read, write: if true`) | Data breach | Auth + ownership checks |
| Admin SDK in client | Full privilege leak | Server/Functions only |
| Unindexed queries | Runtime failures | Composite indexes |
| Trusting client fields blindly | Privilege escalation | Validate in Rules/Functions |

## Best practices

- Prefer custom claims for roles; keep claims small and rotate thoughtfully.
- Batch writes and use transactions for multi-doc consistency.
- Separate staging projects from production.
- Monitor usage quotas and set budget alerts on the GCP billing account.

## Limitations

- Firestore is not a relational SQL engine - joins are application-side.
- Cold starts and region choice affect Functions latency.
- Some Auth providers need platform-specific SHA/URL allowlists.

## Related skills

- `@flutter` / `@react-native` - common Firebase clients
- `@supabase` - alternate BaaS with Postgres
- `@vercel` - hosting frontends that call Firebase
