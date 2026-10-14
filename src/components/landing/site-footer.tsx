import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { quietButton } from "@/components/ui/button-variants";
import { REPO_URL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="text-fg-muted mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 pt-6 pb-10 text-sm">
      <p className="flex items-center gap-2.5">
        <Logo className="size-6" />
        <span>
          <strong className="text-fg font-semibold">DocQA</strong> · Open
          source, MIT licensed.
        </span>
      </p>
      <nav aria-label="Footer" className="flex flex-wrap gap-1">
        <a href={REPO_URL} className={quietButton}>
          GitHub
        </a>
        <a href="#privacy" className={quietButton}>
          Privacy
        </a>
        <Link href="/login" className={quietButton}>
          Sign in
        </Link>
      </nav>
    </footer>
  );
}
