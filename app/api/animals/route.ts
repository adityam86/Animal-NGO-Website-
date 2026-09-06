import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const queryOptions: any = {
      where,
      orderBy: { createdAt: 'desc' }
    };

    if (limit) {
      queryOptions.take = parseInt(limit);
    }

    const animals = await prisma.animal.findMany(queryOptions);

    return NextResponse.json(animals);
  } catch (error) {
    console.error("Failed to fetch animals:", error);
    return NextResponse.json({ error: "Failed to fetch animals" }, { status: 500 });
  }
}
