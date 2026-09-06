import type { Metadata } from "next";
import Link from "next/link";
import StoryCard from "@/components/shared/StoryCard";
import BeforeAfterSlider from "@/components/shared/BeforeAfterSlider";
import prisma from "@/lib/prisma";
import FadeIn from "@/components/motion/FadeIn";

export const metadata: Metadata = {
  title: "Rescue Stories | Ayudar",
  description: "Read inspiring rescue stories from Ayudar Animal Welfare Foundation — before, rescue, treatment, recovery, after.",
};

export default async function StoriesPage() {
  const stories = await prisma.story.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <main style={{ paddingTop: "68px" }}>
      {/* Header */}
      <section style={{ background: "var(--stone-800)", paddingBlock: "4.5rem 3.5rem", textAlign: "center" }}>
        <div className="container">
          <FadeIn direction="up" distance={20}>
            <div className="section-tag" style={{ background: "hsla(26,88%,50%,0.2)", color: "var(--saffron-300)" }}>
              Stories of Hope
            </div>
            <h1 style={{ color: "white", marginBottom: "0.75rem" }}>Every Rescue is a Story</h1>
            <p style={{ color: "hsla(0,0%,100%,0.75)", maxWidth: 540, marginInline: "auto", fontSize: "1.05rem", lineHeight: 1.7 }}>
              These are the animals we&apos;ve helped — their journeys from pain to hope, from the street to a loving forever home.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Featured Transformation Spotlight */}
      <section style={{ background: "white", paddingBlock: "4rem 2rem", borderBottom: "1px solid var(--cream-200)" }}>
        <div className="container" style={{ maxWidth: 840 }}>
          <FadeIn direction="up" distance={20}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div className="section-tag" style={{ background: "var(--saffron-100)", color: "var(--saffron-800)" }}>
                Transformation Spotlight
              </div>
              <h2>Witness the Power of Care</h2>
              <p style={{ color: "var(--stone-600)", maxWidth: 520, marginInline: "auto", marginTop: "0.5rem" }}>
                Drag the interactive slider below to see Bruno&apos;s recovery journey from critical street accident to a playful companion.
              </p>
            </div>

            <BeforeAfterSlider
              beforeImage="/images/rescue_story_banner.jpg"
              afterImage="/images/dog_bruno.jpg"
              beforeLabel="Day 1: Injured & Shocked"
              afterLabel="Day 45: Healed & Thriving"
              aspectRatio="16/9"
              initialPosition={50}
            />
          </FadeIn>
        </div>
      </section>

      {/* Stories grid */}
      <section className="section" style={{ background: "var(--cream-50)", minHeight: "50vh" }}>
        <div className="container">
          <FadeIn direction="up" distance={15}>
            <h2 style={{ textAlign: "center", marginBottom: "2.5rem" }}>All Rescue Chronicles</h2>
          </FadeIn>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.75rem", justifyContent: "center" }}>
            {stories.map((story, idx) => (
              <FadeIn key={story.slug} delay={idx * 0.08} direction="up" distance={20}>
                <StoryCard {...story} date={story.date.toISOString().split("T")[0]} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Share CTA */}
      <section style={{ background: "var(--saffron-50)", paddingBlock: "3.5rem", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: 540 }}>
          <FadeIn direction="up" distance={20}>
            <h2 style={{ marginBottom: "0.75rem" }}>Share These Stories</h2>
            <p style={{ marginBottom: "2rem", color: "var(--stone-600)", lineHeight: 1.7 }}>
              Every share brings us closer to more volunteers, donors, and adopters. Help us reach more caring people.
            </p>
            <Link href="/rescue" className="btn btn-primary btn-lg">
              🚨 Report an Animal in Need
            </Link>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
