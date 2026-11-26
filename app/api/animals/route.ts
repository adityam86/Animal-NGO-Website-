import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    const where: Prisma.AnimalWhereInput = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const queryOptions: Prisma.AnimalFindManyArgs = {
      where,
      orderBy: { createdAt: "desc" },
    };

    if (limit) {
      const parsed = parseInt(limit, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        queryOptions.take = parsed;
      }
    }

    const animals = await prisma.animal.findMany(queryOptions);

    return NextResponse.json(animals);
  } catch (error) {
    console.error("Failed to fetch animals:", error);
    return NextResponse.json({ error: "Failed to fetch animals" }, { status: 500 });
  }
}
