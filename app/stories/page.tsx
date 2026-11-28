import type { Metadata } from "next";
import Link from "next/link";
import StoryCard from "@/components/shared/StoryCard";
import prisma from "@/lib/prisma";
import FadeIn from "@/components/motion/FadeIn";

export const dynamic = "force-dynamic";

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

      {/* All Rescue Chronicles */}
      <section className="section" style={{ background: "var(--cream-50)", minHeight: "50vh" }}>
        <div className="container">
          <FadeIn direction="up" distance={15}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", marginBottom: "2.5rem" }}>
              <div>
                <span className="editorial-eyebrow" style={{ marginBottom: "0.75rem" }}>Documented Journeys</span>
                <h2 style={{ margin: 0 }}>All Rescue Chronicles</h2>
              </div>
              <p style={{ color: "var(--stone-500)", fontSize: "0.86rem", margin: 0, maxWidth: "44ch" }}>
                [Admin Note: Additional intake photographs for side-by-side recovery comparisons can be attached directly to sanctuary records.]
              </p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 310px), 1fr))", gap: "1.75rem" }}>
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
            <Link href="/rescue" className="btn btn-primary btn-lg" style={{ borderRadius: "var(--radius-sm)" }}>
              Report an Animal in Need
            </Link>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
