import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "node:crypto";
import { processAndSanitizeImage, ImageProcessingError } from "@/lib/image-processing";
import { generateUploadToken, verifyUploadToken } from "@/lib/upload-token";
import { resetRateLimitStore } from "@/lib/rate-limit";
import { verifyDummyPassword } from "@/lib/password";
import { storeValidatedImage } from "@/lib/storage";
import sharp from "sharp";

const {
  mockRescueFindUnique,
  mockDonationFindUnique,
  mockDonationUpdate,
  mockDonationUpdateMany,
  mockSponsorshipFindUnique,
  mockSponsorshipUpdate,
  mockSponsorshipUpdateMany,
  mockAuditLogCreate,
  mockUserFindUnique,
  mockAdminSessionCreate,
  mockAdminSessionFindUnique,
  mockUserUpdate,
  mockCookieGet,
  mockBlobPut,
  mockBlobGet,
} = vi.hoisted(() => ({
  mockRescueFindUnique: vi.fn(),
  mockDonationFindUnique: vi.fn(),
  mockDonationUpdate: vi.fn(),
  mockDonationUpdateMany: vi.fn(),
  mockSponsorshipFindUnique: vi.fn(),
  mockSponsorshipUpdate: vi.fn(),
  mockSponsorshipUpdateMany: vi.fn(),
  mockAuditLogCreate: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockAdminSessionCreate: vi.fn(),
  mockAdminSessionFindUnique: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockCookieGet: vi.fn(),
  mockBlobPut: vi.fn(),
  mockBlobGet: vi.fn(),
}));

vi.mock("@vercel/blob", () => ({
  put: mockBlobPut,
  get: mockBlobGet,
}));

vi.mock("@/lib/prisma", () => {
  const client = {
    rescueCase: { findUnique: mockRescueFindUnique },
    donation: {
      findUnique: mockDonationFindUnique,
      update: mockDonationUpdate,
      updateMany: mockDonationUpdateMany,
    },
    sponsorship: {
      findUnique: mockSponsorshipFindUnique,
      update: mockSponsorshipUpdate,
      updateMany: mockSponsorshipUpdateMany,
    },
    auditLog: { create: mockAuditLogCreate },
    user: { findUnique: mockUserFindUnique, update: mockUserUpdate },
    adminSession: {
      findUnique: mockAdminSessionFindUnique,
      create: mockAdminSessionCreate,
    },
    $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback(client)),
  };
  return { default: client, prisma: client };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
  })),
}));

import { GET as rescueDetailGet } from "@/app/api/rescue/[id]/route";
import { POST as rescueUploadPost } from "@/app/api/rescue/upload/route";
import { GET as adminRescuePhotoGet } from "@/app/api/admin/rescues/photo/[filename]/route";
import { POST as loginPost } from "@/app/api/login/route";
import { POST as webhookPost } from "@/app/api/webhooks/razorpay/route";
import { createSessionToken } from "@/lib/session-token";

const TEST_SECRET = "a_very_secure_test_session_secret_with_at_least_32_characters_12345";
const WEBHOOK_SECRET = "whsec_test_secret_for_hardening_tests_12345";

async function authenticateAs(role: "ADMIN" | "COORDINATOR" | "SUPER_ADMIN" = "ADMIN") {
  const token = await createSessionToken(
    {
      id: "admin_user_1",
      email: "admin@ayudar.org",
      name: "Admin User",
      role,
    },
    "jti_admin_1"
  );
  mockCookieGet.mockReturnValue({ value: token });
  mockAdminSessionFindUnique.mockResolvedValue({
    jti: "jti_admin_1",
    revokedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    user: {
      id: "admin_user_1",
      email: "admin@ayudar.org",
      name: "Admin User",
      role,
      isActive: true,
    },
  });
  return token;
}

