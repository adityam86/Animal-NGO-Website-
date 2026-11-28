"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recordAuditLog, requireAdminSession } from "@/lib/auth-server";
import {
  medicalFundraiserSchema,
  communityDriveSchema,
  galleryPhotoSchema,
} from "@/lib/validation";

export async function createMedicalFundraiserAction(formData: FormData) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);

  const parsed = medicalFundraiserSchema.safeParse({
    title: String(formData.get("title") || ""),
    animalName: String(formData.get("animalName") || ""),
    species: String(formData.get("species") || ""),
    summary: String(formData.get("summary") || ""),
    purpose: String(formData.get("purpose") || "Medical Treatment"),
    goalInr: Number(formData.get("goalInr") || 0),
    image: String(formData.get("image") || "/images/dog_bruno.jpg"),
    animalId: String(formData.get("animalId") || "").trim() || null,
    isActive: true,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid fundraiser details.");
  }

  const d = parsed.data;
  let validAnimalId: string | null = null;
  if (d.animalId) {
    const animal = await prisma.animal.findUnique({ where: { id: d.animalId }, select: { id: true } });
    if (animal) validAnimalId = animal.id;
  }

  const created = await prisma.medicalFundraiser.create({
    data: {
      title: d.title,
      animalName: d.animalName,
      species: d.species,
      summary: d.summary,
      purpose: d.purpose,
      goalInr: d.goalInr,
      image: d.image,
      animalId: validAnimalId,
      isActive: true,
    },
  });

  await recordAuditLog({
    userId: session.userId,
    action: "CREATE_FUNDRAISER",
    resource: `MedicalFundraiser:${created.id}`,
    details: `${created.animalName} — ₹${created.goalInr}`,
  });

  revalidatePath("/donate");
  revalidatePath("/admin/fundraisers");
}

export async function toggleFundraiserActiveAction(id: string, isActive: boolean) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);
  await prisma.medicalFundraiser.update({
    where: { id },
    data: { isActive },
  });
  await recordAuditLog({
    userId: session.userId,
    action: "TOGGLE_FUNDRAISER",
    resource: `MedicalFundraiser:${id}`,
    details: `isActive=${isActive}`,
  });
  revalidatePath("/donate");
  revalidatePath("/admin/fundraisers");
}

export async function deleteFundraiserAction(id: string) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
  await prisma.medicalFundraiser.delete({ where: { id } });
  await recordAuditLog({
    userId: session.userId,
    action: "DELETE_FUNDRAISER",
    resource: `MedicalFundraiser:${id}`,
  });
  revalidatePath("/donate");
  revalidatePath("/admin/fundraisers");
}

export async function createCommunityDriveAction(formData: FormData) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);

  const parsed = communityDriveSchema.safeParse({
    title: String(formData.get("title") || ""),
    driveType: String(formData.get("driveType") || "Anti-Rabies Vaccination"),
    areaWard: String(formData.get("areaWard") || ""),
    date: String(formData.get("date") || ""),
    timeSlot: String(formData.get("timeSlot") || "8:00 AM – 1:00 PM"),
    coordinator: String(formData.get("coordinator") || "Tarasankar Nag"),
    status: "Scheduled",
    notes: String(formData.get("notes") || ""),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid community drive fields.");
  }

  const d = parsed.data;
  const driveDate = new Date(d.date);
  if (Number.isNaN(driveDate.getTime())) {
    throw new Error("Invalid drive date provided.");
  }

  const created = await prisma.communityDrive.create({
    data: {
      title: d.title,
      driveType: d.driveType,
      areaWard: d.areaWard,
      date: driveDate,
      timeSlot: d.timeSlot,
      coordinator: d.coordinator,
      status: d.status,
      notes: d.notes || null,
    },
  });

  await recordAuditLog({
    userId: session.userId,
    action: "CREATE_COMMUNITY_DRIVE",
    resource: `CommunityDrive:${created.id}`,
    details: `${created.title} (${created.areaWard})`,
  });

  revalidatePath("/drives");
  revalidatePath("/admin/drives");
}

export async function updateCommunityDriveStatusAction(id: string, status: string) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);
  if (!["Scheduled", "Ongoing", "Completed", "Cancelled"].includes(status)) {
    throw new Error("Unsupported drive status");
  }
  await prisma.communityDrive.update({
    where: { id },
    data: { status },
  });
  await recordAuditLog({
    userId: session.userId,
    action: "UPDATE_COMMUNITY_DRIVE_STATUS",
    resource: `CommunityDrive:${id}`,
    details: `status=${status}`,
  });
  revalidatePath("/drives");
  revalidatePath("/admin/drives");
}

export async function deleteCommunityDriveAction(id: string) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
  await prisma.communityDrive.delete({ where: { id } });
  await recordAuditLog({
    userId: session.userId,
    action: "DELETE_COMMUNITY_DRIVE",
    resource: `CommunityDrive:${id}`,
  });
  revalidatePath("/drives");
  revalidatePath("/admin/drives");
}

export async function createGalleryPhotoAction(formData: FormData) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);

  const parsed = galleryPhotoSchema.safeParse({
    title: String(formData.get("title") || ""),
    category: String(formData.get("category") || "Rescue"),
    caption: String(formData.get("caption") || ""),
    capturedDate: String(formData.get("capturedDate") || ""),
    imageUrl: String(formData.get("imageUrl") || ""),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid gallery photo fields.");
  }

  const d = parsed.data;
  let capturedDateObj = new Date();
  if (d.capturedDate) {
    const parsedDate = new Date(d.capturedDate);
    if (!Number.isNaN(parsedDate.getTime())) capturedDateObj = parsedDate;
  }

  const created = await prisma.galleryPhoto.create({
    data: {
      title: d.title,
      category: d.category,
      caption: d.caption || null,
      imageUrl: d.imageUrl,
      capturedDate: capturedDateObj,
    },
  });

  await recordAuditLog({
    userId: session.userId,
    action: "CREATE_GALLERY_PHOTO",
    resource: `GalleryPhoto:${created.id}`,
    details: `${created.title} (${created.category})`,
  });

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function deleteGalleryPhotoAction(id: string) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
  await prisma.galleryPhoto.delete({ where: { id } });
  await recordAuditLog({
    userId: session.userId,
    action: "DELETE_GALLERY_PHOTO",
    resource: `GalleryPhoto:${id}`,
  });
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}
