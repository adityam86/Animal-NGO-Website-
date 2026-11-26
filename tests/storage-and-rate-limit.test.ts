import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockBlobPut, mockMkdir, mockWriteFile } = vi.hoisted(() => ({
  mockBlobPut: vi.fn(),
  mockMkdir: vi.fn(async () => undefined),
  mockWriteFile: vi.fn(async () => undefined),
}));

vi.mock("@vercel/blob", () => ({
  put: mockBlobPut,
}));

vi.mock("node:fs/promises", () => ({
  mkdir: mockMkdir,
  writeFile: mockWriteFile,
}));

import { storeValidatedImage } from "@/lib/storage";
import { isSafeImageUrl, shouldBypassImageOptimization } from "@/lib/image-url";
import { checkDistributedRateLimit, resetRateLimitStore } from "@/lib/rate-limit";

describe("Vercel Blob Storage, Image URL Validation & Distributed Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
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
    expect(isSafeImageUrl("data:image/jpeg;base64,/9j/4AAQ")).toBe(true);

    expect(isSafeImageUrl("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
    expect(isSafeImageUrl("/images/malicious.svg")).toBe(false);
    expect(isSafeImageUrl("/images/../.env")).toBe(false);
    expect(isSafeImageUrl("https://evil.attacker.example/tracker.png")).toBe(false);
    expect(isSafeImageUrl("javascript:alert(1)")).toBe(false);
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
      json: async () => [{ result: 3 }, { result: 25000 }],
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
});
