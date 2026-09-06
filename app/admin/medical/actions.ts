"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addMedicalRecord(formData: FormData) {
  const animalId = formData.get("animalId") as string;
  const diagnosis = formData.get("diagnosis") as string;
  const treatment = formData.get("treatment") as string;
  const cost = parseFloat(formData.get("cost") as string) || 0;
  const vetName = formData.get("vetName") as string;
  const notes = formData.get("notes") as string || "";
  const dateStr = formData.get("date") as string;

  if (!animalId || !diagnosis || !treatment || !vetName) {
    throw new Error("Missing required fields for medical record");
  }

  await prisma.medicalRecord.create({
    data: {
      animalId,
      diagnosis,
      treatment,
      cost,
      vetName,
      notes,
      date: dateStr ? new Date(dateStr) : new Date(),
    },
  });

  revalidatePath("/admin/medical");
}

export async function addVaccination(formData: FormData) {
  const animalId = formData.get("animalId") as string;
  const vaccineName = formData.get("vaccineName") as string;
  const dateAdministeredStr = formData.get("dateAdministered") as string;
  const dateDueStr = formData.get("dateDue") as string;
  const vetName = formData.get("vetName") as string;
  const notes = formData.get("notes") as string || "";

  if (!animalId || !vaccineName || !vetName) {
    throw new Error("Missing required fields for vaccination");
  }

  await prisma.vaccination.create({
    data: {
      animalId,
      vaccineName,
      dateAdministered: dateAdministeredStr ? new Date(dateAdministeredStr) : new Date(),
      dateDue: dateDueStr ? new Date(dateDueStr) : null,
      vetName,
      notes,
    },
  });

  // Also update the Animal's vaccinated status to true
  await prisma.animal.update({
    where: { id: animalId },
    data: { vaccinated: true },
  });

  revalidatePath("/admin/medical");
  revalidatePath("/admin/animals");
}
