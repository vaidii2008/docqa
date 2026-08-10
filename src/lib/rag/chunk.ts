export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

const DEFAULT_CHUNK_SIZE = 200;
const DEFAULT_CHUNK_OVERLAP = 40;

/**
 * Split text into overlapping chunks, measured in words.
 *
 * Each chunk holds up to `chunkSize` words, and consecutive chunks share
 * `chunkOverlap` words so context that straddles a boundary is preserved.
 * Word boundaries are used so chunks never cut a word in half. Returns an
 * empty array for empty or whitespace-only input.
 */
export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunkOverlap = options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP;

  if (chunkSize <= 0) {
    throw new Error("chunkSize must be greater than 0");
  }
  if (chunkOverlap < 0 || chunkOverlap >= chunkSize) {
    throw new Error("chunkOverlap must be between 0 and chunkSize");
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  // The window advances by (chunkSize - chunkOverlap) words each step, so
  // consecutive chunks share exactly `chunkOverlap` words.
  const step = chunkSize - chunkOverlap;
  const chunks: string[] = [];

  for (let start = 0; start < words.length; start += step) {
    const chunk = words.slice(start, start + chunkSize).join(" ");
    chunks.push(chunk);
    // Once a window reaches the end, stop so we do not emit a tiny trailing
    // chunk that is already fully contained in the previous overlap.
    if (start + chunkSize >= words.length) {
      break;
    }
  }

  return chunks;
}
