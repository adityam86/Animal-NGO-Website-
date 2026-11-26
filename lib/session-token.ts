export const SESSION_COOKIE_NAME = "ayudar_admin_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 hours

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "COORDINATOR" | "VET";

export interface SessionTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
  jti: string;
  iat: number;
  exp: number;
}

const globalForSecret = globalThis as unknown as {
  __ayudarDevSessionSecret?: string;
};

function getSessionSecretBytes(): Uint8Array {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 32) {
    return new TextEncoder().encode(configured);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET environment variable must be set to at least 32 characters in production."
    );
  }

  if (!globalForSecret.__ayudarDevSessionSecret) {
    const bytes = new Uint8Array(32);
    globalThis.crypto.getRandomValues(bytes);
    globalForSecret.__ayudarDevSessionSecret = Array.from(bytes, (b) =>
      b.toString(16).padStart(2, "0")
    ).join("");
  }

  return new TextEncoder().encode(globalForSecret.__ayudarDevSessionSecret);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): Uint8Array | null {
  try {
    const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function importSigningKey(): Promise<CryptoKey> {
  const secretBytes = getSessionSecretBytes();
  const keyBuffer = new ArrayBuffer(secretBytes.byteLength);
  new Uint8Array(keyBuffer).set(secretBytes);
  return globalThis.crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export function generateTokenId(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSessionToken(
  user: { id: string; email: string; name: string; role: AdminRole },
  jti: string
): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = toBase64Url(
    new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  );
  const payload: SessionTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    jti,
    iat: nowSec,
    exp: nowSec + SESSION_DURATION_SECONDS,
  };
  const encodedPayload = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${header}.${encodedPayload}`;

  const key = await importSigningKey();
  const sigBuffer = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signingInput)
  );
  const signature = toBase64Url(new Uint8Array(sigBuffer));
  return `${signingInput}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionTokenPayload | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, encodedPayload, encodedSignature] = parts;
  const sigBytes = fromBase64Url(encodedSignature);
  if (!sigBytes) return null;

  try {
    const key = await importSigningKey();
    const sigBuffer = new ArrayBuffer(sigBytes.byteLength);
    new Uint8Array(sigBuffer).set(sigBytes);
    const valid = await globalThis.crypto.subtle.verify(
      "HMAC",
      key,
      sigBuffer,
      new TextEncoder().encode(`${header}.${encodedPayload}`)
    );
    if (!valid) return null;

    const payloadBytes = fromBase64Url(encodedPayload);
    if (!payloadBytes) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(payloadBytes)
    ) as Partial<SessionTokenPayload>;

    const nowSec = Math.floor(Date.now() / 1000);
    if (
      !payload.sub ||
      !payload.email ||
      !payload.role ||
      !payload.jti ||
      typeof payload.exp !== "number" ||
      payload.exp <= nowSec
    ) {
      return null;
    }

    return payload as SessionTokenPayload;
  } catch {
    return null;
  }
}
