import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rescueCase = await prisma.rescueCase.findUnique({
      where: {
        id: id,
      },
      include: {
        history: true,
      }
    });

    if (!rescueCase) {
      return NextResponse.json({ error: "Rescue case not found" }, { status: 404 });
    }

    return NextResponse.json(rescueCase);
  } catch (error) {
    console.error("Failed to fetch rescue case:", error);
    return NextResponse.json({ error: "Failed to fetch rescue case" }, { status: 500 });
  }
}
