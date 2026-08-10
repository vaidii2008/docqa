"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { ingestPdf } from "@/lib/rag/ingest";

export type UploadState = {
  error?: string;
  success?: string;
};

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

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

  try {
    const result = await ingestPdf({
      workspaceId: workspace.id,
      filename: file.name,
      data,
    });
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
