import Link from "next/link";
import { requireUserId } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { ChatPanel } from "@/components/chat/chat-panel";

export default async function ChatPage() {
  const userId = await requireUserId();
  const workspace = await getOrCreateDefaultWorkspace(userId);

  // Load persisted chat history for this workspace, oldest first.
  const history = await prisma.chatMessage.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });

  const initialMessages = history.map((m) => ({
    role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chat</h1>
        <Link
          href="/dashboard"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
        >
          Back to documents
        </Link>
      </div>

      <ChatPanel initialMessages={initialMessages} />
    </main>
  );
}
