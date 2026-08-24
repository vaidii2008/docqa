import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

// gemini-embedding-001 outputs 3072 dims by default; we truncate to 768 via
// Matryoshka to keep the vector column small. This MUST match vector(768).
export const EMBEDDING_DIMENSIONS = 768;

const embeddingModel = google.textEmbeddingModel("gemini-embedding-001");

const providerOptions = {
  google: { outputDimensionality: EMBEDDING_DIMENSIONS },
};

/**
 * Embed a batch of texts (used when ingesting a document's chunks).
 * Returns one vector per input, in the same order.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
    providerOptions,
  });
  return embeddings;
}

/**
 * Embed a single text (used for a search query at retrieval time).
 */
export async function embedQuery(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
    providerOptions,
  });
  return embedding;
}
