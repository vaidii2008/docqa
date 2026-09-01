import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { embedDocumentChunks, markDocumentFailed } from "@/lib/rag/ingest";

// The embedding provider is rate limited, so this can run for a while. Node
// runtime because the Prisma pg adapter needs it.
export const runtime = "nodejs";
export const maxDuration = 300;

const isDev = process.env.QSTASH_DEV === "true";

/**
 * Verify that a request genuinely came from QStash. The route is a public URL,
 * so without this anyone could POST a document id and burn our embedding quota.
 * QStash signs every delivery with a rotating key pair, and the Receiver checks
 * the signature against both the current and next key so a rotation does not
 * drop in-flight messages.
 */
async function isFromQStash(body: string, signature: string): Promise<boolean> {
  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY ?? "",
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? "",
    ...(isDev ? { devMode: true } : {}),
  });

  try {
    return await receiver.verify({ body, signature });
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("upstash-signature") ?? "";

  if (!(await isFromQStash(body, signature))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let documentId: unknown;
  try {
    documentId = (JSON.parse(body) as { documentId?: unknown }).documentId;
  } catch {
    documentId = undefined;
  }

  if (typeof documentId !== "string" || documentId.length === 0) {
    // Malformed payload, so retrying will never help. 400 tells QStash to give
    // up rather than redeliver a message that can never succeed.
    return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
  }

  // QStash sends this header on the final attempt only, so we can tell a
  // transient failure apart from an exhausted one.
  const isLastAttempt = request.headers.get("upstash-retried") === "3";

  try {
    const result = await embedDocumentChunks(documentId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Embed job failed", { documentId, isLastAttempt, error });

    if (isLastAttempt) {
      // Retries are spent, so this document is not coming back. Mark it FAILED
      // and return 200 so QStash stops redelivering a job we have given up on.
      await markDocumentFailed(documentId);
      return NextResponse.json({ error: "Embedding failed" }, { status: 200 });
    }

    // Non-2xx tells QStash to retry with backoff.
    return NextResponse.json({ error: "Embedding failed" }, { status: 500 });
  }
}
