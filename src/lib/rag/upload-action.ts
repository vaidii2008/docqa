"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { ingestPdf, prepareDocument, markDocumentFailed } from "@/lib/rag/ingest";
import { enqueueEmbedJob } from "@/lib/jobs/qstash";

export type UploadState = {
  error?: string;
  success?: string;
};

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// "queue" moves embedding to a background job so the upload returns straight
// away. "sync" is the original v1.0 path, kept as the default until the queued
// path is verified in a preview deployment.
const useQueue = process.env.INGEST_MODE === "queue";

export async function uploadDocument(
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const userId = await requireUserId();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a PDF file to upload" };
  }
  if (file.type !== "application/pdf") {
    return { error: "Only PDF files are supported" };
  }
  if (file.size > MAX_BYTES) {
    return { error: "File is too large (10 MB maximum)" };
  }

  const workspace = await getOrCreateDefaultWorkspace(userId);
  const data = new Uint8Array(await file.arrayBuffer());
  const params = { workspaceId: workspace.id, filename: file.name, data };

  try {
    if (useQueue) {
      const result = await prepareDocument(params);

      try {
        await enqueueEmbedJob(result.documentId);
      } catch (error) {
        // The chunks are stored but nothing will ever embed them, so the
        // document would sit in PROCESSING forever. Fail it explicitly rather
        // than leaving a ghost row the user cannot act on.
        await markDocumentFailed(result.documentId);
        throw error;
      }

      revalidatePath("/dashboard");
      return {
        success: `Uploaded "${file.name}". Processing ${result.chunkCount} chunks in the background.`,
      };
    }

    const result = await ingestPdf(params);
    revalidatePath("/dashboard");
    return {
      success: `Uploaded "${file.name}" and created ${result.chunkCount} chunks`,
    };
  } catch {
    return {
      error: "We could not read that PDF. It may be scanned images or corrupted.",
    };
  }
}
