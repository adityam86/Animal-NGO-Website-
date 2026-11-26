"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recordAuditLog, requireAdminSession } from "@/lib/auth-server";
import { sanitizePlainText } from "@/lib/security";
import { animalFormSchema } from "@/lib/validation";

const STANDARD_RESCUE_TIMELINE = [
  "Reported",
  "Assigned",
  "On The Way",
  "Rescued",
  "Treatment",
  "Closed",
] as const;

const ALLOWED_VOLUNTEER_STATUSES = new Set([
  "Pending Review",
  "Approved",
  "Active",
  "Inactive",
  "Declined",
]);

export async function updateRescueStatus(rescueId: string, newStatus: string) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);
  const cleanId = sanitizePlainText(rescueId, 80);
  const cleanStatus = sanitizePlainText(newStatus, 40);

  if (!cleanId || !cleanStatus) {
    throw new Error("Invalid rescue status parameters");
  }

  const nowTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const targetIdx = STANDARD_RESCUE_TIMELINE.indexOf(
    cleanStatus as (typeof STANDARD_RESCUE_TIMELINE)[number]
  );

  await prisma.$transaction(async (tx) => {
    const rescue = await tx.rescueCase.findUnique({
      where: { id: cleanId },
      include: { history: true },
    });

    if (!rescue) {
      throw new Error("Rescue case not found");
    }

    if (targetIdx >= 0) {
      for (const h of rescue.history) {
        const idx = STANDARD_RESCUE_TIMELINE.indexOf(
          h.status as (typeof STANDARD_RESCUE_TIMELINE)[number]
        );
        if (idx >= 0) {
          const shouldBeDone = idx <= targetIdx;
          await tx.rescueCaseStatus.update({
            where: { id: h.id },
            data: {
              done: shouldBeDone,
              time: shouldBeDone ? h.time || nowTime : null,
              sortOrder: idx,
            },
          });
        }
      }

      const hasStep = rescue.history.some((h) => h.status === cleanStatus);
      if (!hasStep) {
        await tx.rescueCaseStatus.create({
          data: {
            rescueCaseId: cleanId,
            status: cleanStatus,
            done: true,
            time: nowTime,
            sortOrder: targetIdx,
          },
        });
      }
    } else {
      const existingStatus = rescue.history.find((h) => h.status === cleanStatus);
      if (existingStatus) {
        await tx.rescueCaseStatus.update({
          where: { id: existingStatus.id },
          data: { done: true, time: nowTime },
        });
      } else {
        await tx.rescueCaseStatus.create({
          data: {
            rescueCaseId: cleanId,
            status: cleanStatus,
            done: true,
            time: nowTime,
            sortOrder: rescue.history.length,
          },
        });
      }
    }

    await tx.rescueCase.update({
      where: { id: cleanId },
      data: { status: cleanStatus },
    });
  });

  await recordAuditLog({
    userId: session.userId,
    action: "UPDATE_RESCUE_STATUS",
    resource: `rescue:${cleanId}`,
    details: `Status set to ${cleanStatus}`,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/rescues");
  revalidatePath("/rescue/track");
}

export async function deleteAnimal(id: string) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
  const cleanId = sanitizePlainText(id, 80);
  if (!cleanId) throw new Error("Invalid animal ID");

  await prisma.animal.delete({
    where: { id: cleanId },
  });

  await recordAuditLog({
    userId: session.userId,
    action: "DELETE_ANIMAL",
    resource: `animal:${cleanId}`,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/animals");
  revalidatePath("/animals");
}

export async function updateVolunteerStatus(id: string, status: string) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);
  const cleanId = sanitizePlainText(id, 80);
  const cleanStatus = sanitizePlainText(status, 40);

  if (!cleanId || !ALLOWED_VOLUNTEER_STATUSES.has(cleanStatus)) {
    throw new Error("Invalid volunteer status update");
  }

  await prisma.volunteer.update({
    where: { id: cleanId },
    data: { status: cleanStatus },
  });

  await recordAuditLog({
    userId: session.userId,
    action: "UPDATE_VOLUNTEER_STATUS",
    resource: `volunteer:${cleanId}`,
    details: `Status set to ${cleanStatus}`,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/volunteers");
}

export async function createAnimal(formData: FormData) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);

  const parsed = animalFormSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    breed: formData.get("breed"),
    gender: formData.get("gender"),
    age: formData.get("age"),
    color: formData.get("color"),
    location: formData.get("location"),
    status: formData.get("status"),
    image: String(formData.get("image") || "").trim(),
    vaccinated: formData.get("vaccinated") === "on",
    dewormed: formData.get("dewormed") === "on",
    sterilized: formData.get("sterilized") === "on",
    rescueDate: formData.get("rescueDate") ? String(formData.get("rescueDate")) : undefined,
    shelter: formData.get("shelter") || "Ayudar Main Shelter",
    story: formData.get("story") || "Rescued by the Ayudar field unit.",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid animal profile details");
  }

  const d = parsed.data;
  const created = await prisma.animal.create({
    data: {
      name: d.name,
      type: d.type,
      breed: d.breed,
      gender: d.gender,
      age: d.age,
      color: d.color,
      location: d.location,
      status: d.status,
      image: d.image || "/images/dog_bruno.jpg",
      vaccinated: d.vaccinated,
      dewormed: d.dewormed,
      sterilized: d.sterilized,
      rescueDate: d.rescueDate ? new Date(d.rescueDate) : new Date(),
      shelter: d.shelter,
      story: d.story,
    },
  });

  await recordAuditLog({
    userId: session.userId,
    action: "CREATE_ANIMAL",
    resource: `animal:${created.id}`,
    details: `Created profile for ${created.name} (${created.type})`,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/animals");
  revalidatePath("/animals");
  revalidatePath("/adoption");
}

export async function createStory(formData: FormData) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);

  const title = sanitizePlainText(formData.get("title"), 160);
  const subtitle = sanitizePlainText(formData.get("subtitle"), 240);
  const animal = sanitizePlainText(formData.get("animal"), 80);
  const animalType = sanitizePlainText(formData.get("animalType") || "Dog", 40);
  const outcome = sanitizePlainText(formData.get("outcome") || "Recovered & Thriving", 120);
  const excerpt = sanitizePlainText(formData.get("excerpt"), 1500);
  const readTime = sanitizePlainText(formData.get("readTime") || "3 min read", 40);
  const rawCover = String(formData.get("coverImage") || "").trim();
  const coverImage =
    rawCover &&
    (rawCover.startsWith("/images/") ||
      rawCover.startsWith("/uploads/") ||
      rawCover.startsWith("https://") ||
      rawCover.startsWith("data:image/"))
      ? rawCover
      : "/images/rescue_story_banner.jpg";

  if (!title || !animal || !excerpt) {
    throw new Error("Missing required story fields");
  }

  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const slug = `${baseSlug || "story"}-${Date.now().toString(36).slice(-4)}`;

  const phaseDefs = [
    { key: "phase_before", phase: "Before", title: "Before Rescue" },
    { key: "phase_rescue", phase: "Rescue", title: "Emergency Rescue" },
    { key: "phase_treatment", phase: "Treatment", title: "Medical Care" },
    { key: "phase_recovery", phase: "Recovery", title: "Healing & Recovery" },
    { key: "phase_after", phase: "After", title: "New Beginning" },
  ];

  const phases = phaseDefs
    .map((p, index) => ({
      phase: p.phase,
      title: p.title,
      description: sanitizePlainText(formData.get(p.key), 1500),
      sortOrder: index,
    }))
    .filter((p) => p.description.length > 0);

  const created = await prisma.story.create({
    data: {
      slug,
      title,
      subtitle: subtitle || `${animal}'s journey from rescue to recovery`,
      animal,
      animalType,
      date: new Date(),
      readTime,
      coverImage,
      outcome,
      excerpt,
      phases: {
        create:
          phases.length > 0
            ? phases
            : [{ phase: "Rescue", title: "Rescue & Care", description: excerpt, sortOrder: 0 }],
      },
    },
  });

  await recordAuditLog({
    userId: session.userId,
    action: "CREATE_STORY",
    resource: `story:${created.slug}`,
    details: `Published story: ${created.title}`,
  });

  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}

export async function deleteStory(slug: string) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
  const cleanSlug = sanitizePlainText(slug, 180);
  if (!cleanSlug) throw new Error("Invalid story slug");

  await prisma.story.delete({
    where: { slug: cleanSlug },
  });

  await recordAuditLog({
    userId: session.userId,
    action: "DELETE_STORY",
    resource: `story:${cleanSlug}`,
  });

  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}
