import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import {
  generateRecoveryCodes,
  hashRecoveryCodes,
  normaliseCode,
} from "@/lib/auth/recovery-codes";

describe("generateRecoveryCodes", () => {
  it("returns ten codes in the expected shape", () => {
    const codes = generateRecoveryCodes();

    expect(codes).toHaveLength(10);
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z0-9]{5}-[A-Z0-9]{5}$/);
    }
  });

  it("omits characters that are easy to misread", () => {
    // I, L, O and U are excluded so a user copying a code off a printout
    // cannot confuse them with 1, 0 or V.
    const codes = generateRecoveryCodes().join("");

    expect(codes).not.toMatch(/[ILOU]/);
  });

  it("does not repeat codes within a batch", () => {
    const codes = generateRecoveryCodes();

    expect(new Set(codes).size).toBe(codes.length);
  });

  it("does not repeat codes across batches", () => {
    const first = generateRecoveryCodes();
    const second = generateRecoveryCodes();

    expect(first.some((code) => second.includes(code))).toBe(false);
  });
});

describe("hashRecoveryCodes", () => {
  it("produces hashes that verify against the original code", async () => {
    const codes = generateRecoveryCodes();
    const hashes = await hashRecoveryCodes(codes);

    expect(hashes).toHaveLength(codes.length);
    await expect(
      bcrypt.compare(normaliseCode(codes[0]), hashes[0]),
    ).resolves.toBe(true);
  });

  it("does not store the code in a recoverable form", async () => {
    const codes = generateRecoveryCodes();
    const hashes = await hashRecoveryCodes(codes);

    expect(hashes[0]).not.toContain(normaliseCode(codes[0]));
  });

  it("rejects a code that was not in the batch", async () => {
    const [issued] = generateRecoveryCodes();
    const [hash] = await hashRecoveryCodes([issued]);

    await expect(bcrypt.compare("ABCDE-FGHJK", hash)).resolves.toBe(false);
  });
});

describe("normaliseCode", () => {
  it("accepts a code however the user formats it", () => {
    // The same code typed with the dash, without it, lowercase, or with
    // stray spaces must all resolve to one value.
    expect(normaliseCode("ABCDE-FGHJK")).toBe("ABCDEFGHJK");
    expect(normaliseCode("abcde-fghjk")).toBe("ABCDEFGHJK");
    expect(normaliseCode("ABCDEFGHJK")).toBe("ABCDEFGHJK");
    expect(normaliseCode(" abcde fghjk ")).toBe("ABCDEFGHJK");
  });
});
