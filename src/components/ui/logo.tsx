// The DocQA mark: a page on the brand gradient. Decorative, so it is hidden
// from screen readers; the "DocQA" wordmark beside it carries the name.
export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`from-accent-1 via-accent-2 to-accent-3 dark:text-background grid shrink-0 place-items-center rounded-full bg-linear-to-br text-white ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-[58%]"
      >
        <path d="M8.5 3.5h5l4 4v11a1.5 1.5 0 0 1-1.5 1.5H8.5A1.5 1.5 0 0 1 7 18.5V5a1.5 1.5 0 0 1 1.5-1.5Z" />
        <path d="M10 12h5M10 15.5h3" />
      </svg>
    </span>
  );
}
