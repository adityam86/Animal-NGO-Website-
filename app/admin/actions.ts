"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateRescueStatus(rescueId: string, newStatus: string) {
  // Check if status is already in history to avoid duplicates
  const rescue = await prisma.rescueCase.findUnique({
    where: { id: rescueId },
    include: { history: true }
  });

  if (!rescue) throw new Error("Rescue not found");

  const existingStatus = rescue.history.find(h => h.status === newStatus);

  if (existingStatus) {
    // If we're marking an old status as done
    await prisma.rescueCaseStatus.update({
      where: { id: existingStatus.id },
      data: { 
        done: true, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    });
  } else {
    // Add new status
    await prisma.rescueCaseStatus.create({
      data: {
        rescueCaseId: rescueId,
        status: newStatus,
        done: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });
  }

  // Update the main case status
  await prisma.rescueCase.update({
    where: { id: rescueId },
    data: { status: newStatus }
  });

  revalidatePath("/admin/rescues");
  revalidatePath(`/rescue/track`);
}

export async function deleteAnimal(id: string) {
  await prisma.animal.delete({
    where: { id }
  });
  revalidatePath("/admin/animals");
  revalidatePath("/animals");
}

export async function updateVolunteerStatus(id: string, status: string) {
  await prisma.volunteer.update({
    where: { id },
    data: { status }
  });
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

  revalidatePath("/admin/animals");
  revalidatePath("/animals");
  revalidatePath("/adoption");
}

