import { PrismaClient } from "@prisma/client";
import { ANIMALS, RESCUE_CASES, STORIES } from "../lib/data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Seed Animals
  for (const animal of ANIMALS) {
    await prisma.animal.upsert({
      where: { id: animal.id },
      update: {},
      create: {
        id: animal.id,
        name: animal.name,
        type: animal.type,
        breed: animal.breed,
        gender: animal.gender,
        age: animal.age,
        color: animal.color,
        location: animal.location,
        status: animal.status,
        image: animal.image,
        vaccinated: animal.vaccinated,
        dewormed: animal.dewormed,
        sterilized: animal.sterilized,
        rescueDate: new Date(animal.rescueDate),
        shelter: animal.shelter,
        story: animal.story,
      },
    });
  }
  console.log("Animals seeded.");

  // 2. Seed Rescue Cases
  for (const rc of RESCUE_CASES) {
    await prisma.rescueCase.upsert({
      where: { id: rc.id },
      update: {},
      create: {
        id: rc.id,
        animalType: rc.animalType,
        emergencyLevel: rc.emergencyLevel,
        location: rc.location,
        reporterName: rc.reporterName,
        reporterPhone: rc.reporterPhone,
        assignedTeam: rc.assignedTeam,
        status: rc.status,
        reportedAt: new Date(rc.reportedAt),
        description: rc.description,
        history: {
          create: rc.statusHistory.map((sh) => ({
            status: sh.status,
            time: sh.time || null,
            done: sh.done,
          })),
        },
      },
    });
  }
  console.log("Rescue cases seeded.");

  // 3. Seed Stories
  for (const story of STORIES) {
    await prisma.story.upsert({
      where: { slug: story.slug },
      update: {},
      create: {
        slug: story.slug,
        title: story.title,
        subtitle: story.subtitle,
        animal: story.animal,
        animalType: story.animalType,
        date: new Date(story.date),
        readTime: story.readTime,
        coverImage: story.coverImage,
        outcome: story.outcome,
        excerpt: story.excerpt,
        phases: {
          create: story.phases.map((p) => ({
            phase: p.phase,
            title: p.title,
            description: p.description,
          })),
        },
      },
    });
  }
  console.log("Stories seeded.");

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
