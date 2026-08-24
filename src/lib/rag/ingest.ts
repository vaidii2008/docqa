import { prisma } from "@/lib/db";
import { extractPdfText } from "@/lib/rag/extract";
import { chunkText } from "@/lib/rag/chunk";
import { embedTexts } from "@/lib/ai/embed";
import { setChunkEmbedding } from "@/lib/rag/store-embedding";

export interface IngestResult {
  documentId: string;
  chunkCount: number;
}

/**
 * Ingest a PDF into a workspace: create the Document, extract text, chunk it,
 * store the chunks, then embed each chunk and save its vector. The Document
 * status tracks progress (PROCESSING, then READY, or FAILED on any error).
 *
 * Ownership is the caller's responsibility: workspaceId must already be
 * verified to belong to the current user before calling this.
 */
export async function ingestPdf(params: {
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

    // Create chunk rows first (without embeddings), returning their ids in
    // order so we can attach each vector to the right chunk afterwards.
    const createdChunks = await prisma.$transaction(
      chunks.map((content, chunkIndex) =>
        prisma.chunk.create({
          data: { content, chunkIndex, documentId: document.id },
          select: { id: true },
        }),
      ),
    );

    // Embed all chunk texts in one batch, then store each vector.
    const embeddings = await embedTexts(chunks);
    for (let i = 0; i < createdChunks.length; i++) {
      await setChunkEmbedding(createdChunks[i].id, embeddings[i]);
    }

    await prisma.document.update({
      where: { id: document.id },
      data: { status: "READY" },
    });

    return { documentId: document.id, chunkCount: chunks.length };
  } catch (error) {
    await prisma.document.update({
      where: { id: document.id },
      data: { status: "FAILED" },
    });
    throw error;
  }
}
