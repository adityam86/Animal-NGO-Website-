import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, readBoundedJson } from "@/lib/security";
import { volunteerCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rate = await checkDistributedRateLimit(`volunteer-create:${ip}`, 6, 15 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many submissions received. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const bodyResult = await readBoundedJson(request, 64 * 1024);
    if (!bodyResult.ok) {
      return NextResponse.json({ error: bodyResult.error }, { status: bodyResult.status });
    }

    const parsed = volunteerCreateSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please complete all required fields." },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const newVolunteer = await prisma.volunteer.create({
      data: {
        name: data.name,
        age: data.age,
        phone: data.phone,
        email: data.email,
        location: data.location || null,
        experience: data.experience || null,
        status: "Pending Review",
        roles: {
          create: data.roles.map((role) => ({ role })),
        },
        availabilities: {
          create: data.availability.map((availability) => ({ availability })),
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newVolunteer, { status: 201 });
  } catch (error) {
    console.error("Failed to register volunteer:", error);
    return NextResponse.json({ error: "Failed to register volunteer" }, { status: 500 });
  }
}
