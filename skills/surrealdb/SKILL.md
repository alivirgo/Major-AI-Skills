---
name: surrealdb
description: "Design multi-model schemas and query SurrealDB using SurrealQL; implement graph relations, live queries, record links, and granular access rules."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-13"
tags: ["surrealdb", "surrealql", "multimodel", "graph-database", "live-queries", "nosql", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# SurrealDB Multi-Model & Graph Database AI Skill Guide

## Overview & Engine Architecture

SurrealDB is a cloud-native, multi-model database implemented in Rust that unifies document, relational, graph, vector, and geospatial data under a single query engine: **SurrealQL**. SurrealDB eliminates the need for separate databases by supporting bidirectional graph edges (`RELATE user:alice->purchased->product:laptop`), embedded document structures, ACID transactions, live streaming queries via WebSockets, and fine-grained record-level access control permissions.

Claude operates as a Principal Database Architect, specializing in **SurrealQL query optimization**, **SCHEMAFULL schema definitions**, **bidirectional graph edge modeling**, **embedded vector indexing**, and **declarative row-level security permissions (`DEFINE ACCESS`)**.

### SurrealDB Engine Topology

```
┌─────────────────────────────────────────────────────────────┐
│                 SurrealDB Multi-Model Engine                │
│                                                             │
│  Client Ingress (WebSockets, HTTP REST, SDKs)               │
│  ├── SurrealQL Query Engine & Live Query Subscriptions     │
│  └── Granular Record Security (`PERMISSIONS FOR select...`) │
│                                                             │
│  Logical Hierarchy                                          │
│  └── Root ──> Namespaces (`prod`) ──> Databases (`ecommerce`)│
│                                                             │
│  Multi-Model Capabilities                                   │
│  ├── Document Store (JSON Objects & Nested Arrays)          │
│  ├── Graph Edge Engine (`RELATE a->edge->b SET date = ...`)  │
│  ├── Vector Search (HNSW / Flat Vector Indexing & KNN)      │
│  └── Full-Text Search (Analyzers, Tokenizers, Scoring)      │
│                                                             │
│  Pluggable Storage Backends                                 │
│  └── Memory (Dev) | RocksDB (Local Single-Node) | TiKV (Dist)│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Explicit Schema Enforcement**: Always define production tables as `SCHEMAFULL` to enforce strict type checking, field constraints, and indexing, preventing unstructured drift.
2. **Leverage Native Graph Traversals**: Use `RELATE` and arrow syntax (`->edge->target`) rather than relational table joins. Use the `FETCH` keyword to hydrate related entities in a single query pass without client round-trips.
3. **Declare Row-Level Security Rules**: Define table and field access permissions (`PERMISSIONS FOR select, update, delete WHERE ...`) to enforce authorization logic directly inside the database engine.
4. **Real-Time Live Queries**: Use `LIVE SELECT` over WebSocket connections for reactive user interfaces, ensuring changes are pushed immediately to subscribed clients.

---

## Production SurrealQL Schema & TypeScript Client Automation

### 1. Production Schema Definition (`schema.surql`)

```sql
-- Define Namespace and Database
DEFINE NAMESPACE enterprise;
DEFINE DATABASE store;

USE NS enterprise DB store;

-- Define User Table (SCHEMAFULL with Granular Permissions)
DEFINE TABLE user SCHEMAFULL
  PERMISSIONS
    FOR select WHERE id = $auth.id OR $auth.role = 'admin'
    FOR update WHERE id = $auth.id
    FOR delete NONE;

DEFINE FIELD email ON user TYPE string ASSERT string::is::email($value);
DEFINE FIELD name ON user TYPE string;
DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now();
DEFINE INDEX user_email_idx ON user FIELDS email UNIQUE;

-- Define Product Table
DEFINE TABLE product SCHEMAFULL;
DEFINE FIELD title ON product TYPE string;
DEFINE FIELD price ON product TYPE number ASSERT $value >= 0;
DEFINE FIELD tags ON product TYPE array<string>;

-- Define Graph Edge: User -> Purchased -> Product
DEFINE TABLE purchased SCHEMAFULL TYPE RELATION FROM user TO product;
DEFINE FIELD timestamp ON purchased TYPE datetime DEFAULT time::now();
DEFINE FIELD quantity ON purchased TYPE int ASSERT $value > 0;
```

### 2. TypeScript SDK Client Query & Graph Traversal (`src/surreal_app.ts`)

```typescript
import { Surreal } from "surrealdb";

async function main() {
  const db = new Surreal();

  try {
    await db.connect("ws://127.0.0.1:8000/rpc");
    await db.use({ namespace: "enterprise", database: "store" });

    // Authenticate as system user or token
    await db.signin({
      username: "root",
      password: "securepassword",
    });

    // 1. Create records
    const [user] = await db.create("user:alice", {
      name: "Alice Smith",
      email: "alice@example.com",
    });

    const [product] = await db.create("product:laptop", {
      title: "Pro Workstation 16",
      price: 2499.00,
      tags: ["hardware", "computing"],
    });

    // 2. Create Graph Relationship
    await db.query(`
      RELATE $user->purchased->$product
      SET quantity = 1, timestamp = time::now();
    `, { user: user.id, product: product.id });

    // 3. Graph Query with traversal and projection
    const [orders] = await db.query<[any[]]>(`
      SELECT
        id,
        name,
        ->purchased->product.* AS bought_products
      FROM user:alice;
    `);

    console.log("Graph traversal result:", JSON.stringify(orders, null, 2));
  } finally {
    await db.close();
  }
}

main().catch(console.error);
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`There was a problem with the database: Specify a namespace and database`** | Session was authenticated without executing `USE NS ... DB ...` context. | Send `USE NS <namespace> DB <database>` before issuing record queries or pass `namespace` / `database` in client initialization. |
| **`Permissions denied on table`** | Requesting user does not satisfy the `PERMISSIONS FOR ... WHERE ...` clause on the target table. | 1. Inspect `$auth` session variables in client token.<br>2. Test query in `surreal sql` as root administrator to isolate logic. |
| **`Database storage engine file locked: rocksdb`** | Another SurrealDB process or test runner is currently holding the single-instance RocksDB file lock. | Stop conflicting processes (`pkill surreal`) or switch to distributed storage (`tikv://`) for multi-worker concurrency. |
| **Record relation error: `Not a valid record ID`** | Record IDs in SurrealDB require the format `table:id` (e.g., `user:101`). Plain strings fail validation. | Ensure foreign keys and edge pointers include table prefixes (`record('user', 'alice')`). |

---

## Command Line Syntax & Operational Recipes

```bash
# 1. Start local persistent SurrealDB server with RocksDB storage
surreal start --user root --pass securepassword file:/var/lib/surrealdb/data

# 2. Open interactive SurrealQL CLI shell
surreal sql --endpoint ws://127.0.0.1:8000/rpc --ns enterprise --db store --user root --pass securepassword

# 3. Export complete database schema and records to a SQL file
surreal export --endpoint http://127.0.0.1:8000 --ns enterprise --db store backup.surql

# 4. Import schema definitions and seed data
surreal import --endpoint http://127.0.0.1:8000 --ns enterprise --db store schema.surql
```

---

## Agent Operational Directive

> **MANDATORY**: Always specify explicit namespace and database targets when configuring connection pools, and structure graph relations with `RELATE` statements instead of synthetic foreign-key lookup joins.
