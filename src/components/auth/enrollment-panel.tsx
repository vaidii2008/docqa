"use client";

import { useState, useActionState } from "react";
import {
  startEnrollment,
  confirmEnrollment,
  type StartEnrollmentState,
  type ConfirmEnrollmentState,
} from "@/lib/auth/enrollment";

const initialConfirmState: ConfirmEnrollmentState = {};

export function EnrollmentPanel({ enabledAt }: { enabledAt: Date | null }) {
  const [start, setStart] = useState<StartEnrollmentState | null>(null);
  const [starting, setStarting] = useState(false);
  const [confirmState, confirmAction, confirming] = useActionState(
    confirmEnrollment,
    initialConfirmState,
  );

  if (enabledAt || confirmState.success) {
    return (
      <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Two factor authentication is on. You will be asked for a code from your
        authenticator app the next time you sign in.
      </p>
    );
  }

  if (!start?.qrSvg) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={starting}
          onClick={async () => {
            setStarting(true);
            setStart(await startEnrollment());
            setStarting(false);
          }}
          className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
        >
          {starting ? "Setting up..." : "Set up two factor authentication"}
        </button>
        {start?.error ? (
          <p className="text-sm text-red-600" role="alert">
            {start.error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm">
        Scan this with your authenticator app, then enter the 6 digit code it
        shows.
      </p>

      <div
        className="w-[200px] rounded-lg border border-gray-200 bg-white p-2"
        // The QR is generated on the server, so the secret arrives as a drawn
        // image rather than as a string in client side JavaScript.
        dangerouslySetInnerHTML={{ __html: start.qrSvg }}
      />

      {start.manualKey ? (
        <p className="text-xs text-gray-500">
          Cannot scan? Enter this key manually:{" "}
          <code className="font-mono">{start.manualKey}</code>
        </p>
      ) : null}

      <form action={confirmAction} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="code" className="text-sm font-medium">
            Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            required
            className="w-40 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm outline-none focus:border-gray-900"
          />
        </div>

        {confirmState.error ? (
          <p className="text-sm text-red-600" role="alert">
            {confirmState.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={confirming}
          className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
        >
          {confirming ? "Verifying..." : "Turn on"}
        </button>
      </form>
    </div>
  );
}
