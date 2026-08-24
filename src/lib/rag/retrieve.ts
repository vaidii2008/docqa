import { prisma } from "@/lib/db";
import { embedQuery } from "@/lib/ai/embed";

export interface RetrievedChunk {
  id: string;
  content: string;
  documentId: string;
  filename: string;
  similarity: number;
}

/**
 * Semantic search over a workspace's chunks. Embeds the question, then returns
 * the top-k chunks ranked by cosine similarity to it.
 *
 * The `<=>` operator is pgvector's cosine DISTANCE (0 = identical, 2 = opposite),
 * so we order ascending (nearest first) and convert to a similarity score
 * (1 - distance) for readability. The join scopes results to one workspace, so
 * a user only ever searches their own documents.
 */
export async function retrieveChunks(
  workspaceId: string,
  question: string,
  topK = 5,
): Promise<RetrievedChunk[]> {
  const queryVector = await embedQuery(question);
  const literal = `[${queryVector.join(",")}]`;

  const rows = await prisma.$queryRaw<RetrievedChunk[]>`
    SELECT
      c."id",
      c."content",
      c."documentId",
      d."filename",
      1 - (c."embedding" <=> ${literal}::vector) AS "similarity"
    FROM "Chunk" c
    JOIN "Document" d ON d."id" = c."documentId"
    WHERE d."workspaceId" = ${workspaceId}
      AND c."embedding" IS NOT NULL
    ORDER BY c."embedding" <=> ${literal}::vector
    LIMIT ${topK}
  `;

  return rows;
}
