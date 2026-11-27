import { NextResponse } from "next/server";
import { AuthError, recordAuditLog, requireAdminSession } from "@/lib/auth-server";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest } from "@/lib/security";
import { storeValidatedImage } from "@/lib/storage";
import { processAndSanitizeImage, ImageProcessingError } from "@/lib/image-processing";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const session = await requireAdminSession();

    const ip = getClientIp(request);
    const rate = await checkDistributedRateLimit(`admin-upload:${session.userId}:${ip}`, 30, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Upload rate limit exceeded. Please wait before uploading more images." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File size must be between 1 byte and 8 MB." },
        { status: 400 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Server-side image decoding, metadata stripping (EXIF/GPS), and raster re-encoding
    let processed;
    try {
      processed = await processAndSanitizeImage(rawBuffer, file.name, file.type, {
        maxBytes: MAX_UPLOAD_BYTES,
        maxDimension: 4096,
        outputFormat: "webp",
      });
    } catch (err) {
      const msg = err instanceof ImageProcessingError ? err.message : "Invalid or corrupted image file.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const stored = await storeValidatedImage(
      processed.buffer,
      processed,
      file.name,
      "admin",
      { isPrivate: false }
    );

    await recordAuditLog({
      userId: session.userId,
      action: "ADMIN_UPLOAD_IMAGE",
      resource: "/api/upload",
      details: `Uploaded ${processed.mimeType} (${processed.width}x${processed.height}, ${processed.buffer.length} bytes) via ${stored.storage}`,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      url: stored.url,
      fileName: file.name,
      size: processed.buffer.length,
      storage: stored.storage,
      width: processed.width,
      height: processed.height,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Admin upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image." },
      { status: 500 }
    );
  }
}
