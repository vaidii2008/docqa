import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  filledButton,
  quietButton,
  textButton,
} from "@/components/ui/button-variants";
import { REPO_URL } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
      <Link
        href="/"
        className="focus-visible:outline-primary flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <Logo />
        <span className="text-xl font-bold tracking-tight">DocQA</span>
      </Link>

      {/* Section links hide on phones, where the header keeps only the
          theme toggle and sign in. */}
      <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
        <a href="#how" className={quietButton}>
          How it works
        </a>
        <a href="#privacy" className={quietButton}>
          Privacy
        </a>
        <a href={REPO_URL} className={quietButton}>
          GitHub
        </a>
      </nav>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/login" className={textButton}>
          Sign in
        </Link>
        {/* On phones the hero question box is the way in for new visitors,
            which leaves room for sign in so returning users are not stranded. */}
        <span className="hidden sm:block">
          <Link href="/signup" className={filledButton}>
            Get started
          </Link>
        </span>
      </div>
    </header>
  );
}
