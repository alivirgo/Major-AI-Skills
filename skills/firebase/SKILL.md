---
name: firebase
description: "Design Firebase Auth, Firestore Security Rules, Cloud Functions, and FCM with Emulator-first testing—close open rules, keep Admin SDK server-only, and avoid emulator-only index false confidence."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["firebase", "firestore", "auth", "cloud-functions", "fcm", "security-rules", "emulator"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Firebase Platform AI Skill Guide (Claude)

## Overview & Engine Architecture

Firebase sits on a **Google Cloud project**: **Auth**, **Firestore** / Realtime Database, **Storage**, **Cloud Functions**, **Hosting**, and **FCM**. Client config is **public**; authorization is **Security Rules + ID tokens**, not obscurity. The **Admin SDK** bypasses Rules and must stay server-only. Agents write Rules first, test with the **Emulator Suite**, never set `FIREBASE_AUTH_EMULATOR_HOST` in production, and remember the Firestore emulator **does not enforce composite indexes**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Firebase client → data plane                  │
│                                                             │
│  Client SDKs (web / iOS / Android / Flutter)                │
│  ├── Public firebaseConfig (apiKey is not a secret)         │
│  └── ID token → Auth                                        │
│                                                             │
│  Firestore / Storage                                        │
│  ├── Security Rules (request.auth, resource.data, claims)   │
│  └── Indexes required in prod (emulator may skip)           │
│                                                             │
│  Trusted server                                             │
│  ├── Cloud Functions / your backend + Admin SDK             │
│  ├── Custom claims (small; force token refresh)             │
│  └── FCM (no full emulator — can hit real messaging)        │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Adding Auth + Firestore/Storage to mobile/web apps with Rules and Emulator tests.
- Implementing callable/HTTP Cloud Functions with least-privilege service accounts.
- Wiring FCM with server-side sends and careful prod/emulator boundaries.

**Do not use when**

- You need relational SQL, joins, and Postgres RLS as the primary model → `@supabase`.
- The task is only deploying a static/Next frontend with no Firebase backend → `@vercel` / `@nextjs`.
- Someone asks for `allow read, write: if true` in production, embedding service-account JSON in apps, or inventing GCP keys → refuse.

---

## Operational Capabilities & Agent Directives

1. **Client config is public**; protect data with Rules + Auth. Never ship service-account JSON to clients or public repos.
2. **Deny-by-default Rules**; grant by `request.auth.uid`, ownership fields, and validated `request.resource.data` shapes.
3. **Custom claims** for roles (`request.auth.token.admin`); keep claims small; after Admin SDK updates, client must re-auth or `getIdToken(true)`.
4. **Emulator Suite** for Rules unit tests; configure paths in `firebase.json`. Omit protocols in `FIREBASE_AUTH_EMULATOR_HOST` / `FIRESTORE_EMULATOR_HOST` (`127.0.0.1:9099`).
5. **Never set emulator host env vars in production**—Admin SDK will accept unsigned emulator tokens.
6. **Composite indexes**: emulator executes many queries without indexes; validate against a real project before prod (`failed-precondition` / index links in errors).
7. **Model for queries**; avoid unbounded collection scans; use pagination and collection-group indexes deliberately.
8. **Functions**: least-privilege IAM; validate auth on callables; region choice affects latency/cold starts.
9. **FCM**: no complete emulator—Functions emulator may call **real** FCM; gate sends in non-prod.
10. Separate **staging vs production** Firebase/GCP projects; set billing budgets.

---

## Production Example: ownership Rules + Emulator-ready project

`firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }
    function isOwner() {
      return signedIn() && resource.data.ownerId == request.auth.uid;
    }
    function isAdmin() {
      return signedIn() && request.auth.token.admin == true;
    }

    match /items/{itemId} {
      allow read: if isOwner() || isAdmin();
      allow create: if signedIn()
        && request.resource.data.ownerId == request.auth.uid
        && request.resource.data.keys().hasOnly(['ownerId', 'sku', 'qty', 'updatedAt'])
        && request.resource.data.qty is int
        && request.resource.data.qty >= 0;
      allow update: if (isOwner() || isAdmin())
        && request.resource.data.ownerId == resource.data.ownerId;
      allow delete: if isOwner() || isAdmin();
    }
  }
}
```

`firebase.json` (excerpt):

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "functions": { "port": 5001 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

Local loop (never export emulator hosts into prod shells):

```bash
firebase login
firebase use staging
firebase emulators:start --only auth,firestore,functions
firebase deploy --only firestore:rules,firestore:indexes --project staging
# After Admin setCustomUserClaims: client getIdToken(true)
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Open data / unexpected reads | `allow … if true` or missing ownership | Tighten Rules; Emulator Rules tests |
| `PERMISSION_DENIED` after claim change | Stale ID token | `getIdToken(true)` or re-login |
| `failed-precondition` / index required | Missing composite index (works in emulator) | Deploy index; test against real Firestore |
| Admin works in app binary | Service account or privileged API in client | Move to Functions/backend |
| Auth emulator tokens accepted in prod | `FIREBASE_AUTH_EMULATOR_HOST` set | Unset in prod; fail deploy if present |
| FCM send in “local” test hits real devices | No FCM emulator | Feature-flag; use test devices only |
| Cold start / region latency | Functions region far from users | Match region; prefer min instances only when justified |
| SHA / redirect errors (Auth) | Platform allowlist mismatch | Add SHA fingerprints / authorized domains |

---

## Best Practices

1. Rules Playground for quick checks; automated Emulator tests for CI gates.
2. Batch writes / transactions for multi-doc consistency; watch Rules `get()` costs (billed reads).
3. Prefer custom claims over embedding role docs lookups when hot-path.
4. Monitor quotas; billing alerts on the GCP account.
5. Storage Rules mirror Auth patterns; validate `contentType` / size on writes.
6. Document required indexes in `firestore.indexes.json` and review in PR.

---

## Limitations

- Firestore is not SQL—joins and multi-field OR patterns are constrained.
- Emulator transaction locking and index behavior differ from production.
- FCM and some Auth provider flows need real platform config.
- Stop and ask if project IDs, service accounts, or Auth provider keys are missing—do not invent them.

---

## Related Skills

- `@flutter` / `@react-native` — common Firebase mobile clients
- `@supabase` — Postgres BaaS alternative
- `@vercel` — frontends that call Firebase APIs
- `@gcloud-cli` — underlying GCP IAM, billing, and Functions ops

---

## Agent Operational Directive

> **MANDATORY**: Treat client Firebase config as public. Enforce access in Security Rules and server Admin SDK only. Never commit service accounts or leave open Rules. Test Rules in emulators, but validate composite indexes against a real project. Never set `FIREBASE_AUTH_EMULATOR_HOST` in production.

---

## Source anchors (research)

- [Fix insecure Firestore rules](https://firebase.google.com/docs/firestore/security/insecure-rules)
- [Security Rules and Authentication](https://firebase.google.com/docs/rules/rules-and-auth)
- [Custom claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Emulator Suite install & Rules paths](https://firebase.google.com/docs/emulator-suite/install_and_configure)
- [Auth emulator + Admin SDK warning](https://firebase.google.com/docs/emulator-suite/connect_auth)
- [Firestore emulator index caveat](https://firebase.google.com/docs/emulator-suite/connect_firestore)
