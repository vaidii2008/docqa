"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

// The server cannot know the visitor's theme, so anything that depends on it
// must wait until the browser takes over. useSyncExternalStore answers "are we
// on the client yet" without a hydration mismatch: the server snapshot says
// false, the client snapshot says true.
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isClient = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const isDark = isClient && resolvedTheme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      // type="button" so the toggle never submits a form it sits inside.
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className="relative grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-surface text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {/* The icons swap with CSS keyed off data-theme, which next-themes sets
          before the first paint, so the right icon shows even before React
          loads. Only the label above needs JavaScript. */}
      <MoonIcon />
      <SunIcon />
    </button>
  );
}

// aria-hidden because the button already carries the accessible name.
function MoonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="absolute transition-all duration-500 ease-out motion-reduce:transition-none dark:-rotate-90 dark:scale-50 dark:opacity-0"
    >
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
      className="absolute rotate-90 scale-50 opacity-0 transition-all duration-500 ease-out motion-reduce:transition-none dark:rotate-0 dark:scale-100 dark:opacity-100"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </svg>
  );
}
