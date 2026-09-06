import { TOTP, Secret } from "otpauth";

// The label shown in the user's authenticator app next to the code.
const ISSUER = "DocQA";

/**
 * Build a TOTP instance for a given secret. Centralised so the algorithm,
 * digit count and period are defined once: a mismatch between enrollment and
 * verification would produce codes that never validate.
 */
function createTotp(secret: string, email: string): TOTP {
  return new TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });
}

/**
 * Generate a fresh base32 secret. This is the shared secret both the server
 * and the authenticator app hold: TOTP is symmetric, so each side derives the
 * same code from the secret plus the current time, and no code ever travels
 * between them.
 */
export function generateTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

/**
 * The otpauth:// URI that an authenticator app reads from a QR code. It
 * carries the secret, so it must never be logged or persisted anywhere.
 */
export function buildTotpUri(secret: string, email: string): string {
  return createTotp(secret, email).toString();
}

/**
 * Check a user supplied 6 digit code against the secret.
 *
 * The window of 1 accepts the previous and next 30 second step as well as the
 * current one, which absorbs clock drift between the phone and the server.
 * Widening it further would meaningfully enlarge the guessing window, so 1 is
 * the usual compromise between usability and strength.
 */
export function verifyTotpCode(params: {
  secret: string;
  email: string;
  code: string;
}): boolean {
  const { secret, email, code } = params;
  const normalised = code.replace(/\s/g, "");

  if (!/^\d{6}$/.test(normalised)) {
    return false;
  }

  const delta = createTotp(secret, email).validate({
    token: normalised,
    window: 1,
  });

  // validate returns null on failure, or the time step offset on success.
  return delta !== null;
}
