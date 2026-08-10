import { extractText } from "unpdf";

/**
 * Extract all text from a PDF given its raw bytes.
 * Pages are merged into one string. Null bytes are stripped because Postgres
 * text columns cannot store them, and leading/trailing whitespace is trimmed.
 */
export async function extractPdfText(data: Uint8Array): Promise<string> {
  const { text } = await extractText(data, { mergePages: true });
  const merged = Array.isArray(text) ? text.join("\n\n") : text;
  return merged.replace(/\u0000/g, "").trim();
}
