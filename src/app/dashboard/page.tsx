import { signOut } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Signed in as {user?.email}
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
          >
            Sign out
          </button>
        </form>
      </div>

      <p className="mt-8 text-sm text-gray-600">
        Your workspaces will appear here.
      </p>
    </main>
  );
}
