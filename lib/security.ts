export { isSafeImageUrl, shouldBypassImageOptimization } from "./image-url";

export function getClientIp(request: Request): string {
  const vercelIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercelIp) return vercelIp;
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return "local";
}

/**
 * Verifies same-origin for browser state-changing requests (defense-in-depth CSRF guard).
 */
export function isSameOriginRequest(request: Request): boolean {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") {
    return false;
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Strips null bytes, control chars, and raw angle brackets from untrusted plain text.
 */
export function sanitizePlainText(value: unknown, maxLength = 2000): string {
  return String(value ?? "")
    .replace(/\0/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Neutralizes CSV formula injection (=, +, -, @, tab, CR) and quotes cell safely.
 */
export function sanitizeCsvCell(value: string | number | boolean | null | undefined): string {
  let str = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export interface ValidatedImage {
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  extension: "jpg" | "png" | "webp" | "gif";
}

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

/**
 * Verifies actual image file signature (magic bytes) and explicitly rejects SVGs/executables.
 */
export function validateImageSignature(
  buffer: Buffer,
  declaredMime: string,
  filename: string
): ValidatedImage | null {
  if (buffer.length < 12) return null;

  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
    return null;
  }

  // Explicitly block SVG / HTML even if wrapped or mislabeled
  const headText = buffer.subarray(0, 256).toString("utf8").trim().toLowerCase();
  if (headText.includes("<svg") || headText.includes("<html") || headText.includes("<?xml")) {
    return null;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    if (declaredMime && declaredMime !== "image/jpeg" && declaredMime !== "image/jpg") {
      return null;
    }
    return { mimeType: "image/jpeg", extension: "jpg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    if (declaredMime && declaredMime !== "image/png") return null;
    return { mimeType: "image/png", extension: "png" };
  }

  // GIF: GIF87a / GIF89a
  const gifSig = buffer.subarray(0, 6).toString("ascii");
  if (gifSig === "GIF87a" || gifSig === "GIF89a") {
    if (declaredMime && declaredMime !== "image/gif") return null;
    return { mimeType: "image/gif", extension: "gif" };
  }

  // WEBP: RIFF....WEBP
  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") {
    if (declaredMime && declaredMime !== "image/webp") return null;
    return { mimeType: "image/webp", extension: "webp" };
  }

  return null;
}

export async function readBoundedJson(
  request: Request,
  maxBytes = 64 * 1024
): Promise<{ ok: true; data: unknown } | { ok: false; status: number; error: string }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    return { ok: false, status: 413, error: "Request payload too large" };
  }

  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > maxBytes) {
      return { ok: false, status: 413, error: "Request payload too large" };
    }
    return { ok: true, data: JSON.parse(raw) };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON payload" };
  }
}
