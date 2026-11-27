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
  mockRazorpayPaymentFetch,
} = vi.hoisted(() => ({
  mockDonationFindUnique: vi.fn(),
  mockDonationUpdate: vi.fn(),
  mockDonationUpdateMany: vi.fn(),
  mockSponsorshipFindUnique: vi.fn(),
  mockSponsorshipUpdate: vi.fn(),
  mockSponsorshipUpdateMany: vi.fn(),
  mockAuditCreate: vi.fn(),
  mockRazorpayPaymentFetch: vi.fn(),
}));

vi.mock("razorpay", () => {
  return {
    default: class MockRazorpay {
      payments = {
        fetch: (...args: unknown[]) => mockRazorpayPaymentFetch(...args),
      };
    },
  };
});

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
    $transaction: async (cb: (tx: unknown) => Promise<unknown>) => cb(client),
  };
  return { default: client, prisma: client };
});

import { resetRateLimitStore } from "@/lib/rate-limit";
import { POST as createOrderPost } from "@/app/api/create-order/route";
import { POST as verifyPaymentPost } from "@/app/api/verify-payment/route";
import { POST as webhookPost } from "@/app/api/webhooks/razorpay/route";

const TEST_SECRET = "rzp_test_secret_for_signature_checks_987654";
const WEBHOOK_SECRET = "whsec_test_webhook_secret_abcdef";

