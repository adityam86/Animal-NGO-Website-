import { PrismaClient } from "@prisma/client";
import { ANIMALS, RESCUE_CASES, STORIES } from "../lib/data";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 0. Seed Admin User from explicit environment variables only (never hardcoded)
  const adminEmail = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  const adminName = process.env.ADMIN_SEED_NAME?.trim() || "Ayudar Super Admin";

  if (adminEmail && adminPassword && adminPassword.length >= 8) {
    const passwordHash = await hashPassword(adminPassword);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: adminName,
        role: "SUPER_ADMIN",
        isActive: true,
        passwordHash,
      },
      create: {
        email: adminEmail,
        name: adminName,
        role: "SUPER_ADMIN",
        isActive: true,
        passwordHash,
      },
    });
    console.log(`Admin account ensured for ${adminEmail}.`);
  } else {
    console.log(
      "Skipping admin user seed: set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD (>=8 chars) to bootstrap."
    );
  }

  // 1. Seed Default Shelter Locations idempotently
  const defaultShelters = [
    {
      name: "Ayudar Main Shelter",
      address: "Raniganj Animal Care Campus, NH-19 Service Road, Raniganj, WB",
      capacity: 65,
      type: "Dog & Cat Sanctuary",
    },
    {
      name: "Ayudar Gaushala Sanctuary",
      address: "Green Pasture Gaushala Campus, Searsole, Raniganj, WB",
      capacity: 80,
      type: "Cattle & Gaushala",
    },
    {
      name: "Ayudar Cat & Small Care Unit",
      address: "Medical Recovery Wing, Raniganj, WB",
      capacity: 30,
      type: "Intensive Care & Small Animals",
    },
  ];

  const existingShelters = await prisma.shelterLocation.findMany();
  if (existingShelters.length === 0) {
    for (const s of defaultShelters) {
      await prisma.shelterLocation.create({ data: s });
    }
    console.log("Default shelters seeded.");
  }

  // 2. Seed Animals
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

  // 3. Seed Rescue Cases
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
          create: rc.statusHistory.map((sh, index) => ({
            status: sh.status,
            time: sh.time || null,
            done: sh.done,
            sortOrder: index,
          })),
        },
      },
    });
  }
  console.log("Rescue cases seeded.");

  // 4. Seed Stories
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
          create: story.phases.map((p, index) => ({
            phase: p.phase,
            title: p.title,
            description: p.description,
            sortOrder: index,
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
