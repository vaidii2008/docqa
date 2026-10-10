import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkLimit } from "@/lib/rate-limit/check-limit";

function limiterAnswering(answer: { success: boolean; reason?: string }) {
  return { limit: vi.fn().mockResolvedValue(answer) };
}

describe("checkLimit", () => {
  beforeEach(() => {
    // Outages are logged on purpose. Keep those lines out of the test output.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allows a request the limiter accepts", async () => {
    const limiter = limiterAnswering({ success: true });

    expect(await checkLimit(limiter, "user-1")).toBe("allowed");
    expect(limiter.limit).toHaveBeenCalledWith("user-1");
  });

  it("reports a request over the limit as limited", async () => {
    const limiter = limiterAnswering({ success: false });

    expect(await checkLimit(limiter, "user-1")).toBe("limited");
  });

  it("treats a timeout as unavailable, even though it says success", async () => {
    const limiter = limiterAnswering({ success: true, reason: "timeout" });

    expect(await checkLimit(limiter, "user-1")).toBe("unavailable");
  });

  it("treats a failed call as unavailable and logs it", async () => {
    const limiter = {
      limit: vi.fn().mockRejectedValue(new TypeError("fetch failed")),
    };

    expect(await checkLimit(limiter, "user-1")).toBe("unavailable");
    expect(console.error).toHaveBeenCalled();
  });
});
