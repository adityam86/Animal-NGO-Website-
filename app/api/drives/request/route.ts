import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, readBoundedJson } from "@/lib/security";
import { sendSubmissionAlertEmail } from "@/lib/email";
import { driveRequestSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rate = await checkDistributedRateLimit(`drive-request:${ip}`, 5, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many drive requests from this network. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const bodyResult = await readBoundedJson(request, 24 * 1024);
    if (!bodyResult.ok) {
      return NextResponse.json({ error: bodyResult.error }, { status: bodyResult.status });
    }

    const parsed = driveRequestSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid ward drive request fields", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const msgLines = [
      `Drive Type: ${d.driveType}`,
      `Ward / Locality: ${d.wardOrLocality}`,
      `Estimated Street Animals: ${d.estimatedAnimals ?? "Not specified"}`,
      d.notes ? `Notes: ${d.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: d.coordinatorName,
        email: d.email,
        phone: d.phone,
        subject: `[ABC / ARV Drive Request] ${d.wardOrLocality} (${d.driveType})`,
        message: msgLines,
        status: "New",
      },
    });

    void sendSubmissionAlertEmail({
      category: "ABC / Vaccination Drive Request",
      subjectLine: `${d.wardOrLocality} (${d.driveType})`,
      senderName: d.coordinatorName,
      senderEmail: d.email,
      summaryLines: [
        `Reference ID: ${inquiry.id}`,
        `Phone: ${d.phone}`,
        `Drive Type: ${d.driveType}`,
        `Locality / Ward: ${d.wardOrLocality}`,
        `Estimated Animals: ${d.estimatedAnimals ?? "Not specified"}`,
        d.notes ? `Notes: ${d.notes}` : "",
      ],
    }).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        requestId: inquiry.id,
        message:
          "Your locality drive request has been logged for our veterinary scheduling team.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create community drive request:", error);
    return NextResponse.json(
      { error: "Failed to submit community drive request." },
      { status: 500 }
    );
  }
}
