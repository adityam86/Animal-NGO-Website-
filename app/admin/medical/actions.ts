"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recordAuditLog, requireAdminSession } from "@/lib/auth-server";
import { sanitizePlainText } from "@/lib/security";

export async function addMedicalRecord(formData: FormData) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);

  const animalId = sanitizePlainText(formData.get("animalId"), 80);
  const diagnosis = sanitizePlainText(formData.get("diagnosis"), 200);
  const treatment = sanitizePlainText(formData.get("treatment"), 400);
  const costRaw = parseFloat(String(formData.get("cost") || "0"));
  const cost = Number.isFinite(costRaw) && costRaw >= 0 ? Math.min(costRaw, 5_000_000) : 0;
  const vetName = sanitizePlainText(formData.get("vetName"), 120);
  const notes = sanitizePlainText(formData.get("notes"), 1000);
  const dateStr = String(formData.get("date") || "").trim();

  if (!animalId || !diagnosis || !treatment || !vetName) {
    throw new Error("Missing required fields for medical record");
  }

  const record = await prisma.medicalRecord.create({
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

  await recordAuditLog({
    userId: session.userId,
    action: "ADD_MEDICAL_RECORD",
    resource: `medical:${record.id}`,
    details: `Animal ${animalId}: ${diagnosis}`,
  });

  revalidatePath("/admin/medical");
}

export async function addVaccination(formData: FormData) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);

  const animalId = sanitizePlainText(formData.get("animalId"), 80);
  const vaccineName = sanitizePlainText(formData.get("vaccineName"), 160);
  const dateAdministeredStr = String(formData.get("dateAdministered") || "").trim();
  const dateDueStr = String(formData.get("dateDue") || "").trim();
  const vetName = sanitizePlainText(formData.get("vetName"), 120);
  const notes = sanitizePlainText(formData.get("notes"), 1000);

  if (!animalId || !vaccineName || !vetName) {
    throw new Error("Missing required fields for vaccination");
  }

  const vacc = await prisma.$transaction(async (tx) => {
    const created = await tx.vaccination.create({
      data: {
        animalId,
        vaccineName,
        dateAdministered: dateAdministeredStr ? new Date(dateAdministeredStr) : new Date(),
        dateDue: dateDueStr ? new Date(dateDueStr) : null,
        vetName,
        notes,
      },
    });

    await tx.animal.update({
      where: { id: animalId },
      data: { vaccinated: true },
    });

    return created;
  });

  await recordAuditLog({
    userId: session.userId,
    action: "ADD_VACCINATION",
    resource: `vaccination:${vacc.id}`,
    details: `Animal ${animalId}: ${vaccineName}`,
  });

  revalidatePath("/admin/medical");
  revalidatePath("/admin/animals");
}
