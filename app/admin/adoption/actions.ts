"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recordAuditLog, requireAdminSession } from "@/lib/auth-server";
import { sanitizePlainText } from "@/lib/security";

const ALLOWED_ADOPTION_STATUSES = new Set([
  "Submitted",
  "Pending",
  "Interview Scheduled",
  "Approved",
  "Adopted",
  "Rejected",
]);

export async function updateAdoptionStatus(id: string, newStatus: string) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);
  const cleanId = sanitizePlainText(id, 80);
  const cleanStatus = sanitizePlainText(newStatus, 40);

  if (!cleanId || !ALLOWED_ADOPTION_STATUSES.has(cleanStatus)) {
    throw new Error("Invalid adoption status update");
  }

  await prisma.$transaction(async (tx) => {
    const app = await tx.adoptionApplication.update({
      where: { id: cleanId },
      data: { status: cleanStatus },
    });

    if ((cleanStatus === "Adopted" || cleanStatus === "Approved") && app.animalId) {
      await tx.animal.update({
        where: { id: app.animalId },
        data: { status: "Adopted" },
      });
    }
  });

  await recordAuditLog({
    userId: session.userId,
    action: "UPDATE_ADOPTION_STATUS",
    resource: `adoption:${cleanId}`,
    details: `Status set to ${cleanStatus}`,
  });

  revalidatePath("/admin/adoption");
  revalidatePath("/admin/animals");
  revalidatePath("/animals");
}

export async function approveAdoption(id: string) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);
  const cleanId = sanitizePlainText(id, 80);
  if (!cleanId) throw new Error("Invalid application ID");

  await prisma.$transaction(async (tx) => {
    const app = await tx.adoptionApplication.findUnique({
      where: { id: cleanId },
    });
    if (!app) return;

    await tx.adoptionApplication.update({
      where: { id: cleanId },
      data: { status: "Approved" },
    });

    if (app.animalId) {
      await tx.animal.update({
        where: { id: app.animalId },
        data: { status: "Adopted" },
      });
    }
  });

  await recordAuditLog({
    userId: session.userId,
    action: "APPROVE_ADOPTION",
    resource: `adoption:${cleanId}`,
  });

  revalidatePath("/admin/adoption");
  revalidatePath("/admin/animals");
  revalidatePath("/animals");
}

export async function scheduleAdoptionVisit(id: string) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);
  const cleanId = sanitizePlainText(id, 80);
  if (!cleanId) throw new Error("Invalid application ID");

  await prisma.adoptionApplication.update({
    where: { id: cleanId },
    data: { status: "Interview Scheduled" },
  });

  await recordAuditLog({
    userId: session.userId,
    action: "SCHEDULE_ADOPTION_VISIT",
    resource: `adoption:${cleanId}`,
  });

  revalidatePath("/admin/adoption");
}

export async function rejectAdoption(id: string) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);
  const cleanId = sanitizePlainText(id, 80);
  if (!cleanId) throw new Error("Invalid application ID");

  await prisma.adoptionApplication.update({
    where: { id: cleanId },
    data: { status: "Rejected" },
  });

  await recordAuditLog({
    userId: session.userId,
    action: "REJECT_ADOPTION",
    resource: `adoption:${cleanId}`,
  });

  revalidatePath("/admin/adoption");
}
