import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted runs before the hoisted vi.mock factories, so these spies exist by
// the time the mocked modules are constructed. Declaring them as plain consts
// would hit a temporal dead zone instead.
const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
  documentUpdate: vi.fn(),
  embedTexts: vi.fn(),
  setChunkEmbedding: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    $queryRaw: mocks.queryRaw,
    document: { update: mocks.documentUpdate },
  },
}));

vi.mock("@/lib/ai/embed", () => ({ embedTexts: mocks.embedTexts }));

vi.mock("@/lib/rag/store-embedding", () => ({
  setChunkEmbedding: mocks.setChunkEmbedding,
}));

// Mocked so the test does not pull in the PDF parser, which is irrelevant here.
vi.mock("@/lib/rag/extract", () => ({ extractPdfText: vi.fn() }));

import { embedDocumentChunks } from "@/lib/rag/ingest";

describe("embedDocumentChunks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("embeds pending chunks and marks the document ready", async () => {
    mocks.queryRaw
      .mockResolvedValueOnce([
        { id: "chunk-1", content: "first" },
        { id: "chunk-2", content: "second" },
      ])
      .mockResolvedValueOnce([{ remaining: 0 }]);
    mocks.embedTexts.mockResolvedValueOnce([
      [0.1, 0.2],
      [0.3, 0.4],
    ]);

    const result = await embedDocumentChunks("doc-1");

    expect(mocks.embedTexts).toHaveBeenCalledWith(["first", "second"]);
    expect(mocks.setChunkEmbedding).toHaveBeenCalledTimes(2);
    expect(mocks.documentUpdate).toHaveBeenCalledWith({
      where: { id: "doc-1" },
      data: { status: "READY" },
    });
    expect(result).toEqual({
      documentId: "doc-1",
      embeddedCount: 2,
      remaining: 0,
    });
  });

  it("does no work when every chunk is already embedded", async () => {
    // This is the redelivery case. QStash guarantees at-least-once delivery, so
    // a duplicate message must be a no-op rather than a second round of calls
    // to the embedding provider.
    mocks.queryRaw
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ remaining: 0 }]);

    const result = await embedDocumentChunks("doc-1");

    expect(mocks.embedTexts).not.toHaveBeenCalled();
    expect(mocks.setChunkEmbedding).not.toHaveBeenCalled();
    expect(result.embeddedCount).toBe(0);
  });

  it("leaves the document processing while chunks remain unembedded", async () => {
    mocks.queryRaw
      .mockResolvedValueOnce([{ id: "chunk-1", content: "first" }])
      .mockResolvedValueOnce([{ remaining: 4 }]);
    mocks.embedTexts.mockResolvedValueOnce([[0.1, 0.2]]);

    const result = await embedDocumentChunks("doc-1");

    expect(mocks.documentUpdate).not.toHaveBeenCalled();
    expect(result.remaining).toBe(4);
  });

  it("propagates provider errors without marking the document failed", async () => {
    // The worker does not own the retry policy. Marking FAILED here would turn
    // a transient rate limit into a permanently broken document.
    mocks.queryRaw.mockResolvedValueOnce([{ id: "chunk-1", content: "first" }]);
    mocks.embedTexts.mockRejectedValueOnce(new Error("429 rate limited"));

    await expect(embedDocumentChunks("doc-1")).rejects.toThrow("429 rate limited");
    expect(mocks.documentUpdate).not.toHaveBeenCalled();
  });
});