describe("AYUDAR — Final Security Hardening Regression Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    vi.stubEnv("SESSION_SECRET", TEST_SECRET);
    vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", WEBHOOK_SECRET);
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
  });

  describe("Fix 1 — Private Rescue Storage & Admin Access Control", () => {
    it("rejects unauthenticated requests to the admin rescue photo endpoint", async () => {
      mockCookieGet.mockReturnValue(undefined);
      const res = await adminRescuePhotoGet(
        new Request("http://localhost:3000/api/admin/rescues/photo/rescue-123.webp"),
        { params: Promise.resolve({ filename: "rescue-123.webp" }) }
      );
      expect(res.status).toBe(401);
    });

    it("rejects directory traversal attacks on the photo filename", async () => {
      await authenticateAs("ADMIN");
      const res = await adminRescuePhotoGet(
        new Request("http://localhost:3000/api/admin/rescues/photo/..%2F..%2Fetc%2Fpasswd"),
        { params: Promise.resolve({ filename: "../../etc/passwd" }) }
      );
      expect(res.status).toBe(400);
    });

    it("rejects invalid extensions on the photo endpoint", async () => {
      await authenticateAs("ADMIN");
      const res = await adminRescuePhotoGet(
        new Request("http://localhost:3000/api/admin/rescues/photo/malware.exe"),
        { params: Promise.resolve({ filename: "malware.exe" }) }
      );
      expect(res.status).toBe(400);
    });

    it("uploads sensitive rescue incident photos with access: 'private' using @vercel/blob when token is present", async () => {
      vi.stubEnv("BLOB_READ_WRITE_TOKEN", "mock_vercel_blob_rw_token_123");
      mockBlobPut.mockResolvedValueOnce({
        url: "https://mock.blob.vercel-storage.com/ayudar/private/rescues/rescue-abc.webp",
      });

      const buffer = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00]);
      const res = await storeValidatedImage(
        buffer,
        { mimeType: "image/webp", extension: "webp" },
        "incident.jpg",
        "rescue"
      );

      expect(res.storage).toBe("vercel-blob");
      expect(res.isPrivate).toBe(true);
      expect(mockBlobPut).toHaveBeenCalledWith(
        expect.stringMatching(/^ayudar\/private\/rescues\/rescue-/),
        buffer,
        expect.objectContaining({
          access: "private",
          contentType: "image/webp",
          token: "mock_vercel_blob_rw_token_123",
        })
      );
    });

    it("fails safely in production runtime if persistent private storage is unavailable without leaking or fallback to public", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
      vi.stubEnv("PRIVATE_STORAGE_BUCKET", "");

      const buffer = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00]);
      await expect(
        storeValidatedImage(
          buffer,
          { mimeType: "image/webp", extension: "webp" },
          "incident.jpg",
          "rescue"
        )
      ).rejects.toThrow(/Persistent private object storage/i);
    });

    it("retrieves private rescue incident photo from Vercel Blob with access: 'private' for authenticated admins", async () => {
      await authenticateAs("ADMIN");
      vi.stubEnv("BLOB_READ_WRITE_TOKEN", "mock_vercel_blob_rw_token_123");

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([0x52, 0x49, 0x46, 0x46]));
          controller.close();
        },
      });

      mockBlobGet.mockResolvedValueOnce({
        statusCode: 200,
        stream,
        blob: {
          contentType: "image/webp",
        },
      });

      const res = await adminRescuePhotoGet(
        new Request("http://localhost:3000/api/admin/rescues/photo/rescue-test-blob-123.webp"),
        { params: Promise.resolve({ filename: "rescue-test-blob-123.webp" }) }
      );

      expect(res.status).toBe(200);
      expect(mockBlobGet).toHaveBeenCalledWith(
        "ayudar/private/rescues/rescue-test-blob-123.webp",
        expect.objectContaining({
          access: "private",
          token: "mock_vercel_blob_rw_token_123",
        })
      );
      expect(res.headers.get("Content-Type")).toBe("image/webp");
      expect(res.headers.get("Cache-Control")).toContain("private");
    });
  });

  describe("Fix 2 — Sharp Image Processing, Metadata Stripping & Polyglot Rejection", () => {
    it("strips EXIF metadata including camera make and GPS from valid JPEG images", async () => {
      // Create a test image with EXIF metadata
      const imageWithExif = await sharp({
        create: { width: 64, height: 64, channels: 3, background: { r: 255, g: 100, b: 50 } },
      })
        .withMetadata({
          exif: {
            IFD0: {
              Make: "SecretCameraBrand",
              Model: "SensitiveModel123",
            },
          },
        })
        .jpeg()
        .toBuffer();

      const inputMetadata = await sharp(imageWithExif).metadata();
      expect(inputMetadata.exif).toBeDefined();

      const sanitized = await processAndSanitizeImage(imageWithExif, "incident.jpg", "image/jpeg");
      expect(sanitized.mimeType).toBe("image/webp");
      expect(sanitized.width).toBe(64);
      expect(sanitized.height).toBe(64);

      // Verify that all EXIF metadata has been completely stripped
      const outputMetadata = await sharp(sanitized.buffer).metadata();
      expect(outputMetadata.exif).toBeUndefined();
    });

    it("rejects polyglot files containing SVG, XML, or script headers", async () => {
      const polyglotBuffer = Buffer.from(
        "GIF89a\x01\x00\x01\x00<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>",
        "utf8"
      );

      await expect(
        processAndSanitizeImage(polyglotBuffer, "exploit.gif", "image/gif")
      ).rejects.toThrow(/Malicious or unsupported file content detected/i);
    });

    it("rejects truncated or corrupt image buffers", async () => {
      const truncatedBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      await expect(
        processAndSanitizeImage(truncatedBuffer, "truncated.jpg", "image/jpeg")
      ).rejects.toThrow(ImageProcessingError);
    });

    it("rejects images with dimensions exceeding 4096px", async () => {
      // Sharp mock / test buffer with 5000px dimension
      const hugeImageBuffer = await sharp({
        create: { width: 4500, height: 100, channels: 3, background: { r: 0, g: 0, b: 0 } },
      })
        .jpeg()
        .toBuffer();

      await expect(
        processAndSanitizeImage(hugeImageBuffer, "huge.jpg", "image/jpeg", { maxDimension: 4096 })
      ).rejects.toThrow(/exceed maximum allowed limit/i);
    });
  });

  describe("Fix 3 & 10 — Admin Login Lockout Protection & Timing Parity", () => {
    it("throttles targeted IP+email combinations after 5 attempts while allowing other IPs to log in", async () => {
      mockUserFindUnique.mockResolvedValue(null);

      // IP1 attacks admin@ayudar.org 5 times
      for (let i = 0; i < 5; i++) {
        const res = await loginPost(
          new Request("http://localhost:3000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-forwarded-for": "198.51.100.1" },
            body: JSON.stringify({ email: "target-admin@ayudar.org", password: "wrong-password" }),
          })
        );
        expect(res.status).toBe(401);
      }

      // 6th attempt from IP1 is throttled
      const throttledRes = await loginPost(
        new Request("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-forwarded-for": "198.51.100.1" },
          body: JSON.stringify({ email: "target-admin@ayudar.org", password: "wrong-password" }),
        })
      );
      expect(throttledRes.status).toBe(429);
      expect((await throttledRes.json()).error).toMatch(/Too many failed attempts for this account/i);

      // Legitimate admin from IP2 is NOT locked out by IP1's failed attempts
      const legitRes = await loginPost(
        new Request("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.50" },
          body: JSON.stringify({ email: "target-admin@ayudar.org", password: "wrong-password" }),
        })
      );
      // Returns 401 (credentials check), not 429 (locked out)
      expect(legitRes.status).toBe(401);
    });

    it("executes dummy scrypt verification for nonexistent accounts to ensure timing parity", async () => {
      const dummyRes = await verifyDummyPassword("arbitrary-password-attempt");
      expect(dummyRes).toBe(false);
    });
  });

  describe("Fix 4 — Rescue Upload Abuse Prevention & Signed Tokens", () => {
    it("rejects unauthenticated photo uploads missing an upload token", async () => {
      const validPng = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );
      const form = new FormData();
      form.append("file", new File([validPng], "incident.png", { type: "image/png" }));

      const res = await rescueUploadPost(
        new Request("http://localhost:3000/api/rescue/upload", {
          method: "POST",
          headers: { "x-forwarded-for": "127.0.0.1" },
          body: form,
        })
      );
      expect(res.status).toBe(403);
      expect((await res.json()).error).toMatch(/Missing required upload token/i);
    });

    it("rejects upload token replay attacks (token cannot be used twice)", async () => {
      const validPng = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );
      const token = generateUploadToken("127.0.0.1");

      const form1 = new FormData();
      form1.append("file", new File([validPng], "incident.png", { type: "image/png" }));
      form1.append("uploadToken", token);

      // First upload succeeds
      const res1 = await rescueUploadPost(
        new Request("http://localhost:3000/api/rescue/upload", {
          method: "POST",
          headers: { "x-forwarded-for": "127.0.0.1" },
          body: form1,
        })
      );
      expect(res1.status).toBe(200);

      // Second upload with same token is rejected
      const form2 = new FormData();
      form2.append("file", new File([validPng], "incident.png", { type: "image/png" }));
      form2.append("uploadToken", token);

      const res2 = await rescueUploadPost(
        new Request("http://localhost:3000/api/rescue/upload", {
          method: "POST",
          headers: { "x-forwarded-for": "127.0.0.1" },
          body: form2,
        })
      );
      expect(res2.status).toBe(403);
      expect((await res2.json()).error).toMatch(/already been used/i);
    });

    it("rejects upload tokens issued to a different IP network", async () => {
      const tokenForDifferentIp = generateUploadToken("192.0.2.1");
      const validation = verifyUploadToken(tokenForDifferentIp, "203.0.113.99");
      expect(validation.valid).toBe(false);
      if (!validation.valid) {
        expect(validation.error).toMatch(/different client network/i);
      }
    });
  });

  describe("Fix 5 — Redact GPS Coordinates from Public Tracking Responses", () => {
    it("redacts exact GPS coordinates from public GET /api/rescue/[id]", async () => {
      mockRescueFindUnique.mockResolvedValue({
        id: "RES-GPS-001",
        animalType: "Cow",
        emergencyLevel: "High",
        location: "Opposite Sector 18 Market, Noida (GPS: 28.57021, 77.32189)",
        assignedTeam: "Gaushala Unit 2",
        status: "Assigned",
        reportedAt: new Date(),
        history: [],
      });

      const res = await rescueDetailGet(
        new Request("http://localhost:3000/api/rescue/RES-GPS-001"),
        { params: Promise.resolve({ id: "RES-GPS-001" }) }
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.location).not.toContain("28.57021");
      expect(data.location).not.toContain("77.32189");
      expect(data.location).toContain("Location logged with dispatch");
    });
  });

  describe("Fix 8 — Refund & Dispute Webhook Idempotency", () => {
    it("handles refund.processed with full refund by marking paymentStatus as Refunded", async () => {
      mockDonationFindUnique.mockResolvedValue({
        id: "don_refund_full_1",
        amount: 5000,
        paymentStatus: "Completed",
        razorpayOrderId: "order_refund_full_1",
        razorpayPaymentId: "pay_refund_full_1",
      });

      const payload = JSON.stringify({
        event: "refund.processed",
        payload: {
          refund: {
            entity: {
              id: "rfnd_full_1",
              payment_id: "pay_refund_full_1",
              amount: 500000,
              currency: "INR",
              status: "processed",
            },
          },
          payment: {
            entity: {
              id: "pay_refund_full_1",
              order_id: "order_refund_full_1",
              amount: 500000,
              amount_refunded: 500000,
              refund_status: "full",
            },
          },
        },
      });

      const signature = createHmac("sha256", WEBHOOK_SECRET).update(payload, "utf8").digest("hex");

      const res = await webhookPost(
        new Request("http://localhost:3000/api/webhooks/razorpay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-razorpay-signature": signature,
          },
          body: payload,
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("Refunded");
      expect(mockDonationUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "don_refund_full_1" },
          data: { paymentStatus: "Refunded" },
        })
      );
      expect(mockAuditLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "RAZORPAY_REFUND_PROCESSED_FULL",
            resource: "donation:don_refund_full_1",
          }),
        })
      );
    });

    it("handles refund.processed with partial refund by marking paymentStatus as Partially Refunded and never fully Refunded", async () => {
      mockDonationFindUnique.mockResolvedValue({
        id: "don_refund_part_1",
        amount: 5000,
        paymentStatus: "Completed",
        razorpayOrderId: "order_refund_part_1",
        razorpayPaymentId: "pay_refund_part_1",
      });

      const payload = JSON.stringify({
        event: "refund.processed",
        payload: {
          refund: {
            entity: {
              id: "rfnd_part_1",
              payment_id: "pay_refund_part_1",
              amount: 200000,
              currency: "INR",
              status: "processed",
            },
          },
          payment: {
            entity: {
              id: "pay_refund_part_1",
              order_id: "order_refund_part_1",
              amount: 500000,
              amount_refunded: 200000,
              refund_status: "partial",
            },
          },
        },
      });

      const signature = createHmac("sha256", WEBHOOK_SECRET).update(payload, "utf8").digest("hex");

      const res = await webhookPost(
        new Request("http://localhost:3000/api/webhooks/razorpay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-razorpay-signature": signature,
          },
          body: payload,
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("Partially Refunded");
      expect(mockDonationUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "don_refund_part_1" },
          data: { paymentStatus: "Partially Refunded" },
        })
      );
      expect(mockAuditLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "RAZORPAY_REFUND_PROCESSED_PARTIAL",
            resource: "donation:don_refund_part_1",
          }),
        })
      );
    });

    it("handles refund.failed without marking donation as refunded and logs audit record", async () => {
      const payload = JSON.stringify({
        event: "refund.failed",
        payload: {
          refund: {
            entity: {
              id: "rfnd_failed_99",
              payment_id: "pay_failed_99",
              amount: 100000,
              status: "failed",
            },
          },
        },
      });

      const signature = createHmac("sha256", WEBHOOK_SECRET).update(payload, "utf8").digest("hex");

      const res = await webhookPost(
        new Request("http://localhost:3000/api/webhooks/razorpay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-razorpay-signature": signature,
          },
          body: payload,
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("refund_failed_logged");
      expect(mockDonationUpdate).not.toHaveBeenCalled();
      expect(mockAuditLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "RAZORPAY_REFUND_FAILED",
            resource: "refund:rfnd_failed_99",
          }),
        })
      );
    });

    it("ensures duplicate refund webhook deliveries are strictly idempotent", async () => {
      mockDonationFindUnique.mockResolvedValue({
        id: "don_refund_dupe",
        amount: 5000,
        paymentStatus: "Refunded", // Already refunded!
        razorpayOrderId: "order_refund_dupe",
        razorpayPaymentId: "pay_refund_dupe",
      });

      const payload = JSON.stringify({
        event: "refund.processed",
        payload: {
          refund: {
            entity: {
              id: "rfnd_dupe_1",
              payment_id: "pay_refund_dupe",
              amount: 500000,
              status: "processed",
            },
          },
          payment: {
            entity: {
              id: "pay_refund_dupe",
              amount: 500000,
              amount_refunded: 500000,
              refund_status: "full",
            },
          },
        },
      });

      const signature = createHmac("sha256", WEBHOOK_SECRET).update(payload, "utf8").digest("hex");

      const res = await webhookPost(
        new Request("http://localhost:3000/api/webhooks/razorpay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-razorpay-signature": signature,
          },
          body: payload,
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("Refunded");
      expect(data.alreadyProcessed).toBe(true);
      expect(mockDonationUpdate).not.toHaveBeenCalled();
    });

    it("handles payment.dispute.created by setting status to Disputed without marking as Refunded", async () => {
      mockDonationFindUnique.mockResolvedValue({
        id: "don_dispute_1",
        amount: 3000,
        paymentStatus: "Completed",
        razorpayPaymentId: "pay_disputed_999",
      });

      const payload = JSON.stringify({
        event: "payment.dispute.created",
        payload: {
          dispute: {
            entity: {
              id: "disp_123",
              payment_id: "pay_disputed_999",
              amount: 300000,
              status: "under_review",
            },
          },
        },
      });

      const signature = createHmac("sha256", WEBHOOK_SECRET).update(payload, "utf8").digest("hex");

      const res = await webhookPost(
        new Request("http://localhost:3000/api/webhooks/razorpay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-razorpay-signature": signature,
          },
          body: payload,
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("dispute_handled");
      // Set to Disputed, NOT Refunded!
      expect(mockDonationUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "don_dispute_1" },
          data: { paymentStatus: "Disputed" },
        })
      );
      expect(mockAuditLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "RAZORPAY_DISPUTE_CREATED",
            resource: "payment:pay_disputed_999",
          }),
        })
      );
    });

    it("handles payment.dispute.won by restoring status to Completed", async () => {
      const payload = JSON.stringify({
        event: "payment.dispute.won",
        payload: {
          dispute: {
            entity: {
              id: "disp_won_1",
              payment_id: "pay_disputed_won",
              amount: 300000,
              status: "won",
            },
          },
        },
      });

      const signature = createHmac("sha256", WEBHOOK_SECRET).update(payload, "utf8").digest("hex");

      const res = await webhookPost(
        new Request("http://localhost:3000/api/webhooks/razorpay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-razorpay-signature": signature,
          },
          body: payload,
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("dispute_handled");
      expect(mockDonationUpdateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { razorpayPaymentId: "pay_disputed_won", paymentStatus: "Disputed" },
          data: { paymentStatus: "Completed" },
        })
      );
      expect(mockAuditLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "RAZORPAY_DISPUTE_WON",
            resource: "payment:pay_disputed_won",
          }),
        })
      );
    });
  });
});
