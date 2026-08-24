-- Add the embedding column (768 dims, matching the Gemini gemini-embedding-001 truncated output)
ALTER TABLE "Chunk" ADD COLUMN "embedding" vector(768);

-- Approximate-nearest-neighbour index for fast cosine similarity search.
-- HNSW gives high recall and fast queries; vector_cosine_ops matches the cosine distance operator (<=>) we will query with
CREATE INDEX "Chunk_embedding_idx" ON "Chunk" USING hnsw ("embedding" vector_cosine_ops);
