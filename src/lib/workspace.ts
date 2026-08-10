import { prisma } from "@/lib/db";

/**
 * Return the user's default workspace, creating it on first use. Every user
 * gets exactly one "My Documents" workspace for now; multi-workspace
 * management can come later without changing this contract.
 */
export async function getOrCreateDefaultWorkspace(userId: string) {
  const existing = await prisma.workspace.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.workspace.create({
    data: { name: "My Documents", userId },
  });
}
