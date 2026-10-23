---
name: qdrant
description: "Operate Qdrant collections with query_points, payload indexes, HNSW/quantization tuning, and hybrid dense+sparse fusion agents routinely misconfigure."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-13"
tags: ["qdrant", "vector-database", "hnsw", "hybrid-search", "sparse-vectors", "payload-index", "rag"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Qdrant Vector Database AI Skill Guide (Claude)

## Overview & Engine Architecture

Qdrant is a Rust vector database for **ANN search** over dense (and sparse) vectors with rich **payload** metadata. Collections hold points (id + vectors + payload); **HNSW** accelerates approximate search; **payload indexes** keep filtered queries fast; **quantization** trades RAM for recall. Prefer the unified **`query_points`** API (replaces deprecated `search`) for dense, recommend, discover, and **hybrid prefetch + RRF/DBSF fusion**. Align distance metric with the embedding model; never invent API keys for Qdrant Cloud.

```
┌─────────────────────────────────────────────────────────────┐
│                 Qdrant storage & query path                   │
│                                                             │
│  Client (REST :6333 / gRPC :6334)                           │
│  ├── upsert / query_points / scroll / snapshots             │
│                                                             │
│  Collection                                                 │
│  ├── Dense vectors (FP32 / on_disk) + optional named vectors│
│  ├── Sparse vectors (exact inverted index)                  │
│  ├── HNSW (m, ef_construct) + search hnsw_ef                │
│  ├── Quantization (scalar INT8 / product)                   │
│  └── Payload indexes (keyword / integer / text / geo)       │
│                                                             │
│  Hybrid                                                     │
│  └── prefetch dense + sparse → FusionQuery (RRF / DBSF)     │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Production RAG / semantic search needing filtered ANN, hybrid dense+sparse, and snapshots.
- Multi-tenant retrieval with `tenant_id` (or similar) payload filters at query time.
- Replacing ad-hoc in-memory stores for multi-process `@langchain` / `@llamaindex` serving.

**Do not use when**

- A tiny local prototype with no filters is enough → `@chromadb` may be simpler.
- The task is relational OLTP reporting → `@postgresql` (store vectors beside rows only if product requires).
- Someone asks to skip tenant filters on shared collections → refuse; enforce payload filters + app authZ.

---

## Operational Capabilities & Agent Directives

1. **Match distance to embeddings**: `Cosine` for typical normalized OpenAI/Cohere embeddings; `Dot` only if vectors are already normalized for that metric; `Euclid` for spatial-style use cases.
2. **Create payload indexes before filtered prod traffic** (`tenant_id`, `document_type`, timestamps)—unindexed filters degrade toward expensive scans.
3. **Use `query_points`**, not deprecated `client.search`, for new code; use **prefetch + `FusionQuery`** for hybrid.
4. **Batch upserts** (500–2000 points) with retries; avoid single-point write storms that thrash optimizers.
5. **Quantize at scale** (≈1M+ vectors): scalar INT8 + `on_disk` dense storage; keep quantized data in RAM when latency-critical (`always_ram=True`).
6. **Version collections** when embed model or dim changes (`policies_v3_emb3small`); never mix dims in one vector params.
7. **Snapshots for backup**; pin image tags in Compose (`qdrant/qdrant:<version>`), not only `latest`, for prod.

---

## Production Example: collection, indexes, hybrid `query_points`

```python
"""Production Qdrant setup: payload indexes + hybrid dense/sparse query_points."""
from qdrant_client import QdrantClient
from qdrant_client.http import models

COLLECTION = "rag_documents"


def setup_production_collection(client: QdrantClient) -> None:
    if client.collection_exists(COLLECTION):
        return

    client.create_collection(
        collection_name=COLLECTION,
        vectors_config={
            "dense": models.VectorParams(
                size=1536,
                distance=models.Distance.COSINE,
                on_disk=True,
            )
        },
        sparse_vectors_config={
            "sparse": models.SparseVectorParams(
                index=models.SparseIndexParams(on_disk=False)
            )
        },
        hnsw_config=models.HnswConfigDiff(
            m=16,
            ef_construct=128,
            full_scan_threshold=10000,
        ),
        quantization_config=models.ScalarQuantization(
            scalar=models.ScalarQuantizationConfig(
                type=models.ScalarType.INT8,
                quantile=0.99,
                always_ram=True,
            )
        ),
    )
    client.create_payload_index(
        collection_name=COLLECTION,
        field_name="tenant_id",
        field_schema=models.PayloadSchemaType.KEYWORD,
    )
    client.create_payload_index(
        collection_name=COLLECTION,
        field_name="published_timestamp",
        field_schema=models.PayloadSchemaType.INTEGER,
    )


def upsert_batch(client: QdrantClient, points: list[models.PointStruct]) -> None:
    # Prefer 500–2000 points per upsert call
    client.upsert(collection_name=COLLECTION, points=points, wait=True)


def hybrid_query(
    client: QdrantClient,
    dense: list[float],
    sparse_indices: list[int],
    sparse_values: list[float],
    tenant_id: str,
    limit: int = 8,
) -> models.QueryResponse:
    return client.query_points(
        collection_name=COLLECTION,
        prefetch=[
            models.Prefetch(
                query=dense,
                using="dense",
                limit=50,
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="tenant_id",
                            match=models.MatchValue(value=tenant_id),
                        )
                    ]
                ),
            ),
            models.Prefetch(
                query=models.SparseVector(indices=sparse_indices, values=sparse_values),
                using="sparse",
                limit=50,
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="tenant_id",
                            match=models.MatchValue(value=tenant_id),
                        )
                    ]
                ),
            ),
        ],
        query=models.FusionQuery(fusion=models.Fusion.RRF),
        limit=limit,
        with_payload=True,
        search_params=models.SearchParams(hnsw_ef=64, exact=False),
    )


