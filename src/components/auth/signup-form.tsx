"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser, type RegisterState } from "@/lib/auth/register";

const initialState: RegisterState = {};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState,
  );

  if (state.success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Account created. You can now{" "}
        <Link href="/login" className="font-medium underline">
          sign in
        </Link>
        .
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.requestSubmit();
        }
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
