"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const STANDARD_RESCUE_TIMELINE = [
  "Reported",
  "Assigned",
  "On The Way",
  "Rescued",
  "Treatment",
  "Closed",
];

export async function updateRescueStatus(rescueId: string, newStatus: string) {
  const rescue = await prisma.rescueCase.findUnique({
    where: { id: rescueId },
    include: { history: true },
  });

  if (!rescue) throw new Error("Rescue not found");

  const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const targetIdx = STANDARD_RESCUE_TIMELINE.indexOf(newStatus);

  if (targetIdx >= 0) {
    // Update all timeline stages up to and including targetIdx
    for (let i = 0; i < rescue.history.length; i++) {
      const h = rescue.history[i];
      const idx = STANDARD_RESCUE_TIMELINE.indexOf(h.status);
      if (idx >= 0) {
        const shouldBeDone = idx <= targetIdx;
        await prisma.rescueCaseStatus.update({
          where: { id: h.id },
          data: {
            done: shouldBeDone,
            time: shouldBeDone ? h.time || nowTime : null,
          },
        });
      }
    }

    // Create step if missing from history
    const hasStep = rescue.history.some((h) => h.status === newStatus);
    if (!hasStep) {
      await prisma.rescueCaseStatus.create({
        data: {
          rescueCaseId: rescueId,
          status: newStatus,
          done: true,
          time: nowTime,
        },
      });
    }
  } else {
    const existingStatus = rescue.history.find((h) => h.status === newStatus);
    if (existingStatus) {
      await prisma.rescueCaseStatus.update({
        where: { id: existingStatus.id },
        data: { done: true, time: nowTime },
      });
    } else {
      await prisma.rescueCaseStatus.create({
        data: {
          rescueCaseId: rescueId,
          status: newStatus,
          done: true,
          time: nowTime,
        },
      });
    }
  }

  await prisma.rescueCase.update({
    where: { id: rescueId },
    data: { status: newStatus },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/rescues");
  revalidatePath("/rescue/track");
}

export async function deleteAnimal(id: string) {
  await prisma.animal.delete({
    where: { id },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/animals");
  revalidatePath("/animals");
}

export async function updateVolunteerStatus(id: string, status: string) {
  await prisma.volunteer.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/volunteers");
}

export async function createAnimal(formData: FormData) {
  const rescueDateStr = formData.get("rescueDate") as string;
  await prisma.animal.create({
    data: {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      breed: formData.get("breed") as string,
      gender: formData.get("gender") as string,
      age: formData.get("age") as string,
      color: formData.get("color") as string,
      location: formData.get("location") as string,
      status: formData.get("status") as string,
      image: (formData.get("image") as string) || "/images/dog_bruno.jpg",
      vaccinated: formData.get("vaccinated") === "on",
      dewormed: formData.get("dewormed") === "on",
      sterilized: formData.get("sterilized") === "on",
      rescueDate: rescueDateStr ? new Date(rescueDateStr) : new Date(),
      shelter: (formData.get("shelter") as string) || "Ayudar Main Shelter",
      story: (formData.get("story") as string) || "",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/animals");
  revalidatePath("/animals");
  revalidatePath("/adoption");
}

export async function createStory(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim();
  const animal = String(formData.get("animal") || "").trim();
  const animalType = String(formData.get("animalType") || "Dog").trim();
  const outcome = String(formData.get("outcome") || "Recovered & Thriving").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const readTime = String(formData.get("readTime") || "3 min read").trim();
  const coverImage = String(formData.get("coverImage") || "").trim() || "/images/rescue_story_banner.jpg";

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
    .map((p) => ({
      phase: p.phase,
      title: p.title,
      description: String(formData.get(p.key) || "").trim(),
    }))
    .filter((p) => p.description.length > 0);

  await prisma.story.create({
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
        create: phases.length > 0 ? phases : [{ phase: "Rescue", title: "Rescue & Care", description: excerpt }],
      },
    },
  });

  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}

export async function deleteStory(slug: string) {
  await prisma.story.delete({
    where: { slug },
  });
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}
