import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Per-user rate limiter: 10 requests per 60 seconds, sliding window.
 * Redis.fromEnv() reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
 * The sliding window smooths the burst-at-boundary problem of fixed windows.
 */
const globalForRateLimit = globalThis as unknown as {
  ratelimit?: Ratelimit;
  totpRatelimit?: Ratelimit;
};

export const ratelimit =
  globalForRateLimit.ratelimit ??
  new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(4, "60 s"),
    analytics: true,
    prefix: "docqa/ratelimit",
  });

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.ratelimit = ratelimit;
}

/**
 * Stricter limiter for second factor code entry: 5 attempts per 5 minutes.
 *
 * A 6 digit code is only a million possibilities, so an attacker who already
 * holds a session could otherwise grind through them. Its own instance and
 * prefix keep that budget separate from ordinary request limiting, so normal
 * app use cannot exhaust the allowance that protects the code.
 */
export const totpRatelimit =
  globalForRateLimit.totpRatelimit ??
  new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "300 s"),
    analytics: true,
    prefix: "docqa/ratelimit/totp",
  });

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.totpRatelimit = totpRatelimit;
}
