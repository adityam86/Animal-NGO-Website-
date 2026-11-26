import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const queryOptions: Prisma.StoryFindManyArgs = {
      orderBy: { date: "desc" },
      include: { phases: true },
    };

    if (limit) {
      const parsed = parseInt(limit, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        queryOptions.take = parsed;
      }
    }

    const stories = await prisma.story.findMany(queryOptions);

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
  }
}
