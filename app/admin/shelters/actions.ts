"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recordAuditLog, requireAdminSession } from "@/lib/auth-server";
import { sanitizePlainText } from "@/lib/security";

export async function addShelter(formData: FormData) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);

  const name = sanitizePlainText(formData.get("name"), 120);
  const address = sanitizePlainText(formData.get("address"), 250);
  const capacity = parseInt(String(formData.get("capacity") || "0"), 10);
  const type = sanitizePlainText(formData.get("type"), 60);

  if (!name || !address || !Number.isFinite(capacity) || capacity <= 0 || !type) {
    throw new Error("Missing required fields for shelter location");
  }

  const shelter = await prisma.shelterLocation.create({
    data: {
      name,
      address,
      capacity: Math.min(capacity, 10_000),
      type,
    },
  });

  await recordAuditLog({
    userId: session.userId,
    action: "ADD_SHELTER",
    resource: `shelter:${shelter.id}`,
    details: `${shelter.name} (${shelter.type})`,
  });

  revalidatePath("/admin/shelters");
}

export async function assignAnimalToShelter(animalId: string, shelterLocationId: string | null) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);
  const cleanAnimalId = sanitizePlainText(animalId, 80);
  const cleanShelterId = shelterLocationId ? sanitizePlainText(shelterLocationId, 80) : null;

  if (!cleanAnimalId) throw new Error("Invalid animal ID");

  await prisma.$transaction(async (tx) => {
    const shelter = cleanShelterId
      ? await tx.shelterLocation.findUnique({ where: { id: cleanShelterId } })
      : null;

    await tx.animal.update({
      where: { id: cleanAnimalId },
      data: {
        shelterLocationId: shelter ? shelter.id : null,
        shelter: shelter ? shelter.name : "Unassigned",
      },
    });
  });

  await recordAuditLog({
    userId: session.userId,
    action: "ASSIGN_SHELTER",
    resource: `animal:${cleanAnimalId}`,
    details: cleanShelterId ? `Assigned to shelter ${cleanShelterId}` : "Unassigned from shelter",
  });

  revalidatePath("/admin/shelters");
  revalidatePath("/admin/animals");
}
