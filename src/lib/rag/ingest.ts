import { prisma } from "@/lib/db";
import { extractPdfText } from "@/lib/rag/extract";
import { chunkText } from "@/lib/rag/chunk";
import { embedTexts } from "@/lib/ai/embed";
import { setChunkEmbedding } from "@/lib/rag/store-embedding";

export interface IngestResult {
  documentId: string;
  chunkCount: number;
}

export interface EmbedResult {
  documentId: string;
  embeddedCount: number;
  remaining: number;
}

// Ceiling on how many texts go to the embedding provider in one request.
// A normal document sits well under this, so it is a no-op in practice and
// only kicks in to stop a very large PDF sending one enormous payload.
const EMBED_BATCH_SIZE = 100;

/**
 * Phase one of ingestion: create the Document, extract its text, chunk it and
 * store the chunks with no vectors yet. This is CPU bound and fast, so it is
 * safe to run inside a request. Leaves the Document in PROCESSING.
 *
 * Ownership is the caller's responsibility: workspaceId must already be
 * verified to belong to the current user before calling this.
 */
export async function prepareDocument(params: {
  workspaceId: string;
  filename: string;
  data: Uint8Array;
}): Promise<IngestResult> {
  const { workspaceId, filename, data } = params;

  const document = await prisma.document.create({
    data: { filename, workspaceId, status: "PROCESSING" },
  });

  try {
    const text = await extractPdfText(data);
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      throw new Error("No extractable text found in the PDF");
    }

    await prisma.$transaction(
      chunks.map((content, chunkIndex) =>
        prisma.chunk.create({
          data: { content, chunkIndex, documentId: document.id },
          select: { id: true },
        }),
      ),
    );

    return { documentId: document.id, chunkCount: chunks.length };
  } catch (error) {
    // A parse or chunk failure is permanent, so fail the document right away.
    await markDocumentFailed(document.id);
    throw error;
  }
}

/**
 * Phase two of ingestion: embed every chunk of a document that has no vector
 * yet, then flip the Document to READY once none are left. This is network
 * bound and rate limited, so it is the part that belongs in a background job.
 *
 * Idempotent by construction: it only ever selects chunks whose embedding is
 * NULL, so running it again after a partial failure resumes instead of
 * duplicating work. It deliberately does not mark the document FAILED on
 * error, because the caller owns the retry policy.
 */
export async function embedDocumentChunks(
  documentId: string,
): Promise<EmbedResult> {
  // Raw SQL because Prisma cannot read or filter Unsupported columns, so
  // "embedding IS NULL" is not expressible through the query builder.
  const pending = await prisma.$queryRaw<{ id: string; content: string }[]>`
    SELECT "id", "content"
    FROM "Chunk"
    WHERE "documentId" = ${documentId} AND "embedding" IS NULL
    ORDER BY "chunkIndex" ASC
  `;

  let embeddedCount = 0;

  for (let i = 0; i < pending.length; i += EMBED_BATCH_SIZE) {
    const batch = pending.slice(i, i + EMBED_BATCH_SIZE);
    const vectors = await embedTexts(batch.map((chunk) => chunk.content));

    for (let j = 0; j < batch.length; j++) {
      await setChunkEmbedding(batch[j].id, vectors[j]);
    }

    embeddedCount += batch.length;
  }

  const rows = await prisma.$queryRaw<{ remaining: number }[]>`
    SELECT COUNT(*)::int AS "remaining"
    FROM "Chunk"
    WHERE "documentId" = ${documentId} AND "embedding" IS NULL
  `;
  const remaining = rows[0]?.remaining ?? 0;

  if (remaining === 0) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "READY" },
    });
  }

  return { documentId, embeddedCount, remaining };
}

/**
 * Mark a document as permanently failed. Shared by the request path and by the
 * background worker once its retries are exhausted.
 */
export async function markDocumentFailed(documentId: string): Promise<void> {
  await prisma.document.update({
    where: { id: documentId },
    data: { status: "FAILED" },
  });
}

/**
 * Full synchronous ingestion: prepare, then embed, in one call. This is the
 * original v1.0 behaviour, kept intact so the existing upload path keeps
 * working while the background path is built and verified alongside it.
 */
export async function ingestPdf(params: {
  workspaceId: string;
  filename: string;
  data: Uint8Array;
}): Promise<IngestResult> {
  const result = await prepareDocument(params);

  try {
    await embedDocumentChunks(result.documentId);
  } catch (error) {
    await markDocumentFailed(result.documentId);
    throw error;
  }

  return result;
}
