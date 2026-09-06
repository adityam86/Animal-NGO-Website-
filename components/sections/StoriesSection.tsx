import Link from "next/link";
import StoryCard from "@/components/shared/StoryCard";
import { STORIES } from "@/lib/data";
import FadeIn from "@/components/motion/FadeIn";

export default function StoriesSection() {
  return (
    <section className="section" style={{ background: "var(--cream-50)" }}>
      <div className="container">
        <FadeIn direction="up" distance={20}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "3rem",
            }}
          >
            <div>
              <div className="section-tag">Stories</div>
              <h2>Lives Transformed</h2>
              <p style={{ marginTop: "0.5rem", maxWidth: 460, color: "var(--stone-600)" }}>
                Every rescue is a story of courage — of the animal&apos;s will to survive and our team&apos;s commitment to help.
              </p>
            </div>
            <Link href="/stories" className="btn btn-outline">
              All Stories →
            </Link>
          </div>
        </FadeIn>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            justifyContent: "center",
          }}
        >
          {STORIES.map((story, idx) => (
            <FadeIn key={story.slug} delay={idx * 0.1} direction="up" distance={20}>
              <StoryCard {...story} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
