import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, readBoundedJson } from "@/lib/security";
import { contactCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit(`contact-inquiry:${ip}`, 6, 15 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many messages submitted. Please wait before sending another enquiry." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const bodyResult = await readBoundedJson(request, 32 * 1024);
    if (!bodyResult.ok) {
      return NextResponse.json({ error: bodyResult.error }, { status: bodyResult.status });
    }

    const parsed = contactCreateSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: d.name,
        phone: d.phone || null,
        email: d.email,
        subject: d.subject,
        message: d.message,
        status: "New",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error("Failed to save contact inquiry:", error);
    return NextResponse.json({ error: "Failed to submit your message." }, { status: 500 });
  }
}
