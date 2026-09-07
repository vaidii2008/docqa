import { cookies } from "next/headers";
import { EncryptJWT, jwtDecrypt } from "jose";
import { createHash } from "node:crypto";

const COOKIE_NAME = "docqa_totp_enrollment";
const TTL_SECONDS = 600;

/**
 * jose needs a 32 byte key for A256GCM. AUTH_SECRET is an arbitrary length
 * string, so hash it to the right size rather than requiring a second secret
 * in the environment.
 */
function getKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new Uint8Array(createHash("sha256").update(secret).digest());
}

/**
 * Hold the candidate TOTP secret between showing the QR code and confirming
 * the first valid code.
 *
 * Encrypted rather than merely signed, because the payload is the secret
 * itself: a signed cookie would be tamper evident but still readable by
 * anything that can see the request. It is deliberately not stored on the
 * User row yet, so an abandoned enrollment leaves the account untouched.
 */
export async function setPendingSecret(secret: string): Promise<void> {
  const token = await new EncryptJWT({ secret })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .encrypt(getKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

/**
 * Read the pending secret back, or null if it is missing, expired, or fails
 * to decrypt.
 */
export async function getPendingSecret(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtDecrypt(token, getKey());
    const secret = payload.secret;
    return typeof secret === "string" ? secret : null;
  } catch {
    return null;
  }
}

/**
 * Clear the cookie once enrollment succeeds or is abandoned, so a stale
 * candidate secret cannot be confirmed later.
 */
export async function clearPendingSecret(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