function signPayment(orderId: string, paymentId: string) {
  return createHmac("sha256", TEST_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
}

describe("Razorpay Order, Replay, Amount & Webhook Regression Security", () => {
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
    expect((await mockVerifyRes.json()).verified).toBe(false);
  });

  it("rejects verification when DB record has null razorpayOrderId (cheaper-order replay prevention)", async () => {
    const cheapOrderId = "order_cheap_10";
    const cheapPaymentId = "pay_cheap_10";

    mockDonationFindUnique.mockResolvedValue({
      id: "don_50k",
      amount: 50000,
      paymentStatus: "Pending",
      razorpayOrderId: null, // Unbound expensive pending donation
      razorpayPaymentId: null,
    });

    const replayRes = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: cheapOrderId,
          razorpay_payment_id: cheapPaymentId,
          razorpay_signature: signPayment(cheapOrderId, cheapPaymentId),
          donationId: "don_50k",
        }),
      })
    );

    expect(replayRes.status).toBe(400);
    expect(mockDonationUpdate).not.toHaveBeenCalled();
    expect(mockRazorpayPaymentFetch).not.toHaveBeenCalled();
  });

  it("rejects invalid HMAC signatures and different order IDs without corrupting records", async () => {
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
        where: expect.objectContaining({ razorpayOrderId: "order_real_999" }),
        data: expect.objectContaining({ paymentStatus: "Failed" }),
      })
    );

    const mismatchRes = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: "order_other_123",
          razorpay_payment_id: "pay_real_222",
          razorpay_signature: signPayment("order_other_123", "pay_real_222"),
          donationId: "don_2",
        }),
      })
    );
    expect(mismatchRes.status).toBe(400);
    expect(mockDonationUpdate).not.toHaveBeenCalled();
  });

  it("rejects payloads specifying both donationId and sponsorshipId", async () => {
    const bothRes = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: "order_1",
          razorpay_payment_id: "pay_1",
          razorpay_signature: signPayment("order_1", "pay_1"),
          donationId: "don_1",
          sponsorshipId: "sp_1",
        }),
      })
    );
    expect(bothRes.status).toBe(400);
  });

  it("rejects wrong Razorpay API amount, wrong order linkage, and non-captured statuses", async () => {
    const orderId = "order_srv_500";
    const paymentId = "pay_srv_500";
    mockDonationFindUnique.mockResolvedValue({
      id: "don_5000",
      amount: 5000,
      paymentStatus: "Pending",
      razorpayOrderId: orderId,
      razorpayPaymentId: null,
    });

    // Case 1: Wrong paid amount returned by Razorpay server API (1000 paise instead of 500000)
    mockRazorpayPaymentFetch.mockResolvedValueOnce({
      id: paymentId,
      order_id: orderId,
      amount: 1000,
      currency: "INR",
      status: "captured",
    });
    const wrongAmtRes = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signPayment(orderId, paymentId),
          donationId: "don_5000",
        }),
      })
    );
    expect(wrongAmtRes.status).toBe(400);
    expect((await wrongAmtRes.json()).error).toMatch(/amount/i);
    expect(mockDonationUpdate).not.toHaveBeenCalled();

    // Case 2: Razorpay says payment belongs to a different order
    mockRazorpayPaymentFetch.mockResolvedValueOnce({
      id: paymentId,
      order_id: "order_different_xyz",
      amount: 500000,
      currency: "INR",
      status: "captured",
    });
    const wrongOrderRes = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signPayment(orderId, paymentId),
          donationId: "don_5000",
        }),
      })
    );
    expect(wrongOrderRes.status).toBe(400);

    // Case 3: Razorpay reports payment failed
    mockRazorpayPaymentFetch.mockResolvedValueOnce({
      id: paymentId,
      order_id: orderId,
      amount: 500000,
      currency: "INR",
      status: "failed",
    });
    const failedRes = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signPayment(orderId, paymentId),
          donationId: "don_5000",
        }),
      })
    );
    expect(failedRes.status).toBe(400);
    expect(mockDonationUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ paymentStatus: "Failed" }) })
    );

    // Case 4: Razorpay reports payment status === "authorized" (not yet captured)
    // Must return HTTP 400 and NOT mark Completed (database record stays Pending)
    mockDonationUpdate.mockClear();
    mockDonationUpdateMany.mockClear();
    mockRazorpayPaymentFetch.mockResolvedValueOnce({
      id: paymentId,
      order_id: orderId,
      amount: 500000,
      currency: "INR",
      status: "authorized",
    });
    const authorizedRes = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signPayment(orderId, paymentId),
          donationId: "don_5000",
        }),
      })
    );
    expect(authorizedRes.status).toBe(400);
    expect((await authorizedRes.json()).error).toMatch(/authorized/i);
    expect(mockDonationUpdate).not.toHaveBeenCalled();
    expect(mockDonationUpdateMany).not.toHaveBeenCalled();

    // Case 5: Razorpay reports payment status === "created" (unpaid)
    mockRazorpayPaymentFetch.mockResolvedValueOnce({
      id: paymentId,
      order_id: orderId,
      amount: 500000,
      currency: "INR",
      status: "created",
    });
    const createdRes = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signPayment(orderId, paymentId),
          donationId: "don_5000",
        }),
      })
    );
    expect(createdRes.status).toBe(400);
    expect(mockDonationUpdate).not.toHaveBeenCalled();
  });

  it("verifies valid Razorpay payments, handles repeated verification idempotently, and blocks reused paymentId", async () => {
    const orderId = "order_valid_555";
    const paymentId = "pay_valid_777";
    const validSig = signPayment(orderId, paymentId);

    mockRazorpayPaymentFetch.mockResolvedValue({
      id: paymentId,
      order_id: orderId,
      amount: 100000, // ₹1000 in paise
      currency: "INR",
      status: "captured",
    });

    // Step 1 pre-check -> Step 4 tx check (donation) + tx re-read
    mockDonationFindUnique
      .mockResolvedValueOnce({
        id: "don_555",
        amount: 1000,
        paymentStatus: "Pending",
        razorpayOrderId: orderId,
        razorpayPaymentId: null,
      })
      .mockResolvedValueOnce(null) // existingDonationPayment
      .mockResolvedValueOnce({
        id: "don_555",
        amount: 1000,
        paymentStatus: "Pending",
        razorpayOrderId: orderId,
        razorpayPaymentId: null,
      });
    mockSponsorshipFindUnique.mockResolvedValueOnce(null); // existingSponsorshipPayment
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
    expect((await okRes.json()).verified).toBe(true);
    expect(mockDonationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paymentStatus: "Completed",
          razorpayPaymentId: paymentId,
          verifiedAt: expect.any(Date),
        }),
      })
    );

    // Repeated valid verification on same completed donation is idempotent (200)
    mockDonationFindUnique.mockResolvedValueOnce({
      id: "don_555",
      amount: 1000,
      paymentStatus: "Completed",
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
    });
    const repeatRes = await verifyPaymentPost(
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
    expect(repeatRes.status).toBe(200);
    expect((await repeatRes.json()).alreadyCompleted).toBe(true);

    // Reusing same paymentId on a DIFFERENT sponsorship record (cross-table replay) -> 409
    mockSponsorshipFindUnique
      .mockResolvedValueOnce({
        id: "sp_other",
        tier: "Full Care - 3000",
        amount: 3000,
        paymentStatus: "Pending",
        razorpayOrderId: orderId,
        razorpayPaymentId: null,
      })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "sp_other",
        tier: "Full Care - 3000",
        amount: 3000,
        paymentStatus: "Pending",
        razorpayOrderId: orderId,
        razorpayPaymentId: null,
      });
    mockDonationFindUnique.mockResolvedValueOnce({
      id: "don_555",
      razorpayPaymentId: paymentId,
    });
    mockRazorpayPaymentFetch.mockResolvedValueOnce({
      id: paymentId,
      order_id: orderId,
      amount: 300000,
      currency: "INR",
      status: "captured",
    });

    const replayCrossTable = await verifyPaymentPost(
      new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSig,
          sponsorshipId: "sp_other",
        }),
      })
    );
    expect(replayCrossTable.status).toBe(409);
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
            status: "captured",
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

    // Cross-table replay check: no existing payment with this paymentId
    mockDonationFindUnique.mockResolvedValueOnce(null); // razorpayPaymentId lookup
    mockSponsorshipFindUnique.mockResolvedValueOnce(null); // razorpayPaymentId lookup
    // Then the razorpayOrderId lookup returns the pending donation
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
    expect((await firstOk.json()).updated).toBe(true);

    // Duplicate webhook delivery must be idempotent
    // Cross-table replay check returns existing completed donation
    mockDonationFindUnique.mockResolvedValueOnce({
      id: "don_wh_1",
      razorpayPaymentId: "pay_wh_1",
    }); // razorpayPaymentId lookup finds existing
    mockSponsorshipFindUnique.mockResolvedValueOnce(null);
    // razorpayOrderId lookup
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
    expect((await secondOk.json()).updated).toBe(false);

    // Test: Missing currency rejected (HTTP 400)
    const noCurrencyPayload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_bad_cur", order_id: "order_wh_1", amount: 50000, status: "captured" } },
      },
    });
    const noCurSig = createHmac("sha256", WEBHOOK_SECRET).update(noCurrencyPayload, "utf8").digest("hex");
    const noCurRes = await webhookPost(
      new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: { "x-razorpay-signature": noCurSig },
        body: noCurrencyPayload,
      })
    );
    expect(noCurRes.status).toBe(400);
    expect((await noCurRes.json()).error).toMatch(/currency/i);

    // Test: Non-INR currency rejected (HTTP 400)
    const usdPayload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_usd", order_id: "order_wh_1", amount: 50000, currency: "USD", status: "captured" } },
      },
    });
    const usdSig = createHmac("sha256", WEBHOOK_SECRET).update(usdPayload, "utf8").digest("hex");
    const usdRes = await webhookPost(
      new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: { "x-razorpay-signature": usdSig },
        body: usdPayload,
      })
    );
    expect(usdRes.status).toBe(400);
    expect((await usdRes.json()).error).toMatch(/currency/i);

    // Test: Non-captured status (e.g. authorized) for payment.captured rejected (HTTP 400)
    const authPayload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_auth", order_id: "order_wh_1", amount: 50000, currency: "INR", status: "authorized" } },
      },
    });
    const authSig = createHmac("sha256", WEBHOOK_SECRET).update(authPayload, "utf8").digest("hex");
    const authRes = await webhookPost(
      new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: { "x-razorpay-signature": authSig },
        body: authPayload,
      })
    );
    expect(authRes.status).toBe(400);
    expect((await authRes.json()).error).toMatch(/captured/i);

    // Test: Incorrect amount rejected (HTTP 400)
    const wrongAmtPayload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_wrong", order_id: "order_wh_1", amount: 1000, currency: "INR", status: "captured" } },
      },
    });
    const wrongAmtSig = createHmac("sha256", WEBHOOK_SECRET).update(wrongAmtPayload, "utf8").digest("hex");
    mockDonationFindUnique.mockResolvedValueOnce(null);
    mockSponsorshipFindUnique.mockResolvedValueOnce(null);
    mockDonationFindUnique.mockResolvedValueOnce({
      id: "don_wh_1",
      amount: 500, // ₹500 = 50000 paise != 1000 paise
      paymentStatus: "Pending",
      razorpayOrderId: "order_wh_1",
    });
    const wrongAmtRes = await webhookPost(
      new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: { "x-razorpay-signature": wrongAmtSig },
        body: wrongAmtPayload,
      })
    );
    expect(wrongAmtRes.status).toBe(400);
    expect((await wrongAmtRes.json()).error).toMatch(/amount/i);

    // Test: Duplicate payment ID cross-table assigned to donation and sponsorship rejected (HTTP 409)
    const dupPayPayload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_reused", order_id: "order_wh_2", amount: 50000, currency: "INR", status: "captured" } },
      },
    });
    const dupPaySig = createHmac("sha256", WEBHOOK_SECRET).update(dupPayPayload, "utf8").digest("hex");
    mockDonationFindUnique.mockResolvedValueOnce(null);
    // Already used in sponsorship!
    mockSponsorshipFindUnique.mockResolvedValueOnce({ id: "spon_existing", razorpayPaymentId: "pay_reused" });
    mockDonationFindUnique.mockResolvedValueOnce({
      id: "don_wh_2",
      amount: 500,
      paymentStatus: "Pending",
      razorpayOrderId: "order_wh_2",
    });
    const dupPayRes = await webhookPost(
      new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: { "x-razorpay-signature": dupPaySig },
        body: dupPayPayload,
      })
    );
    expect(dupPayRes.status).toBe(409);
    expect((await dupPayRes.json()).error).toMatch(/duplicate payment id/i);

    // Test: order.paid without payment entity handled properly
    const orderPaidPayload = JSON.stringify({
      event: "order.paid",
      payload: {
        order: {
          entity: {
            id: "order_only_1",
            amount: 50000,
            amount_paid: 50000,
            currency: "INR",
            status: "paid",
          },
        },
      },
    });
    const orderPaidSig = createHmac("sha256", WEBHOOK_SECRET).update(orderPaidPayload, "utf8").digest("hex");
    mockDonationFindUnique.mockResolvedValueOnce({
      id: "don_order_only",
      amount: 500,
      paymentStatus: "Pending",
      razorpayOrderId: "order_only_1",
    });
    const orderPaidRes = await webhookPost(
      new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: { "x-razorpay-signature": orderPaidSig },
        body: orderPaidPayload,
      })
    );
    expect(orderPaidRes.status).toBe(200);
    expect((await orderPaidRes.json()).updated).toBe(true);
  });
});
