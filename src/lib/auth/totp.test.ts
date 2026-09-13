import { describe, it, expect } from "vitest";
import { TOTP, Secret } from "otpauth";
import {
  generateTotpSecret,
  buildTotpUri,
  verifyTotpCode,
} from "@/lib/auth/totp";

const EMAIL = "demo@example.com";

// Generates a valid code the same way an authenticator app would, so the test
// exercises the real algorithm rather than reusing the module under test.
function codeFor(secret: string, at?: Date): string {
  const totp = new TOTP({
    issuer: "DocQA",
    label: EMAIL,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });
  return totp.generate(at ? { timestamp: at.getTime() } : undefined);
}

describe("generateTotpSecret", () => {
  it("returns a distinct base32 secret each time", () => {
    const first = generateTotpSecret();
    const second = generateTotpSecret();

    expect(first).toMatch(/^[A-Z2-7]+$/);
    expect(first).not.toBe(second);
  });
});

describe("buildTotpUri", () => {
  it("produces an otpauth URI carrying the issuer and secret", () => {
    const secret = generateTotpSecret();
    const uri = buildTotpUri(secret, EMAIL);

    expect(uri.startsWith("otpauth://totp/")).toBe(true);
    expect(uri).toContain("issuer=DocQA");
    expect(uri).toContain(`secret=${secret}`);
  });
});

describe("verifyTotpCode", () => {
  it("accepts the code for the current time step", () => {
    const secret = generateTotpSecret();

    expect(
      verifyTotpCode({ secret, email: EMAIL, code: codeFor(secret) }),
    ).toBe(true);
  });

  it("accepts a code from the adjacent time step", () => {
    // Clock drift between a phone and the server is normal, which is why the
    // verification window spans one step either side of the current one.
    const secret = generateTotpSecret();
    const thirtySecondsAgo = new Date(Date.now() - 30_000);

    expect(
      verifyTotpCode({
        secret,
        email: EMAIL,
        code: codeFor(secret, thirtySecondsAgo),
      }),
    ).toBe(true);
  });

  it("rejects a code from well outside the window", () => {
    const secret = generateTotpSecret();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000);

    expect(
      verifyTotpCode({
        secret,
        email: EMAIL,
        code: codeFor(secret, fiveMinutesAgo),
      }),
    ).toBe(false);
  });

  it("rejects a code generated from a different secret", () => {
    const secret = generateTotpSecret();
    const otherSecret = generateTotpSecret();

    expect(
      verifyTotpCode({ secret, email: EMAIL, code: codeFor(otherSecret) }),
    ).toBe(false);
  });

  it("rejects malformed input without consulting the algorithm", () => {
    const secret = generateTotpSecret();

    expect(verifyTotpCode({ secret, email: EMAIL, code: "" })).toBe(false);
    expect(verifyTotpCode({ secret, email: EMAIL, code: "12345" })).toBe(false);
    expect(verifyTotpCode({ secret, email: EMAIL, code: "abcdef" })).toBe(false);
  });

  it("tolerates spaces, since authenticator apps display codes grouped", () => {
    const secret = generateTotpSecret();
    const code = codeFor(secret);
    const spaced = `${code.slice(0, 3)} ${code.slice(3)}`;

    expect(verifyTotpCode({ secret, email: EMAIL, code: spaced })).toBe(true);
  });
});
