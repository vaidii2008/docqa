#!/usr/bin/env bash
# Prisma cannot see indexes on Unsupported columns, so every "migrate dev" emits
# a DROP INDEX for the pgvector HNSW index as though it were schema drift.
# Dropping it in production would silently turn vector search into a full scan,
# so fail the build if any migration contains that statement.
set -euo pipefail

if grep -rniE 'drop index.*chunk_embedding_idx' prisma/migrations/; then
  echo ""
  echo "ERROR: a migration drops the pgvector HNSW index."
  echo "Remove that DROP INDEX line. See prisma/schema.prisma for context."
  exit 1
fi

echo "OK: no migration drops the pgvector index."
