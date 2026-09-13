import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";

const CODE_COUNT = 10;
const GROUP_LENGTH = 5;

// Crockford base32 without I, L, O, U: avoids characters a user could confuse
// when reading a code off a screen or a printout.
const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ0123456789";

function randomGroup(): string {
  let out = "";
  for (let i = 0; i < GROUP_LENGTH; i++) {
    // randomInt is drawn from the OS CSPRNG. Math.random is seeded
    // predictably and must never generate a credential.
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}

/**
 * Generate a batch of single use recovery codes in plaintext. These are shown
 * to the user exactly once at enrollment and never recoverable afterwards,
 * because only their hashes are stored.
 */
export function generateRecoveryCodes(): string[] {
  return Array.from(
    { length: CODE_COUNT },
    () => `${randomGroup()}-${randomGroup()}`,
  );
}

/**
 * Hash codes for storage. Hashed rather than stored plainly for the same
 * reason passwords are: a recovery code grants account access, so a leaked
 * table would otherwise hand over a working second factor for every user.
 */
export async function hashRecoveryCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((code) => bcrypt.hash(normaliseCode(code), 10)));
}

/**
 * Strip formatting so a user can type a code with or without its dash, and in
 * any case, without it being rejected as wrong.
 */
export function normaliseCode(code: string): string {
  return code.replace(/[\s-]/g, "").toUpperCase();
}
