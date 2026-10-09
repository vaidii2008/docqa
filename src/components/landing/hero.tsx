import Link from "next/link";
import { outlineButton, tonalButton } from "@/components/ui/button-variants";
import { REPO_URL } from "@/lib/site";

const STARTERS = [
  "Summarise a report",
  "Find a clause in a contract",
  "Pull dates from a policy",
  "Quiz me on my notes",
];

export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-5 pt-14 pb-10 text-center sm:pt-24">
      <a href={REPO_URL} className={tonalButton}>
        Open source on GitHub
        <ArrowUpRightIcon />
      </a>

      <h1 className="mt-7 text-[clamp(2.625rem,6.4vw,5.25rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance">
        Ask anything about <span className="glow-text">your documents</span>
      </h1>

      <p className="text-fg-muted mt-5 max-w-xl text-[clamp(1.0625rem,1.6vw,1.25rem)] text-pretty">
        DocQA reads your PDFs, finds the passages that matter, and answers with
        citations you can check.
      </p>

      {/* A preview of the real question box. It links to sign up rather than
          accepting text, because asking needs an account and documents. */}
      <Link
        href="/signup"
        aria-label="Get started and ask your first question"
        className="glow-ring shadow-soft focus-visible:outline-primary mt-10 block w-full max-w-3xl rounded-[32px] p-[1.5px] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <span className="bg-surface flex items-center gap-1.5 rounded-[30px] p-2 text-left">
          <span className="text-fg-muted grid size-11 shrink-0 place-items-center rounded-full">
            <PlusIcon />
          </span>
          <span className="text-fg-muted min-w-0 flex-1 truncate px-1 py-2.5 text-[17px]">
            Ask about your documents
          </span>
          <span className="bg-primary text-on-primary grid size-11 shrink-0 place-items-center rounded-full">
            <ArrowUpIcon />
          </span>
        </span>
      </Link>

      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        {STARTERS.map((label) => (
          <Link key={label} href="/signup" className={outlineButton}>
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}

// Icons are aria-hidden: the surrounding link text names the action.
function PlusIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}
