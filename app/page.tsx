import HeroSection from "@/components/sections/HeroSection";
import MissionSection from "@/components/sections/MissionSection";
import RescueInActionSection from "@/components/sections/RescueInActionSection";
import WhatWeDo from "@/components/sections/WhatWeDo";
import StoriesSection, { type HomeStoryItem } from "@/components/sections/StoriesSection";
import HowYouCanHelpSection from "@/components/sections/HowYouCanHelpSection";
import ImpactStats, { type VerifiedImpactData } from "@/components/sections/ImpactStats";
import AnimalsSection, { type HomeAnimalItem } from "@/components/sections/AnimalsSection";
import SanctuaryContactSection from "@/components/sections/SanctuaryContactSection";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatEditorialDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export default async function HomePage() {
  let verifiedStats: VerifiedImpactData = {
    totalAnimalsRecorded: 0,
    animalsAdopted: 0,
    rescueReportsLogged: 0,
    activeVolunteers: 0,
    sheltersOperating: 0,
    storiesPublished: 0,
  };
  let stories: HomeStoryItem[] = [];
  let adoptableAnimals: HomeAnimalItem[] = [];

  try {
    const [
      totalAnimalsRecorded,
      animalsAdopted,
      rescueReportsLogged,
      activeVolunteers,
      sheltersOperating,
      storiesPublished,
      rawStories,
      rawAnimals,
    ] = await Promise.all([
      prisma.animal.count(),
      prisma.animal.count({ where: { status: "Adopted" } }),
      prisma.rescueCase.count(),
      prisma.volunteer.count(),
      prisma.shelterLocation.count(),
      prisma.story.count(),
      prisma.story.findMany({
        orderBy: { date: "desc" },
        take: 4,
      }),
      prisma.animal.findMany({
        where: { status: "Available for Adoption" },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    verifiedStats = {
      totalAnimalsRecorded,
      animalsAdopted,
      rescueReportsLogged,
      activeVolunteers,
      sheltersOperating,
      storiesPublished,
    };

    stories = rawStories.map((s) => ({
      slug: s.slug,
      title: s.title,
      subtitle: s.subtitle,
      animal: s.animal,
      animalType: s.animalType,
      date: formatEditorialDate(s.date),
      readTime: s.readTime,
      coverImage: s.coverImage,
      outcome: s.outcome,
      excerpt: s.excerpt,
    }));

    adoptableAnimals = rawAnimals.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      breed: a.breed,
      gender: a.gender,
      age: a.age,
      image: a.image,
      status: a.status,
      vaccinated: a.vaccinated,
      sterilized: a.sterilized,
      location: a.location,
    }));
  } catch (err) {
    console.error("Failed to fetch homepage editorial records from PostgreSQL:", err);
  }

  return (
    <main>
      {/* A. Hero — Every street life deserves a second chance */}
      <HeroSection />

      {/* B. Our Mission — Authentic organizational charter & story */}
      <MissionSection />

      {/* C. Rescue in Action — Emergency field protocol & documentary photography */}
      <RescueInActionSection loggedReportsCount={verifiedStats.rescueReportsLogged} />

      {/* D. What We Do — Core frontline welfare pillars */}
      <WhatWeDo />

      {/* E. Rescue Stories — Verified animal recovery chronicles */}
      <StoriesSection stories={stories} />

      {/* F. How You Can Help — Donate, volunteer, adopt, report */}
      <HowYouCanHelpSection />

      {/* G. Our Impact — Verified database records & statutory ledger */}
      <ImpactStats stats={verifiedStats} />

      {/* H. Adoption — Live residents currently ready for homes */}
      <AnimalsSection animals={adoptableAnimals} />

      {/* I. Sanctuary Contact Prelude */}
      <SanctuaryContactSection />
    </main>
  );
}
