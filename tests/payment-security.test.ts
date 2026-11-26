import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "node:crypto";

const {
  mockDonationFindUnique,
  mockDonationUpdate,
  mockDonationUpdateMany,
  mockSponsorshipFindUnique,
  mockSponsorshipUpdate,
  mockSponsorshipUpdateMany,
  mockAuditCreate,
} = vi.hoisted(() => ({
  mockDonationFindUnique: vi.fn(),
  mockDonationUpdate: vi.fn(),
  mockDonationUpdateMany: vi.fn(),
  mockSponsorshipFindUnique: vi.fn(),
  mockSponsorshipUpdate: vi.fn(),
  mockSponsorshipUpdateMany: vi.fn(),
  mockAuditCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => {
  const client = {
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
    auditLog: {
      create: mockAuditCreate,
    },
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb(client)),
  };
  return { default: client, prisma: client };
});

import { resetRateLimitStore } from "@/lib/rate-limit";
import { POST as createOrderPost } from "@/app/api/create-order/route";
import { POST as verifyPaymentPost } from "@/app/api/verify-payment/route";
import { POST as webhookPost } from "@/app/api/webhooks/razorpay/route";

const TEST_SECRET = "rzp_test_secret_for_signature_checks_987654";
const WEBHOOK_SECRET = "whsec_test_webhook_secret_abcdef";

describe("Razorpay Order, Signature, Webhook & Idempotency Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("RAZORPAY_KEY_SECRET", TEST_SECRET);
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_id");
    vi.stubEnv("NEXT_PUBLIC_RAZORPAY_KEY_ID", "rzp_test_id");
    vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", WEBHOOK_SECRET);
    vi.stubEnv("ENABLE_DEMO_PAYMENTS", "false");
  });

  it("blocks mock payment creation and verification in production environments", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ENABLE_DEMO_PAYMENTS", "true");
    vi.stubEnv("RAZORPAY_KEY_ID", "");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "");
    vi.stubEnv("NEXT_PUBLIC_RAZORPAY_KEY_ID", "");

    mockDonationFindUnique.mockResolvedValue({
      id: "don_1",
      amount: 1500,
      purpose: "Emergency",
      paymentStatus: "Pending",
    });

    const orderRes = await createOrderPost(
      new Request("http://localhost:3000/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordType: "donation", recordId: "don_1" }),
      })
    );
    expect(orderRes.status).toBe(503);

    const mockVerifyRes = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: "order_mock_123456",
          razorpay_payment_id: "pay_mock_123456",
          razorpay_signature: "sig_mock",
          donationId: "don_1",
        }),
      })
    );
    expect(mockVerifyRes.status).toBe(403);
    const body = await mockVerifyRes.json();
    expect(body.verified).toBe(false);
  });

  it("rejects invalid Razorpay HMAC signatures and binds verification to matching DB order ID", async () => {
    mockDonationFindUnique.mockResolvedValue({
      id: "don_2",
      amount: 2500,
      paymentStatus: "Pending",
      razorpayOrderId: "order_real_999",
      razorpayPaymentId: null,
    });

    const badSigRes = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: "order_real_999",
          razorpay_payment_id: "pay_real_111",
          razorpay_signature: "deadbeef00000000000000000000000000000000000000000000000000000000",
          donationId: "don_2",
        }),
      })
    );
    expect(badSigRes.status).toBe(400);
    expect(mockDonationUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { paymentStatus: "Failed" },
      })
    );

    // Valid signature for wrong order ID must be rejected
    const validSigOtherOrder = createHmac("sha256", TEST_SECRET)
      .update("order_cheap_10|pay_real_222")
      .digest("hex");

    const mismatchRes = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: "order_cheap_10",
          razorpay_payment_id: "pay_real_222",
          razorpay_signature: validSigOtherOrder,
          donationId: "don_2",
        }),
      })
    );
    expect(mismatchRes.status).toBe(400);
  });

  it("verifies valid Razorpay signatures and prevents duplicate payment processing", async () => {
    const orderId = "order_valid_555";
    const paymentId = "pay_valid_777";
    const validSig = createHmac("sha256", TEST_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // 1st lookup: target donation
    // 2nd lookup: check paymentId uniqueness
    mockDonationFindUnique
      .mockResolvedValueOnce({
        id: "don_555",
        amount: 1000,
        paymentStatus: "Pending",
        razorpayOrderId: orderId,
        razorpayPaymentId: null,
      })
      .mockResolvedValueOnce(null);
    mockDonationUpdate.mockResolvedValue({});

    const okRes = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSig,
          donationId: "don_555",
        }),
      })
    );
    expect(okRes.status).toBe(200);
    const okJson = await okRes.json();
    expect(okJson.verified).toBe(true);

    // Reusing the same payment ID for a DIFFERENT donation is blocked (409)
    mockDonationFindUnique
      .mockResolvedValueOnce({
        id: "don_other",
        amount: 5000,
        paymentStatus: "Pending",
        razorpayOrderId: orderId,
        razorpayPaymentId: null,
      })
      .mockResolvedValueOnce({
        id: "don_555",
        razorpayPaymentId: paymentId,
      });

    const replayRes = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSig,
          donationId: "don_other",
        }),
      })
    );
    expect(replayRes.status).toBe(409);
  });

  it("verifies Razorpay webhook HMAC signatures and processes payment.captured idempotently", async () => {
    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_wh_1",
            order_id: "order_wh_1",
            amount: 50000,
            currency: "INR",
          },
        },
      },
    });

    const invalidWhRes = await webhookPost(
      new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: { "x-razorpay-signature": "forged_sig" },
        body: payload,
      })
    );
    expect(invalidWhRes.status).toBe(401);

    const validWhSig = createHmac("sha256", WEBHOOK_SECRET).update(payload, "utf8").digest("hex");

    mockDonationFindUnique.mockResolvedValueOnce({
      id: "don_wh_1",
      amount: 500,
      paymentStatus: "Pending",
      razorpayOrderId: "order_wh_1",
    });

    const firstOk = await webhookPost(
      new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: { "x-razorpay-signature": validWhSig },
        body: payload,
      })
    );
    expect(firstOk.status).toBe(200);
    const firstJson = await firstOk.json();
    expect(firstJson.updated).toBe(true);

    // Duplicate webhook delivery must be idempotent
    mockDonationFindUnique.mockResolvedValueOnce({
      id: "don_wh_1",
      amount: 500,
      paymentStatus: "Completed",
      razorpayOrderId: "order_wh_1",
      razorpayPaymentId: "pay_wh_1",
    });

    const secondOk = await webhookPost(
      new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: { "x-razorpay-signature": validWhSig },
        body: payload,
      })
    );
    expect(secondOk.status).toBe(200);
    const secondJson = await secondOk.json();
    expect(secondJson.updated).toBe(false);
  });
});
