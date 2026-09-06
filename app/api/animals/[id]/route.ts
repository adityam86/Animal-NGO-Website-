import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const animal = await prisma.animal.findUnique({
      where: {
        id,
      },
    });

    if (!animal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    return NextResponse.json(animal);
  } catch (error) {
    console.error("Failed to fetch animal:", error);
    return NextResponse.json({ error: "Failed to fetch animal" }, { status: 500 });
  }
}
