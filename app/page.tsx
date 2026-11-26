import prisma from "@/lib/prisma";
import { IMPACT_STATS } from "@/lib/data";
import HeroSection from "@/components/sections/HeroSection";
import ImpactStats from "@/components/sections/ImpactStats";
import WhatWeDo from "@/components/sections/WhatWeDo";
import EmergencyRescueBanner from "@/components/sections/EmergencyRescueBanner";
import AnimalsSection from "@/components/sections/AnimalsSection";
import StoriesSection from "@/components/sections/StoriesSection";
import CowCareSection from "@/components/sections/CowCareSection";
import DonateCTA from "@/components/sections/DonateCTA";
import VolunteerCTA from "@/components/sections/VolunteerCTA";

export const dynamic = "force-dynamic";

async function getLiveImpactStats() {
  try {
    const [animalsCount, adoptionsCompleted, volunteersCount, cowsCount] = await Promise.all([
      prisma.animal.count(),
      prisma.animal.count({ where: { status: "Adopted" } }),
      prisma.volunteer.count({ where: { status: { in: ["Approved", "Active"] } } }),
      prisma.animal.count({ where: { type: { in: ["Cow", "Calf", "Bull", "Buffalo"] } } }),
    ]);

    return [
      { value: Math.max(animalsCount, IMPACT_STATS[0].value), suffix: "+", label: "Animals Rescued" },
      { value: Math.max(adoptionsCompleted, IMPACT_STATS[1].value), suffix: "+", label: "Adopted Homes" },
      { value: Math.max(cowsCount, IMPACT_STATS[2].value), suffix: "+", label: "Cows in Shelter" },
      { value: Math.max(volunteersCount, IMPACT_STATS[3].value), suffix: "+", label: "Volunteers" },
    ];
  } catch {
    return IMPACT_STATS;
  }
}

export default async function HomePage() {
  const stats = await getLiveImpactStats();

  return (
    <>
      <HeroSection />
      <ImpactStats stats={stats} />
      <WhatWeDo />
      <EmergencyRescueBanner />
      <AnimalsSection />
      <StoriesSection />
      <CowCareSection />
      <DonateCTA />
      <VolunteerCTA />
    </>
  );
}