if __name__ == "__main__":
    qdrant = QdrantClient(url="http://localhost:6333")
    setup_production_collection(qdrant)
```

### Ops recipes

```bash
# Pin a version in real deployments; latest only for local experiments
docker run -d --name qdrant -p 6333:6333 -p 6334:6334 \
  -v qdrant_storage:/qdrant/storage \
  qdrant/qdrant:v1.13.2

curl -s http://localhost:6333/collections/rag_documents | jq .
curl -s -X POST http://localhost:6333/collections/rag_documents/snapshots
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Filtered query >100–500ms | Payload field unindexed | `create_payload_index` on filter keys |
| Low recall | Low `hnsw_ef`; over-aggressive quantization; wrong metric | Raise `hnsw_ef` (64–128); revisit quantile; verify Cosine vs Dot norms |
| High RAM / OOM | FP32 vectors all in RAM | `on_disk=True` + scalar quantization; size heap appropriately |
| Optimizer CPU pinned | Tiny single-point upserts | Batch 500–2000; pause indexing during bulk (`indexing_threshold=0`) then restore |
| Dim / type errors on upsert | Embed model changed | New collection; re-embed; never change `size` in place |
| Deprecated API warnings | Still calling `client.search` | Migrate to `query_points` |
| Cross-tenant hits | Filter omitted or wrong key | Mandatory `tenant_id` filter; app authZ |
| Hybrid returns sparse-only or dense-only | One prefetch empty / bad sparse | Verify sparse indices/values; tune prefetch limits; check fusion |

---

## Best Practices

1. Index every high-cardinality filter field used in production queries.
2. Name vectors (`dense`, `sparse`) when running hybrid; document which embed/sparse model fills each.
3. Upsert with stable point ids derived from document/chunk ids for idempotent re-ingest.
4. Take snapshots before destructive rebuilds; test restore in staging.
5. Pair with `@openai-api` / `@anthropic-api` for embeddings/LLMs; keep embed model id in collection naming.
6. Measure recall@k on a labeled set (`@ai-evaluation-dataset`) when changing HNSW/quantization.

---

## Limitations

- HNSW is approximate—exact mode exists but will not scale the same way.
- Sparse indexes are exact but still need well-formed indices/values from the sparse model.
- Single-node Docker is not a multi-region HA plan—use Qdrant Cloud/cluster features for HA.
- Stop and ask if embed dimensionality, tenancy keys, or Cloud credentials are missing.

---

## Related Skills

- `@chromadb` — lighter local vector store
- `@llamaindex` / `@langchain` — RAG / agent frameworks using Qdrant
- `@openai-api` — embeddings generation
- `@docker` — local Qdrant containers with volumes
- `@ai-evaluation-dataset` — retrieval golden sets

---

## Agent Operational Directive

> **MANDATORY**: Create payload indexes for every production filter field before bulk load completes. Use `query_points` (hybrid via prefetch + fusion). Align distance metric and vector size with the embed model; version collections on embed changes. Batch upserts; set tenant filters on every multi-tenant query. Never commit Qdrant Cloud API keys.

---

## Source anchors (research)

- [Query points API](https://api.qdrant.tech/api-reference/search/query-points)
- [Hybrid queries](https://qdrant.tech/documentation/search/hybrid-queries/)
- [Hybrid search (dense + BM25/sparse)](https://qdrant.tech/documentation/search/text-search/hybrid-search/)
- [Indexing (payload & sparse)](https://qdrant.tech/documentation/manage-data/indexing/)
- [qdrant-client: search → query_points deprecation](https://github.com/qdrant/qdrant-client/compare/v1.11.1...v1.16.2)
