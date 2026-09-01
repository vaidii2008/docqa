import { prisma } from "@/lib/db";
import { ProcessingPoller } from "@/components/processing-poller";

const statusStyles: Record<string, string> = {
  READY: "bg-green-100 text-green-800",
  PROCESSING: "bg-yellow-100 text-yellow-800",
  FAILED: "bg-red-100 text-red-800",
};

export async function DocumentList({ workspaceId }: { workspaceId: string }) {
  const documents = await prisma.document.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { chunks: true } } },
  });

  if (documents.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No documents yet. Upload a PDF to get started.
      </p>
    );
  }

  // Derived from the rows we already loaded, so the poller costs no extra query.
  const hasPending = documents.some((doc) => doc.status === "PROCESSING");

  return (
    <>
      <ProcessingPoller pending={hasPending} />
      <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{doc.filename}</p>
              <p className="text-xs text-gray-500">
                {doc._count.chunks} chunks
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[doc.status] ?? ""}`}
            >
              {doc.status}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
