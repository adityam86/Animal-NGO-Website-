import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockBlobPut, mockS3Send, mockMkdir, mockWriteFile } = vi.hoisted(() => ({
  mockBlobPut: vi.fn(),
  mockS3Send: vi.fn(),
  mockMkdir: vi.fn(async () => undefined),
  mockWriteFile: vi.fn(async () => undefined),
}));

vi.mock("@vercel/blob", () => ({
  put: mockBlobPut,
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = mockS3Send;
  },
  PutObjectCommand: class {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  },
  GetObjectCommand: class {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  },
}));

vi.mock("node:fs/promises", () => ({
  mkdir: mockMkdir,
  writeFile: mockWriteFile,
}));

import { storeValidatedImage } from "@/lib/storage";
import { isSafeImageUrl, shouldBypassImageOptimization } from "@/lib/image-url";
import { checkDistributedRateLimit, resetRateLimitStore } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";

describe("Vercel Blob & Neon S3 Storage, Image URL Validation & Distributed Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    vi.stubEnv("AWS_ACCESS_KEY_ID", "");
    vi.stubEnv("AWS_SECRET_ACCESS_KEY", "");
    vi.stubEnv("AWS_ENDPOINT_URL_S3", "");
    vi.stubEnv("PRIVATE_STORAGE_BUCKET", "");
    vi.stubEnv("PRIVATE_STORAGE_ACCESS_KEY", "");
    vi.stubEnv("PRIVATE_STORAGE_SECRET_KEY", "");
    vi.stubEnv("PRIVATE_STORAGE_ENDPOINT", "");
    vi.stubEnv("PUBLIC_STORAGE_BUCKET", "");
  });

  it("uploads via official @vercel/blob SDK when BLOB_READ_WRITE_TOKEN is set and propagates safe errors", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_secret_token_test");
    mockBlobPut.mockResolvedValueOnce({
      url: "https://store123.public.blob.vercel-storage.com/ayudar/photo-xyz.png",
    });

    const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x01, 0x02, 0x03, 0x04]);
    const res = await storeValidatedImage(
      pngBuf,
      { mimeType: "image/png", extension: "png" },
      "dog.png",
      "animal"
    );

    expect(res.storage).toBe("vercel-blob");
    expect(res.url).toContain(".public.blob.vercel-storage.com");
    expect(mockBlobPut).toHaveBeenCalledWith(
      expect.stringMatching(/^ayudar\/animal-/),
      pngBuf,
      expect.objectContaining({
        access: "public",
        contentType: "image/png",
        addRandomSuffix: true,
        token: "vercel_blob_rw_secret_token_test",
      })
    );

    mockBlobPut.mockRejectedValueOnce(new Error("Upstream blob service failure"));
    await expect(
      storeValidatedImage(pngBuf, { mimeType: "image/png", extension: "png" }, "dog.png", "animal")
    ).rejects.toThrow("Upstream blob service failure");
  });

  it("falls back to bounded raster data URI on Vercel without BLOB_READ_WRITE_TOKEN and rejects >2MB", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    vi.stubEnv("VERCEL", "1");

    const smallPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    const smallRes = await storeValidatedImage(
      smallPng,
      { mimeType: "image/png", extension: "png" },
      "small.png",
      "rescue"
    );
    expect(smallRes.storage).toBe("inline-data-url");
    expect(smallRes.url.startsWith("data:image/png;base64,")).toBe(true);
    expect(shouldBypassImageOptimization(smallRes.url)).toBe(true);

    const tooLargeBuf = Buffer.alloc(2 * 1024 * 1024 + 10, 0xff);
    await expect(
      storeValidatedImage(tooLargeBuf, { mimeType: "image/jpeg", extension: "jpg" }, "big.jpg", "rescue")
    ).rejects.toThrow(/BLOB_READ_WRITE_TOKEN/i);
  });

  it("enforces strict safe image URL allowlist without opening untrusted hosts or SVGs", () => {
    expect(isSafeImageUrl("/images/dog_bruno.jpg")).toBe(true);
    expect(isSafeImageUrl("/uploads/rescue-123.png")).toBe(true);
    expect(isSafeImageUrl("https://my-store.public.blob.vercel-storage.com/ayudar/cat.webp")).toBe(true);
    expect(
      isSafeImageUrl(
        "https://br-purple-night-bdewoyit.storage.c-8.us-east-2.aws.neon.tech/assets/public/dog.webp"
      )
    ).toBe(true);
    expect(isSafeImageUrl("data:image/jpeg;base64,/9j/4AAQ")).toBe(true);

    expect(
      isSafeImageUrl(
        "https://br-purple-night-bdewoyit.storage.c-8.us-east-2.aws.neon.tech/rescues/secret.webp"
      )
    ).toBe(false);
    expect(
      isSafeImageUrl(
        "https://br-purple-night-bdewoyit.storage.c-8.us-east-2.aws.neon.tech/assets/bad.svg"
      )
    ).toBe(false);
    expect(isSafeImageUrl("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
    expect(isSafeImageUrl("/images/malicious.svg")).toBe(false);
    expect(isSafeImageUrl("/images/../.env")).toBe(false);
    expect(isSafeImageUrl("https://evil.attacker.example/tracker.png")).toBe(false);
    expect(isSafeImageUrl("javascript:alert(1)")).toBe(false);
  });

  it("uploads public and private images via Neon Object Storage S3 when AWS_* credentials are configured", async () => {
    vi.stubEnv("AWS_ENDPOINT_URL_S3", "https://br-test.storage.c-8.us-east-2.aws.neon.tech");
    vi.stubEnv("AWS_ACCESS_KEY_ID", "nak_test_123");
    vi.stubEnv("AWS_SECRET_ACCESS_KEY", "nsk_test_secret");
    vi.stubEnv("AWS_REGION", "us-east-2");
    mockS3Send.mockResolvedValue({});

    const buf = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00]);

    const pubRes = await storeValidatedImage(
      buf,
      { mimeType: "image/webp", extension: "webp" },
      "dog.jpg",
      "animal"
    );
    expect(pubRes.storage).toBe("s3-public");
    expect(pubRes.isPrivate).toBe(false);
    expect(pubRes.url).toMatch(
      /^https:\/\/br-test\.storage\.c-8\.us-east-2\.aws\.neon\.tech\/assets\/public\/animal-.*\.webp$/
    );
    expect(mockS3Send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: "assets",
          Body: buf,
          ContentType: "image/webp",
        }),
      })
    );

    const privRes = await storeValidatedImage(
      buf,
      { mimeType: "image/webp", extension: "webp" },
      "injured.jpg",
      "rescue"
    );
    expect(privRes.storage).toBe("s3-private");
    expect(privRes.isPrivate).toBe(true);
    expect(privRes.url).toMatch(/^\/api\/admin\/rescues\/photo\/rescue-.*\.webp$/);
    expect(mockS3Send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: "rescues",
          Body: buf,
          ContentType: "image/webp",
          CacheControl: "private, no-store",
        }),
      })
    );
  });

  it("supports distributed Upstash Redis REST limiting and safely falls back to memory when unconfigured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    const mem1 = await checkDistributedRateLimit("test-mem", 1, 60_000);
    expect(mem1.allowed).toBe(true);
    expect(mem1.backend).toBe("memory-fallback");

    const mem2 = await checkDistributedRateLimit("test-mem", 1, 60_000);
    expect(mem2.allowed).toBe(false);

    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://us1-test.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "upstash_test_token");

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [{ result: 3 }, { result: 1 }, { result: 25000 }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const redisRes = await checkDistributedRateLimit("login-ip:1.2.3.4", 2, 60_000);
    expect(redisRes.allowed).toBe(false);
    expect(redisRes.backend).toBe("upstash-redis");
    expect(redisRes.retryAfterSeconds).toBe(25);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://us1-test.upstash.io/pipeline",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("documents and enforces Redis outage behavior: fails closed for sensitive routes in prod and fails open for non-sensitive", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://us1-test.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "upstash_test_token");

    // Outage: Upstash returns network error
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network connection refused to Upstash"))
    );

    // 1. Sensitive route (login) fails closed in production — no silent fallback to per-instance memory!
    const sensitiveRes = await checkDistributedRateLimit("login-ip:1.1.1.1", 5, 60_000, {
      sensitive: true,
    });
    expect(sensitiveRes.allowed).toBe(false);
    expect(sensitiveRes.backend).toBe("outage-blocked");

    // 2. Non-sensitive route (e.g. general tracking) fails open to per-instance memory to preserve availability
    const nonSensitiveRes = await checkDistributedRateLimit("search:1.1.1.1", 5, 60_000);
    expect(nonSensitiveRes.allowed).toBe(true);
    expect(nonSensitiveRes.backend).toBe("memory-fallback");

    // 3. Unconfigured Redis in production for sensitive route also fails closed
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const unconfSensitive = await checkDistributedRateLimit("login-ip:2.2.2.2", 5, 60_000, {
      sensitive: true,
    });
    expect(unconfSensitive.allowed).toBe(false);
    expect(unconfSensitive.backend).toBe("unconfigured-blocked");
  });

  it("prevents permanent keys by deleting key when PEXPIRE fails", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://us1-test.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "upstash_test_token");

    const fetchMock = vi
      .fn()
      // 1. Pipeline returns count: 1 and ttl: -1 (key created without expiry)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ result: 1 }, { result: 0 }, { result: -1 }],
      })
      // 2. Fallback PEXPIRE fails (e.g. 500 error)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      // 3. Emergency DEL succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: 1 }),
      });

    vi.stubGlobal("fetch", fetchMock);

    await checkDistributedRateLimit("temp-key", 5, 60_000);

    // Verify DEL was triggered for this bucket to prevent it from persisting permanently
    expect(fetchMock).toHaveBeenCalledWith(
      "https://us1-test.upstash.io/del/ayudar%3Arl%3Atemp-key",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("handles concurrent requests and synchronizes rate limiting across simulated serverless instances", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://us1-test.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "upstash_test_token");

    // Shared stateful mock simulating central Redis server
    let redisCounter = 0;
    const fetchMock = vi.fn().mockImplementation(async () => {
      redisCounter++;
      return {
        ok: true,
        json: async () => [{ result: redisCounter }, { result: 1 }, { result: 55000 }],
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    // Simulated Instance 1 makes call 1
    const inst1_call1 = await checkDistributedRateLimit("shared-ip:8.8.8.8", 2, 60_000);
    expect(inst1_call1.allowed).toBe(true);
    expect(inst1_call1.remaining).toBe(1);

    // Simulated Instance 2 makes call 1 (shares central Redis counter)
    const inst2_call1 = await checkDistributedRateLimit("shared-ip:8.8.8.8", 2, 60_000);
    expect(inst2_call1.allowed).toBe(true);
    expect(inst2_call1.remaining).toBe(0);

    // Simulated Instance 1 makes call 2 (exceeds limit of 2)
    const inst1_call2 = await checkDistributedRateLimit("shared-ip:8.8.8.8", 2, 60_000);
    expect(inst1_call2.allowed).toBe(false);
    expect(inst1_call2.remaining).toBe(0);
  });

  it("validates trusted proxy IP handling and rejects header spoofing outside Vercel", () => {
    // 1. On Vercel: x-vercel-forwarded-for is trusted
    vi.stubEnv("VERCEL", "1");
    const vercelReq = new Request("https://ayudar.org/api/login", {
      headers: {
        "x-vercel-forwarded-for": "203.0.113.195, 10.0.0.1",
        "cf-connecting-ip": "1.1.1.1",
        "x-forwarded-for": "9.9.9.9",
      },
    });
    expect(getClientIp(vercelReq)).toBe("203.0.113.195");

    // 2. Outside Vercel: x-vercel-forwarded-for is NOT trusted (spoof attempt ignored)
    vi.stubEnv("VERCEL", "");
    const spoofReq = new Request("https://ayudar.org/api/login", {
      headers: {
        "x-vercel-forwarded-for": "203.0.113.195", // attacker spoofing header
        "x-real-ip": "198.51.100.2",               // real reverse proxy IP
      },
    });
    expect(getClientIp(spoofReq)).toBe("198.51.100.2");

    // 3. Malformed non-IP syntax is rejected by regex and falls back to "unknown"
    const malformedReq = new Request("https://ayudar.org/api/login", {
      headers: {
        "x-forwarded-for": "<script>alert(1)</script>",
      },
    });
    expect(getClientIp(malformedReq)).toBe("unknown");
  });
});
