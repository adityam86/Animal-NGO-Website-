import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const story = await prisma.story.findUnique({
      where: {
        slug,
      },
      include: {
        phases: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error("Failed to fetch story:", error);
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 });
  }
}
