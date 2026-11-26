import { createHmac, timingSafeEqual } from "node:crypto";

export const SPONSORSHIP_TIERS_INR: Record<string, number> = {
  "Food - 500": 500,
  "Medical - 1000": 1000,
  "Care - 1500": 1500,
  "Full Care - 3000": 3000,
};

export function hasMockIdentifier(value: string | undefined | null): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v.startsWith("order_mock_") || v.startsWith("pay_mock") || v.startsWith("sig_mock");
}

/**
 * Mock payments are ONLY permitted when explicitly enabled in non-production environments
 * AND no live Razorpay credentials are configured. Production ALWAYS rejects mock payments.
 */
export function isMockPaymentsEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  if (process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_ID) {
    return false;
  }
  return process.env.ENABLE_DEMO_PAYMENTS === "true";
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  if (!orderId || !paymentId || !signature || !secret) return false;
  if (hasMockIdentifier(orderId) || hasMockIdentifier(paymentId) || hasMockIdentifier(signature)) {
    return false;
  }

  const expectedHex = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex")
    .toLowerCase();

  const expectedBuf = Buffer.from(expectedHex, "utf8");
  const providedBuf = Buffer.from(signature.trim().toLowerCase(), "utf8");
  if (expectedBuf.length !== providedBuf.length) {
    return false;
  }
  return timingSafeEqual(expectedBuf, providedBuf);
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string
): boolean {
  if (!rawBody || !signatureHeader || !webhookSecret) return false;

  const expectedHex = createHmac("sha256", webhookSecret)
    .update(rawBody, "utf8")
    .digest("hex")
    .toLowerCase();

  const expectedBuf = Buffer.from(expectedHex, "utf8");
  const providedBuf = Buffer.from(signatureHeader.trim().toLowerCase(), "utf8");
  if (expectedBuf.length !== providedBuf.length) {
    return false;
  }
  return timingSafeEqual(expectedBuf, providedBuf);
}
