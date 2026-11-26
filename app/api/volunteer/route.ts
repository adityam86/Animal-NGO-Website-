import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsedAge = parseInt(String(data.age), 10);

    const newVolunteer = await prisma.volunteer.create({
      data: {
        name: String(data.name || "").trim(),
        age: Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : 18,
        phone: String(data.phone || "").trim(),
        email: String(data.email || "").trim(),
        location: data.location ? String(data.location).trim() : null,
        experience: data.experience ? String(data.experience).trim() : null,
        roles: {
          create: Array.isArray(data.roles)
            ? data.roles.map((role: string) => ({ role: String(role) }))
            : [],
        },
        availabilities: {
          create: Array.isArray(data.availability)
            ? data.availability.map((avail: string) => ({ availability: String(avail) }))
            : [],
        },
      },
    });

    return NextResponse.json(newVolunteer, { status: 201 });
  } catch (error) {
    console.error("Failed to register volunteer:", error);
    return NextResponse.json({ error: "Failed to register volunteer" }, { status: 500 });
  }
}
