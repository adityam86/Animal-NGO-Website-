interface RateEntry {
  timestamps: number[];
}

const globalForRateLimit = globalThis as unknown as {
  __ayudarRateStore?: Map<string, RateEntry>;
};

const store = globalForRateLimit.__ayudarRateStore ?? new Map<string, RateEntry>();
if (!globalForRateLimit.__ayudarRateStore) {
  globalForRateLimit.__ayudarRateStore = store;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

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
    };
  }

  recent.push(now);
  store.set(key, { timestamps: recent });

  // Occasional pruning to avoid unbounded memory growth
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
  };
}

export function resetRateLimitStore() {
  store.clear();
}
