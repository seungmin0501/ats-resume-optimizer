import { NextRequest } from "next/server";

type RateLimitResult = { success: boolean; remaining: number };

// Upstash가 설정된 경우에만 실제 rate limit 적용
// 미설정 시 항상 통과 (개발 환경 등)
async function getRateLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 분당 10회
    analytics: false,
  });
}

export async function checkRateLimit(
  req: NextRequest,
  identifier?: string
): Promise<RateLimitResult> {
  const limiter = await getRateLimiter();
  if (!limiter) return { success: true, remaining: 999 };

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  const key = identifier ?? ip;
  const result = await limiter.limit(key);

  return {
    success: result.success,
    remaining: result.remaining,
  };
}
