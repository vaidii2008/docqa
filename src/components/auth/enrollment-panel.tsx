"use client";

import { useState, useActionState } from "react";
import {
  startEnrollment,
  confirmEnrollment,
  disableTotp,
  type StartEnrollmentState,
  type ConfirmEnrollmentState,
  type DisableState,
} from "@/lib/auth/enrollment";

const initialConfirmState: ConfirmEnrollmentState = {};
const initialDisableState: DisableState = {};

export function EnrollmentPanel({ enabledAt }: { enabledAt: Date | null }) {
  const [start, setStart] = useState<StartEnrollmentState | null>(null);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [disableState, disableAction, disablePending] = useActionState(
    disableTotp,
    initialDisableState,
  );
  const [confirmState, confirmAction, confirming] = useActionState(
    confirmEnrollment,
    initialConfirmState,
  );

  // Shown once, immediately after enrollment. Only hashes are stored, so
  // navigating away loses these codes permanently.
  if (confirmState.recoveryCodes?.length) {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Two factor authentication is on.
        </p>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            Save your recovery codes
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Each code works once, and only if you lose access to your
            authenticator app. This is the only time they will be shown.
          </p>

          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm text-amber-900">
            {confirmState.recoveryCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(
                confirmState.recoveryCodes?.join("\n") ?? "",
              );
              setCopied(true);
            }}
            className="mt-4 rounded-md border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100"
          >
            {copied ? "Copied" : "Copy codes"}
          </button>
        </div>
      </div>
    );
  }

  if (enabledAt && !disableState.success) {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Two factor authentication is on. You will be asked for a code from
          your authenticator app the next time you sign in.
        </p>

        {disabling ? (
          <form action={disableAction} className="flex flex-col gap-3">
            <p className="text-sm">
              Enter a current code to turn this off. Your recovery codes will be
              deleted too.
            </p>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="disable-code" className="text-sm font-medium">
                Code
              </label>
              <input
                id="disable-code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                required
                className="w-40 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm outline-none focus:border-gray-900"
              />
            </div>

            {disableState.error ? (
              <p className="text-sm text-red-600" role="alert">
                {disableState.error}
              </p>
            ) : null}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={disablePending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {disablePending ? "Turning off..." : "Turn off"}
              </button>
              <button
                type="button"
                onClick={() => setDisabling(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setDisabling(true)}
            className="self-start text-sm font-medium text-red-600 underline transition-colors hover:text-red-700"
          >
            Turn off two factor authentication
          </button>
        )}
      </div>
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
