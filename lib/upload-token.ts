import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { checkDistributedRateLimit } from "./rate-limit";

const TOKEN_PURPOSE = "rescue-upload";
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getUploadTokenSecret(): string {
  return process.env.SESSION_SECRET || "ayudar-upload-token-secret-development-fallback-only";
}

export interface UploadTokenPayload {
  purpose: typeof TOKEN_PURPOSE;
  ip: string;
  tokenId: string;
  expiresAt: number;
}

/**
 * Generates a signed, short-lived HMAC upload token linked to the user's IP.
 */
export function generateUploadToken(ip: string): string {
  const payload: UploadTokenPayload = {
    purpose: TOKEN_PURPOSE,
    ip: ip.trim(),
    tokenId: randomBytes(16).toString("hex"),
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr, "utf8").toString("base64url");
  const signature = createHmac("sha256", getUploadTokenSecret())
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

export type TokenVerificationResult =
  | { valid: true; payload: UploadTokenPayload }
  | { valid: false; error: string };

/**
 * Validates token signature, expiration, purpose, and IP association.
 */
export function verifyUploadToken(token: string, clientIp: string): TokenVerificationResult {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing upload token" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Malformed upload token format" };
  }

  const [payloadB64, signature] = parts;

  // 1. Constant-time cryptographic HMAC verification
  const expectedSignature = createHmac("sha256", getUploadTokenSecret())
    .update(payloadB64)
    .digest("base64url");

  const sigBuf = Buffer.from(signature, "utf8");
  const expBuf = Buffer.from(expectedSignature, "utf8");

  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false, error: "Invalid upload token signature" };
  }

  // 2. Decode and validate payload attributes
  try {
    const jsonStr = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(jsonStr) as UploadTokenPayload;

    if (payload.purpose !== TOKEN_PURPOSE) {
      return { valid: false, error: "Invalid upload token purpose" };
    }

    if (typeof payload.expiresAt !== "number" || payload.expiresAt <= Date.now()) {
      return { valid: false, error: "Upload token has expired" };
    }

    // IP affinity validation (match client IP if not "unknown")
    if (clientIp !== "unknown" && payload.ip !== "unknown" && payload.ip !== clientIp.trim()) {
      return { valid: false, error: "Upload token was issued to a different client network" };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: "Corrupted upload token data" };
  }
}

/**
 * Consumes an upload token atomically to prevent replay attacks.
 * Returns true if successfully consumed, false if already consumed.
 */
export async function consumeUploadToken(tokenId: string): Promise<boolean> {
  if (!tokenId) return false;
  // Use distributed rate limiter storage with limit of 1 over the token lifetime
  const res = await checkDistributedRateLimit(`consumed-token:${tokenId}`, 1, TOKEN_TTL_MS);
  return res.allowed;
}
