import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { EnrollmentPanel } from "@/components/auth/enrollment-panel";

export default async function SecurityPage() {
  const userId = await requireUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpEnabledAt: true },
  });

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Security</h1>
        <Link
          href="/dashboard"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100"
        >
          Back
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Two factor authentication</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add a second step to sign in, using a code from an authenticator app
          on your phone.
        </p>

        <div className="mt-4">
          <EnrollmentPanel enabledAt={user?.totpEnabledAt ?? null} />
        </div>
      </section>
    </main>
  );
}
