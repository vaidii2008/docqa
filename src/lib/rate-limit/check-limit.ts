// What a limiter said about one request, reduced to the three outcomes a
// caller actually has to handle.
export type LimitResult = "allowed" | "limited" | "unavailable";

// The one method needed from @upstash/ratelimit, so tests can pass a stand in
// without touching Redis.
interface Limiter {
  limit(key: string): Promise<{ success: boolean; reason?: string }>;
}

/**
 * Ask a limiter about one request without letting an outage escape as an
 * exception that takes the whole page down.
 *
 * "unavailable" covers a failed call (Redis unreachable) and a timeout. On a
 * timeout the library answers success: true, so success alone cannot tell an
 * allowed request from one that was never checked. Each caller then decides
 * whether an unchecked request may go ahead.
 */
export async function checkLimit(
  limiter: Limiter,
  key: string,
): Promise<LimitResult> {
  try {
    const { success, reason } = await limiter.limit(key);

    if (reason === "timeout") {
      console.error("Rate limiter unavailable: the request timed out");
      return "unavailable";
    }

    return success ? "allowed" : "limited";
  } catch (error) {
    console.error("Rate limiter unavailable", error);
    return "unavailable";
  }
}
