import { prisma } from "@/lib/db";

/**
 * Write an embedding to a chunk. Prisma cannot set an Unsupported(vector)
 * column through its typed API, so we use a parameterized raw query: the
 * vector is passed as a string like "[0.1,0.2,...]" and cast to vector.
 * Parameterized (not string-interpolated) to stay safe from SQL injection.
 */
export async function setChunkEmbedding(
  chunkId: string,
  embedding: number[],
): Promise<void> {
  const literal = `[${embedding.join(",")}]`;
  await prisma.$executeRaw`
    UPDATE "Chunk"
    SET "embedding" = ${literal}::vector
    WHERE "id" = ${chunkId}
  `;
}
