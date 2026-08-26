import { describe, it, expect } from "vitest";
import { chunkText } from "@/lib/rag/chunk";

// Helper: build a string of N sequential words "w1 w2 ... wN".
const words = (n: number) =>
  Array.from({ length: n }, (_, i) => `w${i + 1}`).join(" ");

describe("chunkText", () => {
  it("returns an empty array for empty or whitespace-only input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n\t  ")).toEqual([]);
  });

  it("returns a single chunk when the text is shorter than the chunk size", () => {
    const result = chunkText("hello world foo", {
      chunkSize: 5,
      chunkOverlap: 2,
    });
    expect(result).toEqual(["hello world foo"]);
  });

  it("splits long text into overlapping chunks", () => {
    const result = chunkText(words(10), { chunkSize: 5, chunkOverlap: 2 });
    expect(result).toEqual([
      "w1 w2 w3 w4 w5",
      "w4 w5 w6 w7 w8",
      "w7 w8 w9 w10",
    ]);
  });

  it("makes consecutive chunks overlap by exactly chunkOverlap words", () => {
    const result = chunkText(words(12), { chunkSize: 4, chunkOverlap: 1 });
    for (let i = 0; i < result.length - 1; i++) {
      const prev = result[i].split(" ");
      const next = result[i + 1].split(" ");
      expect(prev[prev.length - 1]).toBe(next[0]);
    }
  });

  it("normalizes whitespace and never splits a word", () => {
    const result = chunkText("  alpha   beta\n\ngamma  ", {
      chunkSize: 2,
      chunkOverlap: 0,
    });
    expect(result).toEqual(["alpha beta", "gamma"]);
  });

  it("throws when chunkSize is not positive", () => {
    expect(() => chunkText("a b c", { chunkSize: 0 })).toThrow();
  });

  it("throws when chunkOverlap is greater than or equal to chunkSize", () => {
    expect(() => chunkText("a b c", { chunkSize: 3, chunkOverlap: 3 })).toThrow();
  });

  it("uses default options (200/40) when none are provided", () => {
    const result = chunkText(words(250));
    expect(result.length).toBe(2);
    expect(result[0].split(" ").length).toBe(200);
  });
});
