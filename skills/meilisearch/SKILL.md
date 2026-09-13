---
name: meilisearch
description: "Configure Meilisearch full-text search engine; tune typo tolerance, ranking rules, filterable and searchable attributes, and instant search latency."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-13"
tags: ["meilisearch", "search-engine", "full-text-search", "typo-tolerance", "faceting", "instant-search", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Meilisearch Instant Full-Text Search AI Skill Guide

## Overview & Engine Architecture

Meilisearch is an open-source, lightning-fast full-text search engine written in Rust. It is built from the ground up for search-as-you-type frontends, delivering relevant, typo-tolerant search results in under 50 milliseconds. Unlike general-purpose search clusters that require complex schema definitions, Meilisearch uses an embedded memory-mapped key-value store (**LMDB**) and a deterministic **bucket-sort ranking pipeline** based on word matches, typos, proximity, attribute weight, and custom sort rules.

Claude operates as a Principal Search Engineer, specializing in **index settings optimization**, **custom ranking rule configurations**, **faceted search and filtering**, **asynchronous task queue monitoring**, and **tenant-isolated search key management**.

### Meilisearch Indexing & Query Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                 Meilisearch Architecture                    │
│                                                             │
│  Client Ingress (REST API / InstantSearch / SDKs)           │
│  ├── Multi-Search (/indexes/movies/search)                  │
│  └── Tenant Search API Keys (Scoped Filters & Restrictions) │
│                                                             │
│  Asynchronous Task Engine & Queue                           │
│  ├── Document Batching & Auto-Deduplication by Primary Key  │
│  └── LMDB Inverted Index & B-Tree Storage                   │
│                                                             │
│  Deterministic Bucket-Sort Ranking Pipeline                 │
│  ├── 1. Words (Number of query terms matched)               │
│  ├── 2. Typo (Fewer typographical errors ranked higher)     │
│  ├── 3. Proximity (Distance between matching words)        │
│  ├── 4. Attribute (Searchable attributes priority order)    │
│  ├── 5. Sort (User-defined ascending/descending fields)     │
│  └── 6. Exactness (Exact string matches over partials)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Explicit Searchable & Filterable Attributes**: By default, Meilisearch indexes every field for full-text search. Always configure `searchableAttributes` to restrict indexing to relevant textual fields (e.g., `title`, `overview`), and declare `filterableAttributes` and `sortableAttributes` explicitly.
2. **Deterministic Task Completion**: Document insertion, deletion, and index setting updates in Meilisearch are asynchronous tasks. Always await task completion (`waitForTask`) in automation scripts and CI pipelines before issuing verification queries.
3. **Multi-Tenant Security via Scoped Keys**: Never expose the master API key to frontends. Generate fine-grained tenant API keys containing preset filter restrictions (`tenant_id = "org_101"`) and expiration timestamps.
4. **Tune Typo Tolerance**: Configure typo tolerance rules for short codes or IDs (disable typos on SKU numbers or UUID fields) to eliminate false-positive matches.

---

## Production TypeScript Automation: Index Setup & Faceted Search

```typescript
import { MeiliSearch } from "meilisearch";

interface ProductDocument {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  description: string;
}

async function configureAndSearch() {
  const client = new MeiliSearch({
    host: "http://127.0.0.1:7700",
    apiKey: "MASTER_KEY_SECRET",
  });

  const index = client.index<ProductDocument>("products");

  // 1. Configure production index attributes and ranking rules
  console.log("Configuring index settings...");
  const settingsTask = await index.updateSettings({
    searchableAttributes: ["name", "description", "category"],
    filterableAttributes: ["category", "price", "inStock"],
    sortableAttributes: ["price"],
    rankingRules: [
      "words",
      "typo",
      "proximity",
      "attribute",
      "sort",
      "exactness",
    ],
    typoTolerance: {
      minWordSizeForTypos: {
        oneTypo: 5,
        twoTypos: 9,
      },
    },
  });
  await client.waitForTask(settingsTask.taskUid);

  // 2. Ingest document batch
  console.log("Ingesting documents...");
  const documents: ProductDocument[] = [
    { id: "sku-1", name: "Mechanical Keyboard", category: "Hardware", price: 149.99, inStock: true, description: "Wireless mechanical keyboard with tactile switches." },
    { id: "sku-2", name: "Ultra-Wide Monitor", category: "Hardware", price: 699.99, inStock: true, description: "34-inch curved IPS gaming display." },
    { id: "sku-3", name: "Desk Mat", category: "Accessories", price: 29.99, inStock: false, description: "Stitched edge water-resistant surface." },
  ];

  const addDocsTask = await index.addDocuments(documents, { primaryKey: "id" });
  await client.waitForTask(addDocsTask.taskUid);

  // 3. Execute faceted search with highlights and filters
  console.log("Executing search query...");
  const searchResults = await index.search("keybord", { // Intentional typo
    filter: ["category = 'Hardware' AND inStock = true"],
    sort: ["price:asc"],
    attributesToHighlight: ["name"],
    limit: 10,
  });

  console.log(`Hits found: ${searchResults.hits.length}`);
  for (const hit of searchResults.hits) {
    console.log(`- ${hit._formatted?.name || hit.name} ($${hit.price})`);
  }
}

configureAndSearch().catch(console.error);
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`attribute_not_filterable` error** | Query filtered on an attribute that has not been declared in `filterableAttributes`. | Add target attribute to `filterableAttributes` using `index.updateFilterableAttributes()` and wait for task completion. |
| **Task failed with `missing_document_id`** | Document payload is missing the primary key field (default `id`). | Verify every document has a non-empty string or integer primary key field, or specify the custom key via `{ primaryKey: 'customId' }`. |
| **Out-of-memory (OOM) error during batch upload** | Huge payload (>100MB) sent in a single synchronous HTTP request. | Split large document collections into smaller batches (5,000–10,000 records per batch) before uploading. |
| **False-positive search results on technical codes** | Typo tolerance enabled on alphanumeric identifiers or part numbers. | Add identifier fields to `typoTolerance.disableOnAttributes`. |

---

## Command Line Syntax & Operational Recipes

```bash
# 1. Start Meilisearch Docker container with persistent storage
docker run -d -p 7700:7700 \
  -e MEILI_MASTER_KEY="MASTER_KEY_SECRET" \
  -v /var/lib/meilisearch/data:/meili_data \
  --name meilisearch getmeili/meilisearch:latest

# 2. Check task execution status
curl -H "Authorization: Bearer MASTER_KEY_SECRET" http://localhost:7700/tasks/12

# 3. Create an on-demand database dump
curl -X POST -H "Authorization: Bearer MASTER_KEY_SECRET" http://localhost:7700/dumps

# 4. Query index health and document statistics
curl -H "Authorization: Bearer MASTER_KEY_SECRET" http://localhost:7700/indexes/products/stats
```

---

## Agent Operational Directive

> **MANDATORY**: Never configure frontends with the Meilisearch master key. Always create short-lived, filter-scoped tenant search keys, and always await task resolution when mutating index schemas.
