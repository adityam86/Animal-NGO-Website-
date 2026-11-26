import { NextResponse } from "next/server";
import { AuthError, recordAuditLog, requireAdminSession } from "@/lib/auth-server";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, validateImageSignature } from "@/lib/security";
import { storeValidatedImage } from "@/lib/storage";

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const validated = validateImageSignature(buffer, file.type, file.name);
    if (!validated) {
      return NextResponse.json(
        { error: "Invalid or unsafe image file. Only verified JPG, PNG, WEBP, and GIF images are allowed." },
        { status: 400 }
      );
    }

    const stored = await storeValidatedImage(buffer, validated, file.name, "admin");

    await recordAuditLog({
      userId: session.userId,
      action: "ADMIN_UPLOAD_IMAGE",
      resource: "/api/upload",
      details: `Uploaded ${validated.mimeType} (${file.size} bytes) via ${stored.storage}`,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      url: stored.url,
      fileName: file.name,
      size: file.size,
      storage: stored.storage,
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
