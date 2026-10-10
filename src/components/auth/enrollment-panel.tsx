"use client";

import { useActionState, useState } from "react";
import {
  confirmEnrollment,
  disableTotp,
  startEnrollment,
  type ConfirmEnrollmentState,
  type DisableState,
  type StartEnrollmentState,
} from "@/lib/auth/enrollment";
import { OtpInput } from "@/components/ui/otp-input";
import {
  dangerButton,
  filledButton,
  outlineButton,
  tonalButton,
} from "@/components/ui/button-variants";

// Every completed attempt bumps a counter that is used as the code input's
// key. A new key remounts the boxes, so after a wrong code they come back
// empty, focused on the first digit and shaking, with no state to reset by
// hand.
type Attempted<T> = T & { attempt: number };

async function confirmWithAttempt(
  previous: Attempted<ConfirmEnrollmentState>,
  formData: FormData,
): Promise<Attempted<ConfirmEnrollmentState>> {
  return {
    ...(await confirmEnrollment(previous, formData)),
    attempt: previous.attempt + 1,
  };
}

async function disableWithAttempt(
  previous: Attempted<DisableState>,
  formData: FormData,
): Promise<Attempted<DisableState>> {
  return {
    ...(await disableTotp(previous, formData)),
    attempt: previous.attempt + 1,
  };
}

const CODE_LABEL = "6 digit code from your authenticator app";

export function EnrollmentPanel({ enabledAt }: { enabledAt: Date | null }) {
  const [start, setStart] = useState<StartEnrollmentState | null>(null);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [confirmState, confirmAction, confirming] = useActionState(
    confirmWithAttempt,
    { attempt: 0 },
  );
  const [disableState, disableAction, disablePending] = useActionState(
    disableWithAttempt,
    { attempt: 0 },
  );

  // Cancel closes the turn off form but cannot clear the action's state, so
  // remember the attempt it happened at and only show errors from later
  // attempts. Reopening then starts clean instead of replaying an old error.
  const [cancelledAt, setCancelledAt] = useState(0);
  const disableError =
    disableState.attempt > cancelledAt ? disableState.error : undefined;

  // Shown once, immediately after enrollment. Only hashes are stored, so
  // navigating away loses these codes permanently.
  if (confirmState.recoveryCodes?.length) {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="status"
          className="bg-success-container text-success rounded-2xl px-4 py-3 text-sm font-medium"
        >
          Two factor authentication is on.
        </p>

        <div className="bg-surface rounded-3xl p-5 sm:p-6">
          <h3 className="font-semibold">Save your recovery codes</h3>
          <p className="text-fg-muted mt-1 text-sm">
            Each code works once, and only if you lose access to your
            authenticator app. This is the only time they will be shown.
          </p>

          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-[15px]">
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
            className={`${tonalButton} mt-5`}
          >
            {copied ? "Copied" : "Copy codes"}
          </button>
        </div>
      </div>
    );
  }

  if (enabledAt && !disableState.success) {
    return (
      <div className="flex flex-col gap-4">
        <p className="bg-success-container text-success rounded-2xl px-4 py-3 text-sm font-medium">
          Two factor authentication is on for this account.
        </p>

        {disabling ? (
          <form
            action={disableAction}
            className="bg-surface flex flex-col gap-4 rounded-3xl p-5 sm:p-6"
          >
            <p className="text-sm">
              Enter a current code to turn this off. Your recovery codes will be
              deleted too.
            </p>

            <OtpInput
              key={disableState.attempt}
              name="code"
              label={CODE_LABEL}
              invalid={Boolean(disableError)}
              describedBy={disableError ? "disable-error" : undefined}
              disabled={disablePending}
              autoFocus
            />

            {disableError ? (
              <p
                id="disable-error"
                role="alert"
                className="text-danger text-sm"
              >
                {disableError}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={disablePending}
                className={dangerButton}
              >
                {disablePending ? "Turning off..." : "Turn off"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCancelledAt(disableState.attempt);
                  setDisabling(false);
                }}
                className={outlineButton}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setDisabling(true)}
            className="text-danger focus-visible:outline-primary min-h-11 self-start rounded-full px-1 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Turn off two factor authentication
          </button>
        )}
      </div>
    );
  }

  if (!start?.qrSvg) {
    return (
      <div className="flex flex-col gap-3">
        {disableState.success ? (
          <p
            role="status"
            className="bg-surface rounded-2xl px-4 py-3 text-sm font-medium"
          >
            Two factor authentication is off.
          </p>
        ) : null}

        <button
          type="button"
          disabled={starting}
          onClick={async () => {
            setStarting(true);
            setStart(await startEnrollment());
            setStarting(false);
          }}
          className={`${filledButton} self-start`}
        >
          {starting ? "Setting up..." : "Set up two factor authentication"}
        </button>

        {start?.error ? (
          <p role="alert" className="text-danger text-sm">
            {start.error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-fg-muted text-sm">
        Scan this with your authenticator app, then enter the 6 digit code it
        shows.
      </p>

      <div
        className="w-[216px] rounded-2xl bg-white p-2"
        // White in both themes on purpose: scanners need dark modules on a
        // light background. The QR is drawn on the server, so the secret
        // arrives as an image rather than as a string in client JavaScript.
        dangerouslySetInnerHTML={{ __html: start.qrSvg }}
      />

      {start.manualKey ? (
        <p className="text-fg-muted text-xs">
          Cannot scan? Enter this key manually:{" "}
          <code className="text-fg font-mono">{start.manualKey}</code>
        </p>
      ) : null}

      <form action={confirmAction} className="flex flex-col gap-4">
        <OtpInput
          key={confirmState.attempt}
          name="code"
          label={CODE_LABEL}
          invalid={Boolean(confirmState.error)}
          describedBy={confirmState.error ? "confirm-error" : undefined}
          disabled={confirming}
          autoFocus
        />

        {confirmState.error ? (
          <p id="confirm-error" role="alert" className="text-danger text-sm">
            {confirmState.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={confirming}
          className={`${filledButton} self-start`}
        >
          {confirming ? "Verifying..." : "Turn on"}
        </button>
      </form>
    </div>
  );
}
