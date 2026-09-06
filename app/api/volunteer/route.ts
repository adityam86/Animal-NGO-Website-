import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const newVolunteer = await prisma.volunteer.create({
      data: {
        name: data.name,
        age: parseInt(data.age),
        phone: data.phone,
        email: data.email,
        location: data.location || null,
        experience: data.experience || null,
        roles: {
          create: data.roles?.map((role: string) => ({ role })) || [],
        },
        availabilities: {
          create: data.availability?.map((avail: string) => ({ availability: avail })) || [],
        }
      },
    });

    return NextResponse.json(newVolunteer, { status: 201 });
  } catch (error) {
    console.error("Failed to register volunteer:", error);
    return NextResponse.json({ error: "Failed to register volunteer" }, { status: 500 });
  }
}
