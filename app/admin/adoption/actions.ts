"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAdoptionStatus(id: string, newStatus: string) {
  const app = await prisma.adoptionApplication.update({
    where: { id },
    data: { status: newStatus },
  });

  if (newStatus === "Adopted" || newStatus === "Approved") {
    if (app.animalId) {
      await prisma.animal.update({
        where: { id: app.animalId },
        data: { status: "Adopted" },
      });
    }
  }

  revalidatePath("/admin/adoption");
  revalidatePath("/admin/animals");
  revalidatePath("/animals");
}

export async function approveAdoption(id: string) {
  const app = await prisma.adoptionApplication.findUnique({
    where: { id },
  });

  if (!app) return;

  await prisma.adoptionApplication.update({
    where: { id },
    data: { status: "Approved" },
  });

  if (app.animalId) {
    await prisma.animal.update({
      where: { id: app.animalId },
      data: { status: "Adopted" },
    });
  }

  revalidatePath("/admin/adoption");
  revalidatePath("/admin/animals");
  revalidatePath("/animals");
}

export async function scheduleAdoptionVisit(id: string) {
  await prisma.adoptionApplication.update({
    where: { id },
    data: { status: "Interview Scheduled" },
  });

  revalidatePath("/admin/adoption");
}

export async function rejectAdoption(id: string) {
  await prisma.adoptionApplication.update({
    where: { id },
    data: { status: "Rejected" },
  });

  revalidatePath("/admin/adoption");
}
