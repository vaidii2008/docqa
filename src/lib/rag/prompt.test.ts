import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/rag/prompt";
import type { RetrievedChunk } from "@/lib/rag/retrieve";

const chunk = (over: Partial<RetrievedChunk>): RetrievedChunk => ({
  id: "c1",
  content: "some content",
  documentId: "d1",
  filename: "doc.pdf",
  similarity: 0.9,
  ...over,
});

describe("buildSystemPrompt", () => {
  it("numbers the sources starting at 1", () => {
    const prompt = buildSystemPrompt([
      chunk({ content: "first passage" }),
      chunk({ content: "second passage" }),
    ]);
    expect(prompt).toContain("[1]");
    expect(prompt).toContain("[2]");
    expect(prompt).not.toContain("[3]");
  });

  it("includes each chunk's content and filename", () => {
    const prompt = buildSystemPrompt([
      chunk({ content: "the mitochondria", filename: "biology.pdf" }),
    ]);
    expect(prompt).toContain("the mitochondria");
    expect(prompt).toContain("biology.pdf");
  });

  it("instructs the model to cite sources and to answer only from them", () => {
    const prompt = buildSystemPrompt([chunk({})]);
    expect(prompt.toLowerCase()).toContain("cite");
    expect(prompt.toLowerCase()).toContain("only");
  });

  it("tells the model to decline when the answer is not in the sources", () => {
    const prompt = buildSystemPrompt([chunk({})]);
    // Guardrail against hallucination when retrieval is weak.
    expect(prompt.toLowerCase()).toContain("could not find");
  });

  it("handles an empty source list without throwing", () => {
    expect(() => buildSystemPrompt([])).not.toThrow();
  });
});
