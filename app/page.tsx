import HeroSection from "@/components/sections/HeroSection";
import ImpactStats from "@/components/sections/ImpactStats";
import WhatWeDo from "@/components/sections/WhatWeDo";
import EmergencyRescueBanner from "@/components/sections/EmergencyRescueBanner";
import AnimalsSection from "@/components/sections/AnimalsSection";
import StoriesSection from "@/components/sections/StoriesSection";
import CowCareSection from "@/components/sections/CowCareSection";
import DonateCTA from "@/components/sections/DonateCTA";
import VolunteerCTA from "@/components/sections/VolunteerCTA";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ImpactStats />
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
