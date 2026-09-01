import { Client } from "@upstash/qstash";

let client: Client | null = null;

/**
 * Lazily construct the QStash client. Lazily, because in dev mode the SDK
 * spawns a local QStash server process, and we only want that to happen if
 * something actually enqueues a job.
 *
 * devMode is deliberately not passed here. The SDK falls back to the QSTASH_DEV
 * environment variable, which production never sets, so the local dev server
 * cannot start by accident on a real deployment.
 */
function getClient(): Client {
  if (!client) {
    client = new Client({ token: process.env.QSTASH_TOKEN ?? "" });
  }
  return client;
}

/**
 * The absolute URL QStash will call back into. Each deployment points at
 * itself: a preview deployment queues work to that same preview, so a branch
 * under test never hands its jobs to production code.
 */
function getWorkerUrl(): string {
  const base =
    process.env.APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    "http://localhost:3000";

  return `${base}/api/jobs/embed`;
}

/**
 * Hand a document off to the background worker for embedding. Returns the
 * QStash message id, which is worth logging: it is the handle you use to trace
 * a job through the QStash console when something goes wrong in production.
 */
export async function enqueueEmbedJob(documentId: string): Promise<string> {
  const response = await getClient().publishJSON({
    url: getWorkerUrl(),
    body: { documentId },
    retries: 3,
  });

  return response.messageId;
}
