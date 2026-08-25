import type { RetrievedChunk } from "@/lib/rag/retrieve";

/**
 * Build the system prompt that grounds the model in the retrieved passages.
 * Sources are numbered so the model can cite them as [1], [2], etc., and the
 * client can map those markers back to the originating chunks.
 */
export function buildSystemPrompt(chunks: RetrievedChunk[]): string {
  const sources = chunks
    .map((c, i) => `[${i + 1}] (from ${c.filename})\n${c.content}`)
    .join("\n\n");

  return `You are DocQA, an assistant that answers questions strictly using the provided source passages from the user's own documents.

Rules:
- Answer using ONLY the information in the sources below. Do not rely on outside knowledge.
- Cite the sources you use with bracketed numbers like [1] or [2], placed right after the claim they support.
- If the sources do not contain the answer, say you could not find it in the documents. Do not guess or invent details.
- Be concise and accurate.

Sources:
${sources}`;
}
