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
          className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-16 text-sm outline-none focus:border-gray-900"
        />
        <button
          // type="button" is load bearing. A button inside a form defaults to
          // type="submit", so without this every attempt to peek at the
          // password would submit the form.
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
