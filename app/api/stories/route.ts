import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const queryOptions: any = {
      orderBy: { date: 'desc' },
      include: { phases: true }
    };

    if (limit) {
      queryOptions.take = parseInt(limit);
    }

    const stories = await prisma.story.findMany(queryOptions);

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
  }
}
