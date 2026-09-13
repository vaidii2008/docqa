"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import {
  generateTotpSecret,
  buildTotpUri,
  verifyTotpCode,
} from "@/lib/auth/totp";
import { renderQrSvg } from "@/lib/auth/qr";
import { totpRatelimit } from "@/lib/rate-limit";
import {
  generateRecoveryCodes,
  hashRecoveryCodes,
} from "@/lib/auth/recovery-codes";
import {
  setPendingSecret,
  getPendingSecret,
  clearPendingSecret,
} from "@/lib/auth/enrollment-cookie";

export type StartEnrollmentState = {
  qrSvg?: string;
  manualKey?: string;
  error?: string;
};

export type ConfirmEnrollmentState = {
  success?: boolean;
  // Plaintext recovery codes, returned exactly once. Only their hashes are
  // stored, so there is no way to show them again after this response.
  recoveryCodes?: string[];
  error?: string;
};

/**
 * Begin enrollment: mint a candidate secret, stash it in the encrypted cookie
 * and hand back a QR code. Nothing is written to the User row here, so an
 * abandoned enrollment leaves the account exactly as it was.
 */
export async function startEnrollment(): Promise<StartEnrollmentState> {
  const userId = await requireUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, totpSecret: true },
  });

  if (!user) {
    return { error: "We could not load your account" };
  }

  if (user.totpSecret) {
    return { error: "Two factor authentication is already enabled" };
  }

  const secret = generateTotpSecret();
  await setPendingSecret(secret);

  return {
    qrSvg: await renderQrSvg(buildTotpUri(secret, user.email)),
    // Shown alongside the QR so someone on a desktop authenticator, or anyone
    // who cannot scan, can still enroll by typing the key.
    manualKey: secret,
  };
}

/**
 * Finish enrollment: verify a code generated from the candidate secret, and
 * only persist the secret once that succeeds.
 *
 * Confirming before storing is the point. It proves the authenticator app and
 * the server agree, so a user cannot end up with 2FA enabled against a secret
 * their phone never received, which would lock them out permanently.
 */
export type DisableState = {
  success?: boolean;
  error?: string;
};

/**
 * Turn the second factor off. Requires a current code, so someone who walks up
 * to an unlocked laptop cannot strip the protection without the phone.
 *
 * Recovery codes are deleted alongside the secret: they exist only to stand in
 * for that secret, so leaving them behind would keep working credentials for a
 * factor that no longer exists.
 */
export async function disableTotp(
  _prevState: DisableState,
  formData: FormData,
): Promise<DisableState> {
  const userId = await requireUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, totpSecret: true },
  });

  if (!user?.totpSecret) {
    return { error: "Two factor authentication is not enabled" };
  }

  const code = formData.get("code");
  if (typeof code !== "string") {
    return { error: "Enter the 6 digit code from your authenticator app" };
  }

  const { success } = await totpRatelimit.limit(`disable:${userId}`);
  if (!success) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  if (!verifyTotpCode({ secret: user.totpSecret, email: user.email, code })) {
    return { error: "That code is not valid. Check your app and try again." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { totpSecret: null, totpEnabledAt: null },
    }),
    prisma.recoveryCode.deleteMany({ where: { userId } }),
  ]);

  revalidatePath("/settings/security");

  return { success: true };
}

export async function confirmEnrollment(
  _prevState: ConfirmEnrollmentState,
  formData: FormData,
): Promise<ConfirmEnrollmentState> {
  const userId = await requireUserId();

  const secret = await getPendingSecret();
  if (!secret) {
    return { error: "That enrollment expired. Start again to get a new code." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, totpSecret: true },
  });

  if (!user) {
    return { error: "We could not load your account" };
  }

  if (user.totpSecret) {
    await clearPendingSecret();
    return { error: "Two factor authentication is already enabled" };
  }

  const code = formData.get("code");
  if (typeof code !== "string") {
    return { error: "Enter the 6 digit code from your authenticator app" };
  }

  // Keyed by user id, so one account cannot grind through the code space and
  // cannot exhaust anyone else's allowance either.
  const { success } = await totpRatelimit.limit(`enroll:${userId}`);
  if (!success) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  if (!verifyTotpCode({ secret, email: user.email, code })) {
    return { error: "That code is not valid. Check your app and try again." };
  }

  const recoveryCodes = generateRecoveryCodes();
  const codeHashes = await hashRecoveryCodes(recoveryCodes);

  // One transaction so a user can never end up with the second factor enabled
  // but no recovery codes, which would be an unrecoverable lockout if they
  // lost their phone.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { totpSecret: secret, totpEnabledAt: new Date() },
    }),
    prisma.recoveryCode.createMany({
      data: codeHashes.map((codeHash) => ({ codeHash, userId })),
    }),
  ]);

  await clearPendingSecret();
  revalidatePath("/settings/security");

  return { success: true, recoveryCodes };
}
