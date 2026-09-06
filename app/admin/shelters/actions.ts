"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addShelter(formData: FormData) {
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const capacity = parseInt(formData.get("capacity") as string) || 0;
  const type = formData.get("type") as string;

  if (!name || !address || !capacity || !type) {
    throw new Error("Missing required fields for shelter location");
  }

  await prisma.shelterLocation.create({
    data: {
      name,
      address,
      capacity,
      type,
    },
  });

  revalidatePath("/admin/shelters");
}

export async function assignAnimalToShelter(animalId: string, shelterLocationId: string | null) {
  await prisma.animal.update({
    where: { id: animalId },
    data: {
      shelterLocationId: shelterLocationId || null,
      // Keep the string column for backup compatibility
      shelter: shelterLocationId 
        ? (await prisma.shelterLocation.findUnique({ where: { id: shelterLocationId } }))?.name || "Unassigned"
        : "Unassigned",
    },
  });

  revalidatePath("/admin/shelters");
  revalidatePath("/admin/animals");
}
