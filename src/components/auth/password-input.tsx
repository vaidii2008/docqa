"use client";

import { useState } from "react";

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
}

/**
 * A password field with a show and hide toggle. Shared by the login and signup
 * forms so the accessibility details are written once rather than twice.
 *
 * The toggle only swaps the input type, so the value still posts normally and
 * the browser password manager still recognises the field through its
 * autoComplete hint.
 */
export function PasswordInput({
  id,
  name,
  label,
  autoComplete,
  minLength,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const action = visible ? "Hide password" : "Show password";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm outline-none focus:border-gray-900"
        />
        <button
          // type="button" is load bearing. A button inside a form defaults to
          // type="submit", so without this every attempt to peek at the
          // password would submit the form.
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
          aria-controls={id}
          // aria-label names the button for screen readers, title gives sighted
          // users the same text on hover. Both are needed: an icon on its own
          // has no accessible name, and title alone is not reliably announced.
          aria-label={action}
          title={action}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

// aria-hidden because the button already carries the accessible name. Without
// it a screen reader would announce the decorative graphic as well.
function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.7 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.8 17.8 0 0 1-3.1 4.1" />
      <path d="M6.6 6.6A17.8 17.8 0 0 0 2 12s3.5 7 10 7a10.7 10.7 0 0 0 5.4-1.4" />
      <path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" />
      <path d="m2 2 20 20" />
    </svg>
  );
}
