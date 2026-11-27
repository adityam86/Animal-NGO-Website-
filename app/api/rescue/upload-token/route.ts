import { NextResponse } from "next/server";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest } from "@/lib/security";
import { generateUploadToken } from "@/lib/upload-token";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const ip = getClientIp(request);
    // Rate limit token issuance to 12 tokens per 15 minutes per IP
    const rate = await checkDistributedRateLimit(`upload-token-req:${ip}`, 12, 15 * 60 * 1000, {
      sensitive: true,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many upload requests. Please wait before requesting another upload token." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const token = generateUploadToken(ip);

    return NextResponse.json({
      token,
      expiresIn: 900, // 15 minutes
    });
  } catch (error) {
    console.error("Upload token error:", error);
    return NextResponse.json({ error: "Failed to generate upload token" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
