import { NextResponse } from "next/server";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, validateImageSignature } from "@/lib/security";
import { storeValidatedImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_RESCUE_PHOTO_BYTES = 4 * 1024 * 1024; // 4 MB limit for public incident photos

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const ip = getClientIp(request);
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
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_RESCUE_PHOTO_BYTES) {
      return NextResponse.json(
        { error: "Incident photo must be under 4 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const validated = validateImageSignature(buffer, file.type, file.name);
    if (!validated) {
      return NextResponse.json(
        { error: "Invalid image file. Only JPG, PNG, WEBP, and GIF photos are accepted." },
        { status: 400 }
      );
    }

    const stored = await storeValidatedImage(buffer, validated, file.name, "rescue");

    return NextResponse.json({
      success: true,
      url: stored.url,
      fileName: file.name,
      size: file.size,
      storage: stored.storage,
    });
  } catch (error) {
    console.error("Rescue upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload incident photo. Please submit your rescue report directly." },
      { status: 500 }
    );
  }
}
