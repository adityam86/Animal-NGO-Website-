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
  backend?: "upstash-redis" | "memory-fallback" | "outage-blocked" | "unconfigured-blocked";
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

export interface DistributedRateLimitOptions {
  /**
   * When true, in production environments (NODE_ENV === "production") the rate limiter
   * fails closed (blocks request) if Redis is unconfigured or experiences an outage.
   * This prevents sensitive endpoints (such as admin login and public file uploads)
   * from silently falling back to per-instance memory where distributed brute force
   * across ephemeral serverless instances would be possible.
   */
  sensitive?: boolean;
}

/**
 * Distributed Upstash Redis REST rate limiter for serverless deployments.
 *
 * OUTAGE BEHAVIOR:
 * - Sensitive endpoints (sensitive: true in production): Fail closed (returns allowed: false,
 *   backend: "outage-blocked" or "unconfigured-blocked") to guarantee protection against
 *   distributed attacks across serverless instances.
 * - Non-sensitive endpoints (or non-production environments): Fail open to per-instance
 *   memory store (`checkRateLimit`) to maintain availability.
 *
 * EXPIRY HANDLING:
 * - Key initialization uses `["PEXPIRE", bucketKey, windowMs, "NX"]` inside the primary pipeline
 *   batch so keys are atomically given a TTL upon creation without secondary roundtrips.
 * - If PEXPIRE fails or negative TTL is detected, the key is proactively deleted via `DEL`
 *   to ensure it can never become permanent in Redis.
 */
export async function checkDistributedRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
  options?: DistributedRateLimitOptions
): Promise<RateLimitResult> {
  const isProd = process.env.NODE_ENV === "production";
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
          ["PEXPIRE", bucketKey, windowMs, "NX"],
          ["PTTL", bucketKey],
        ]),
        signal: AbortSignal.timeout(2500),
      });

      if (res.ok) {
        const data = (await res.json()) as Array<{ result?: number; error?: string }>;

        // Validate pipeline responses — fail over if any command returned an error
        if (data?.[0]?.error || data?.[1]?.error || data?.[2]?.error) {
          console.warn("Upstash pipeline command error:", data);
        } else {
          const count = Number(data?.[0]?.result);
          // data[2] is PTTL result; if pipeline format is [INCR, PTTL] or [INCR, PEXPIRE, PTTL]
          let ttlMs = Number(data?.[2]?.result ?? data?.[1]?.result);

          // Guard against NaN from non-numeric pipeline results
          if (!Number.isFinite(count) || !Number.isFinite(ttlMs)) {
            console.warn("Upstash pipeline returned non-numeric result:", data);
          } else {
            if (ttlMs < 0) {
              try {
                const expireRes = await fetch(
                  `${base}/pexpire/${encodeURIComponent(bucketKey)}/${windowMs}`,
                  {
                    method: "POST",
                    headers: { authorization: `Bearer ${redisToken}` },
                    signal: AbortSignal.timeout(1500),
                  }
                );
                if (!expireRes.ok) {
                  console.warn(
                    `Upstash PEXPIRE returned HTTP ${expireRes.status}; deleting key to prevent permanent persistence`
                  );
                  // Delete immediately to prevent key from persisting permanently with TTL = -1
                  await fetch(`${base}/del/${encodeURIComponent(bucketKey)}`, {
                    method: "POST",
                    headers: { authorization: `Bearer ${redisToken}` },
                    signal: AbortSignal.timeout(1000),
                  }).catch(() => {});
                }
              } catch (expireErr) {
                console.warn(
                  "Upstash PEXPIRE failed; deleting key to prevent permanent persistence:",
                  expireErr
                );
                await fetch(`${base}/del/${encodeURIComponent(bucketKey)}`, {
                  method: "POST",
                  headers: { authorization: `Bearer ${redisToken}` },
                  signal: AbortSignal.timeout(1000),
                }).catch(() => {});
              }
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
        }
      } else {
        console.warn(`Upstash /pipeline returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn("Distributed rate limiter error:", err);
      if (options?.sensitive && isProd) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: 60,
          backend: "outage-blocked",
        };
      }
    }
  } else if (isProd) {
    if (options?.sensitive) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: 60,
        backend: "unconfigured-blocked",
      };
    }
    if (!globalForRateLimit.__ayudarRateWarned) {
      globalForRateLimit.__ayudarRateWarned = true;
      console.warn(
        "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not configured; rate limiting is per-instance only."
      );
    }
  }

  return checkRateLimit(key, maxRequests, windowMs);
}

export function resetRateLimitStore() {
  store.clear();
  globalForRateLimit.__ayudarRateWarned = false;
}
