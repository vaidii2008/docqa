import { prisma } from "@/lib/db";
import { extractPdfText } from "@/lib/rag/extract";
import { chunkText } from "@/lib/rag/chunk";

export interface IngestResult {
  documentId: string;
  chunkCount: number;
}

/**
 * Ingest a PDF into a workspace: create the Document row, extract its text,
 * split it into chunks, and store them. The Document status tracks progress
 * (PROCESSING, then READY, or FAILED if extraction produces no text).
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

    // One transaction so a document is never left half-ingested: either all
    // chunks land and the status flips to READY, or neither happens.
    await prisma.$transaction([
      prisma.chunk.createMany({
        data: chunks.map((content, chunkIndex) => ({
          content,
          chunkIndex,
          documentId: document.id,
        })),
      }),
      prisma.document.update({
        where: { id: document.id },
        data: { status: "READY" },
      }),
    ]);

    return { documentId: document.id, chunkCount: chunks.length };
  } catch (error) {
    await prisma.document.update({
      where: { id: document.id },
      data: { status: "FAILED" },
    });
    throw error;
  }
}
