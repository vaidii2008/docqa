import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { retrieveChunks } from "@/lib/rag/retrieve";
import { buildSystemPrompt } from "@/lib/rag/prompt";
import { prisma } from "@/lib/db";

// Allow the streamed response to run up to 30s.
export const maxDuration = 30;

const bodySchema = z.object({
  question: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request) {
  const userId = await requireUserId();

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid question" }, { status: 400 });
  }
  const { question } = parsed.data;

  const workspace = await getOrCreateDefaultWorkspace(userId);

  // Retrieve the most relevant chunks for this question (Phase 4).
  const chunks = await retrieveChunks(workspace.id, question, 5);

  // The sources the client needs to render citations. Kept small (a preview,
  // not full content) so it fits comfortably in a response header.
  const sources = chunks.map((c, i) => ({
    n: i + 1,
    filename: c.filename,
    similarity: Number(c.similarity.toFixed(3)),
    preview: c.content.slice(0, 200),
  }));

  // Persist the user's question immediately.
  await prisma.chatMessage.create({
    data: { role: "USER", content: question, workspaceId: workspace.id },
  });

  const result = streamText({
    model: google("gemini-3.6-flash"),
    system: buildSystemPrompt(chunks),
    prompt: question,
    onFinish: async ({ text }) => {
      // Persist the assistant's answer once streaming completes (server side).
      await prisma.chatMessage.create({
        data: { role: "ASSISTANT", content: text, workspaceId: workspace.id },
      });
    },
  });

  // Stream the answer text, with the citation sources in a header.
  return result.toTextStreamResponse({
    headers: {
      "x-sources": encodeURIComponent(JSON.stringify(sources)),
    },
  });
}
