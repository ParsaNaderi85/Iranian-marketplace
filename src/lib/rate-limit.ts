// In-memory, per-instance rate limiter. Good enough to blunt casual abuse
// (spam bots, brute-force scripts) on a single small deployment, but it is
// NOT distributed: each serverless instance keeps its own counters, so a
// determined attacker spread across many cold starts/instances can exceed
// the nominal limit. If traffic grows enough for that gap to matter, swap
// this for a shared store (e.g. Upstash Redis + @upstash/ratelimit).

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Guards against unbounded memory growth on a long-lived instance if it's
// ever hit by a very wide spread of distinct keys.
const MAX_TRACKED_KEYS = 5000;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count++;
  return { allowed: true };
}

export function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function getServerActionIp(): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}
