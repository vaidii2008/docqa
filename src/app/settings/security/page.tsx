import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { EnrollmentPanel } from "@/components/auth/enrollment-panel";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { outlineButton } from "@/components/ui/button-variants";

export default async function SecurityPage() {
  const userId = await requireUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpEnabledAt: true },
  });

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-12">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Security</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard" className={outlineButton}>
            Back
          </Link>
        </div>
      </div>

      <section aria-labelledby="two-factor-title" className="mt-10">
        <h2 id="two-factor-title" className="text-lg font-semibold">
          Two factor authentication
        </h2>
        <p className="text-fg-muted mt-1 text-sm">
          Pair an authenticator app on your phone with your account to generate
          one time codes.
        </p>

        <div className="mt-5">
          <EnrollmentPanel enabledAt={user?.totpEnabledAt ?? null} />
        </div>
      </section>
    </main>
  );
}
