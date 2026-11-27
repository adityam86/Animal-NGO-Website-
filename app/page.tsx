import prisma from "@/lib/prisma";
import { IMPACT_STATS } from "@/lib/data";
import HeroSection from "@/components/sections/HeroSection";
import UrgentCasesStrip from "@/components/sections/UrgentCasesStrip";
import BeforeAfterSection from "@/components/sections/BeforeAfterSection";
import ImpactStats from "@/components/sections/ImpactStats";
import AnimalsSection from "@/components/sections/AnimalsSection";
import DonateCTA from "@/components/sections/DonateCTA";
import CowCareSection from "@/components/sections/CowCareSection";
import VolunteerCTA from "@/components/sections/VolunteerCTA";

export const dynamic = "force-dynamic";

async function getLiveImpactStats() {
  try {
    const [animalsCount, adoptionsCompleted, volunteersCount, cattleAndResidentsCount] = await Promise.all([
      prisma.animal.count(),
      prisma.animal.count({ where: { status: "Adopted" } }),
      prisma.volunteer.count({ where: { status: { in: ["Approved", "Active"] } } }),
      prisma.animal.count({ where: { status: { not: "Adopted" } } }),
    ]);

    return [
      { value: Math.max(animalsCount, IMPACT_STATS[0].value), suffix: "+", label: "Animals Rescued" },
      { value: Math.max(IMPACT_STATS[1].value, 980), suffix: "+", label: "Sterilizations & Care" },
      { value: Math.max(adoptionsCompleted, IMPACT_STATS[2].value), suffix: "+", label: "Happy Adoptions" },
      { value: Math.max(cattleAndResidentsCount, volunteersCount, 120), suffix: "+", label: "Active Shelter Residents" },
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
      <UrgentCasesStrip />
      <BeforeAfterSection />
      <ImpactStats stats={stats} />
      <AnimalsSection />
      <DonateCTA />
      <CowCareSection />
      <VolunteerCTA />
    </>
  );
}
