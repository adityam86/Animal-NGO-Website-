import { NextResponse } from "next/server";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest } from "@/lib/security";
import { storeValidatedImage } from "@/lib/storage";
import { processAndSanitizeImage, ImageProcessingError } from "@/lib/image-processing";
import { verifyUploadToken, consumeUploadToken } from "@/lib/upload-token";

export const dynamic = "force-dynamic";

const MAX_RESCUE_PHOTO_BYTES = 6 * 1024 * 1024; // 6 MB limit for incident photos

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const ip = getClientIp(request);

    // 1. IP rate limiting
    const rate = await checkDistributedRateLimit(`rescue-upload:${ip}`, 8, 15 * 60 * 1000, { sensitive: true });
    if (!rate.allowed) {
      if (rate.backend === "outage-blocked" || rate.backend === "unconfigured-blocked") {
        return NextResponse.json(
          { error: "Upload service temporarily unavailable. Please submit your rescue report directly." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "Too many photo uploads from this address. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const formData = await request.formData();

    // 2. Validate file existence and inspect for SVG/script payloads
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_RESCUE_PHOTO_BYTES) {
      return NextResponse.json(
        { error: "Incident photo must be under 6 MB." },
        { status: 400 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Explicit SVG / HTML script fast rejection
    const headText = rawBuffer.subarray(0, 512).toString("utf8").toLowerCase();
    if (headText.includes("<svg") || headText.includes("<html") || headText.includes("<?xml")) {
      return NextResponse.json(
        { error: "Invalid image file. SVG and HTML scripts are strictly rejected." },
        { status: 400 }
      );
    }

    // 3. Short-lived signed upload token verification & anti-replay
    const uploadToken =
      request.headers.get("x-upload-token") ||
      (formData.get("uploadToken") as string | null);

    if (!uploadToken) {
      return NextResponse.json(
        { error: "Missing required upload token. Please submit your rescue report from the official page." },
        { status: 403 }
      );
    }

    const tokenValidation = verifyUploadToken(uploadToken, ip);
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: tokenValidation.error || "Invalid or expired upload token" },
        { status: 403 }
      );
    }

    const consumed = await consumeUploadToken(tokenValidation.payload.tokenId);
    if (!consumed) {
      return NextResponse.json(
        { error: "Upload token has already been used (replay rejected)." },
        { status: 403 }
      );
    }

    // 4. Server-side image decoding, metadata removal (EXIF/GPS stripping), and raster re-encoding
    let processed;
    try {
      processed = await processAndSanitizeImage(rawBuffer, file.name, file.type, {
        maxBytes: MAX_RESCUE_PHOTO_BYTES,
        maxDimension: 4096,
        outputFormat: "webp",
      });
    } catch (err) {
      const msg = err instanceof ImageProcessingError ? err.message : "Invalid or corrupt incident photo.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // 5. Store in private storage (never in public/uploads)
    const stored = await storeValidatedImage(
      processed.buffer,
      processed,
      file.name,
      "rescue",
      { isPrivate: true }
    );

    return NextResponse.json({
      success: true,
      url: stored.url,
      fileName: file.name,
      size: processed.buffer.length,
      storage: stored.storage,
      width: processed.width,
      height: processed.height,
      isPrivate: true,
    });
  } catch (error) {
    console.error("Rescue upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload incident photo. Please submit your rescue report directly." },
      { status: 500 }
    );
  }
}
