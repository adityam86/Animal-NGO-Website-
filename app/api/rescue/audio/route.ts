import { NextResponse } from "next/server";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, validateAudioSignature } from "@/lib/security";
import { storePrivateAudio } from "@/lib/storage";
import { verifyUploadToken, consumeUploadToken } from "@/lib/upload-token";

export const dynamic = "force-dynamic";

const MAX_AUDIO_BYTES = 4 * 1024 * 1024; // 4 MB (~15s voice note)

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rate = await checkDistributedRateLimit(`rescue-audio:${ip}`, 10, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many voice uploads from this network. Please wait a few minutes." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const formData = await request.formData();
    const uploadToken = String(
      formData.get("uploadToken") ?? formData.get("upload_token") ?? ""
    ).trim();

    const tokenCheck = verifyUploadToken(uploadToken, ip);
    if (!tokenCheck.valid) {
      return NextResponse.json({ error: tokenCheck.error }, { status: 403 });
    }

    const consumed = await consumeUploadToken(tokenCheck.payload.tokenId);
    if (!consumed) {
      return NextResponse.json(
        { error: "Upload token has already been used. Please refresh the form to record again." },
        { status: 403 }
      );
    }

    const file = (formData.get("audio") ?? formData.get("file")) as File | null;
    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "Voice note must be under 4 MB (around 15 seconds)." },
        { status: 400 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const validatedAudio = validateAudioSignature(rawBuffer, file.type);
    if (!validatedAudio) {
      return NextResponse.json(
        { error: "Unsupported or invalid audio format. Please record WebM, Ogg, MP3, M4A, or WAV audio." },
        { status: 400 }
      );
    }

    const stored = await storePrivateAudio(
      rawBuffer,
      validatedAudio,
      file.name || "witness-voice-note"
    );

    return NextResponse.json(
      {
        success: true,
        url: stored.url,
        storage: stored.storage,
        mimeType: validatedAudio.mimeType,
        size: rawBuffer.byteLength,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Rescue audio upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save witness voice note." },
      { status: 500 }
    );
  }
}
