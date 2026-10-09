import type { ReactNode } from "react";

// Only claims that are true today. Two step verification joins this list
// once sign in actually asks for the code.
const POINTS: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Private workspaces",
    body: "Every search and every answer is scoped to your account. Nobody else can see, search or cite your files.",
    icon: <LockIcon />,
  },
  {
    title: "Passwords hashed with bcrypt",
    body: "Your password is never stored, only a slow, salted hash of it, so a leaked database does not leak your login.",
    icon: <KeyIcon />,
  },
  {
    title: "Fair use limits",
    body: "Each account has its own rate limit, so answers stay fast and no one can drain the AI quota for everyone else.",
    icon: <GaugeIcon />,
  },
];

export function Privacy() {
  return (
    <section
      id="privacy"
      aria-labelledby="privacy-title"
      className="mx-auto w-full max-w-6xl scroll-mt-6 px-5 pt-22 pb-10"
    >
      <h2
        id="privacy-title"
        className="text-center text-[clamp(2rem,4vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance"
      >
        Private by design.{" "}
        <span className="text-fg-muted">Your files stay yours.</span>
      </h2>

      <ul className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
        {POINTS.map((point) => (
          <li
            key={point.title}
            className="bg-surface flex flex-col gap-3 rounded-[28px] p-7.5"
          >
            <span className="bg-primary-container text-on-primary-container grid size-12 place-items-center rounded-full">
              {point.icon}
            </span>
            <h3 className="mt-2 text-[22px] font-semibold">{point.title}</h3>
            <p className="text-fg-muted">{point.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Decorative: each card's heading already says what the icon shows.
function LockIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12 20 3M16.5 6.5 19 9M14 9l2 2" />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 13l3.5-3M9.5 3h5" />
    </svg>
  );
}
