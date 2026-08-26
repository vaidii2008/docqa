import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Per-user rate limiter: 10 requests per 60 seconds, sliding window.
 * Redis.fromEnv() reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
 * The sliding window smooths the burst-at-boundary problem of fixed windows.
 */
const globalForRateLimit = globalThis as unknown as {
  ratelimit?: Ratelimit;
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
