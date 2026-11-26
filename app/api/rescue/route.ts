import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { AuthError, requireAdminSession } from "@/lib/auth-server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, readBoundedJson } from "@/lib/security";
import { rescueCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const queryOptions: Prisma.RescueCaseFindManyArgs = {
      include: {
        history: {
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        },
      },
      orderBy: { reportedAt: "desc" },
    };

    if (limit) {
      const parsed = parseInt(limit, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        queryOptions.take = Math.min(parsed, 200);
      }
    }

    const cases = await prisma.rescueCase.findMany(queryOptions);
    return NextResponse.json(cases, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to fetch rescue cases:", error);
    return NextResponse.json({ error: "Failed to fetch rescue cases" }, { status: 500 });
  }
}

function classifyRescue(description: string, animalType: string) {
  const desc = description.toLowerCase();
  let emergencyLevel: "Critical" | "High" | "Normal" = "Normal";

  const criticalKeywords = [
    "bleeding",
    "blood",
    "accident",
    "hit by",
    "car",
    "run over",
    "truck",
    "fracture",
    "unconscious",
    "dying",
    "broken leg",
    "injured badly",
    "poisoned",
  ];
  const highKeywords = [
    "sick",
    "vomiting",
    "limping",
    "wounded",
    "pain",
    "open wound",
    "crying",
    "mange",
    "trapped",
    "cannot walk",
  ];

  if (criticalKeywords.some((kw) => desc.includes(kw))) {
    emergencyLevel = "Critical";
  } else if (highKeywords.some((kw) => desc.includes(kw))) {
    emergencyLevel = "High";
  }

  let assignedTeam = "General Rescue Team 01";
  const type = (animalType || "").toLowerCase();
  if (type === "cow" || type === "buffalo" || type === "bull") {
    assignedTeam = "Gaushala Rescue Team 02";
  } else if (type === "cat" || type === "kitten") {
    assignedTeam = "Cat Care Team 03";
  } else if (type === "bird" || type === "goat") {
    assignedTeam = "Small Animals Team 04";
  }

  return { emergencyLevel, assignedTeam };
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit(`rescue-create:${ip}`, 8, 15 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many rescue reports submitted. For emergencies, call +91 98000 00000." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const bodyResult = await readBoundedJson(request, 64 * 1024);
    if (!bodyResult.ok) {
      return NextResponse.json({ error: bodyResult.error }, { status: bodyResult.status });
    }

    const parsed = rescueCreateSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Invalid rescue report details.",
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const aiResult = classifyRescue(data.description, data.animalType);
    const nowTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newCase = await prisma.rescueCase.create({
      data: {
        animalType: data.animalType,
        emergencyLevel: data.emergencyLevel || aiResult.emergencyLevel,
        location: data.location,
        reporterName: data.reporterName,
        reporterPhone: data.reporterPhone,
        reporterEmail: data.reporterEmail || null,
        photoUrl: data.photoUrl || null,
        description: data.condition ? `[${data.condition}] ${data.description}` : data.description,
        assignedTeam: aiResult.assignedTeam,
        status: "Reported",
        history: {
          create: [
            { status: "Reported", time: nowTime, done: true, sortOrder: 0 },
            { status: "Assigned", done: false, sortOrder: 1 },
            { status: "On The Way", done: false, sortOrder: 2 },
            { status: "Rescued", done: false, sortOrder: 3 },
            { status: "Treatment", done: false, sortOrder: 4 },
            { status: "Closed", done: false, sortOrder: 5 },
          ],
        },
      },
      select: {
        id: true,
        animalType: true,
        emergencyLevel: true,
        assignedTeam: true,
        status: true,
        reportedAt: true,
      },
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error("Failed to create rescue case:", error);
    return NextResponse.json({ error: "Failed to create rescue case" }, { status: 500 });
  }
}
