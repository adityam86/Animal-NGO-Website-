interface RateEntry {
  timestamps: number[];
}

const globalForRateLimit = globalThis as unknown as {
  __ayudarRateStore?: Map<string, RateEntry>;
  __ayudarRateWarned?: boolean;
};

const store = globalForRateLimit.__ayudarRateStore ?? new Map<string, RateEntry>();
if (!globalForRateLimit.__ayudarRateStore) {
  globalForRateLimit.__ayudarRateStore = store;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  backend?: "upstash-redis" | "memory-fallback";
}

/**
 * In-memory per-process sliding window limiter.
 * Intended only for local dev/tests and per-instance fallback when Redis is unconfigured.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const entry = store.get(key) ?? { timestamps: [] };
  const recent = entry.timestamps.filter((t) => t > windowStart);

  if (recent.length >= maxRequests) {
    const oldest = recent[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    store.set(key, { timestamps: recent });
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      backend: "memory-fallback",
    };
  }

  recent.push(now);
  store.set(key, { timestamps: recent });

  if (store.size > 5000) {
    for (const [k, v] of store.entries()) {
      if (v.timestamps.every((t) => t <= windowStart)) {
        store.delete(k);
      }
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - recent.length),
    retryAfterSeconds: 0,
    backend: "memory-fallback",
  };
}

/**
 * Distributed Upstash Redis REST sliding/fixed window rate limiter for serverless deployments.
 * Falls back cleanly to per-instance in-memory limiting when UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN are not configured.
 */
export async function checkDistributedRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (redisUrl && redisToken) {
    try {
      const bucketKey = `ayudar:rl:${key}`;
      const base = redisUrl.replace(/\/+$/, "");

      const res = await fetch(`${base}/pipeline`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${redisToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", bucketKey],
          ["PTTL", bucketKey],
        ]),
        signal: AbortSignal.timeout(2500),
      });

      if (res.ok) {
        const data = (await res.json()) as Array<{ result?: number }>;
        const count = Number(data?.[0]?.result ?? 1);
        let ttlMs = Number(data?.[1]?.result ?? -1);

        if (ttlMs < 0) {
          await fetch(`${base}/pexpire/${encodeURIComponent(bucketKey)}/${windowMs}`, {
            method: "POST",
            headers: { authorization: `Bearer ${redisToken}` },
            signal: AbortSignal.timeout(1500),
          });
          ttlMs = windowMs;
        }

        if (count > maxRequests) {
          return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: Math.max(1, Math.ceil(ttlMs / 1000)),
            backend: "upstash-redis",
          };
        }

        return {
          allowed: true,
          remaining: Math.max(0, maxRequests - count),
          retryAfterSeconds: 0,
          backend: "upstash-redis",
        };
      }
    } catch (err) {
      console.warn("Distributed rate limiter error; falling back to memory store:", err);
    }
  } else if (process.env.NODE_ENV === "production" && !globalForRateLimit.__ayudarRateWarned) {
    globalForRateLimit.__ayudarRateWarned = true;
    console.warn(
      "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not configured; rate limiting is per-instance only."
    );
  }

  return checkRateLimit(key, maxRequests, windowMs);
}

export function resetRateLimitStore() {
  store.clear();
  globalForRateLimit.__ayudarRateWarned = false;
}
