import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import FadeIn from "@/components/motion/FadeIn";
import HoverCard from "@/components/motion/HoverCard";
import BeforeAfterSlider from "@/components/shared/BeforeAfterSlider";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await prisma.story.findUnique({ where: { slug } });
  if (!story) return { title: "Story Not Found" };
  return { title: `${story.title} | Ayudar Stories`, description: story.excerpt };
}

const phaseColors: Record<string, { bg: string; color: string }> = {
  Before: { bg: "hsl(0,75%,96%)", color: "hsl(0,65%,40%)" },
  Rescue: { bg: "hsl(28,88%,96%)", color: "hsl(28,80%,40%)" },
  Treatment: { bg: "hsl(210,80%,96%)", color: "hsl(210,65%,40%)" },
  Recovery: { bg: "hsl(142,55%,96%)", color: "hsl(142,55%,35%)" },
  After: { bg: "hsl(35,90%,96%)", color: "hsl(35,80%,40%)" },
};

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await prisma.story.findUnique({
    where: { slug },
    include: { phases: true },
  });
  if (!story) notFound();

  return (
    <main style={{ paddingTop: "68px" }}>
      {/* Hero Banner */}
      <section style={{ position: "relative", height: 500, overflow: "hidden" }}>
        <Image src={story.coverImage} alt={story.title} fill style={{ objectFit: "cover" }} priority />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
          }}
        />
        <div className="container" style={{ position: "absolute", bottom: "3rem", left: 0, right: 0 }}>
          <FadeIn direction="up" distance={20}>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", marginBottom: "1rem" }}>
              <span className="badge badge-saffron">{story.animalType}</span>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.3rem 0.9rem",
                  background: "var(--green-500)",
                  color: "white",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {story.outcome}
              </div>
            </div>
            <h1 style={{ color: "white", maxWidth: 700, marginBottom: "0.5rem", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              {story.title}
            </h1>
            <p style={{ color: "hsla(0,0%,100%,0.85)", fontSize: "1.1rem", maxWidth: 640 }}>{story.subtitle}</p>
          </FadeIn>
        </div>
      </section>

      {/* Excerpt */}
      <section style={{ background: "white", paddingBlock: "3.5rem" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <FadeIn direction="up" distance={15}>
            <p
              style={{
                fontSize: "1.2rem",
                lineHeight: 1.9,
                color: "var(--stone-700)",
                fontStyle: "italic",
                borderLeft: "4px solid var(--saffron-400)",
                paddingLeft: "1.75rem",
                margin: 0,
              }}
            >
              &ldquo;{story.excerpt}&rdquo;
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Before & After Interactive Transformation */}
      <section style={{ background: "var(--cream-100)", paddingBlock: "3.5rem", borderTop: "1px solid var(--cream-200)", borderBottom: "1px solid var(--cream-200)" }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <FadeIn direction="up" distance={20}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div className="section-tag" style={{ background: "var(--saffron-100)", color: "var(--saffron-800)" }}>
                Interactive Transformation
              </div>
              <h2 style={{ fontSize: "1.75rem" }}>Visual Healing Journey</h2>
              <p style={{ color: "var(--stone-600)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
                Drag the slider handle sideways to witness {story.animal}&apos;s miraculous change.
              </p>
            </div>

            <BeforeAfterSlider
              beforeImage={
                story.slug === "lakshmi-the-highway-cow"
                  ? "/images/cow_care_banner.jpg"
                  : "/images/rescue_story_banner.jpg"
              }
              afterImage={
                story.slug === "lakshmi-the-highway-cow"
                  ? "/images/cow_lakshmi.jpg"
                  : story.slug === "bruno-from-streets-to-sofa"
                  ? "/images/dog_bruno.jpg"
                  : story.coverImage
              }
              beforeLabel="Day 1 (Rescue)"
              afterLabel={`Recovered ${story.animal}`}
              aspectRatio="16/9"
              initialPosition={50}
            />
          </FadeIn>
        </div>
      </section>

      {/* Timeline phases */}
      <section className="section" style={{ background: "var(--cream-50)" }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <FadeIn direction="up" distance={20}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div className="section-tag">The Journey</div>
              <h2>From Rescue to Recovery</h2>
            </div>
          </FadeIn>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {story.phases.map((phase, i) => {
              const colors = phaseColors[phase.phase] || { bg: "var(--cream-100)", color: "var(--stone-600)" };
              return (
                <FadeIn key={phase.phase} delay={i * 0.1} direction="up" distance={20}>
                  <HoverCard lift={4} scale={1.01}>
                    <div
                      style={{
                        display: "flex",
                        gap: "2rem",
                        alignItems: "flex-start",
                        background: "white",
                        borderRadius: "var(--radius-xl)",
                        padding: "2rem",
                        border: "1px solid var(--cream-200)",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                      }}
                    >
                      {/* Phase badge */}
                      <div style={{ flexShrink: 0, textAlign: "center" }}>
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            background: colors.bg,
                            color: colors.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "0.75rem",
                            letterSpacing: "0.04em",
                            border: `2px solid ${colors.color}44`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          {phase.phase.toUpperCase()}
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", color: "var(--stone-800)" }}>{phase.title}</h3>
                        <p style={{ lineHeight: 1.85, color: "var(--stone-600)", fontSize: "0.95rem", margin: 0 }}>{phase.description}</p>
                      </div>
                    </div>
                  </HoverCard>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--saffron-50)", paddingBlock: "4rem", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: 540 }}>
          <FadeIn direction="up" distance={20}>
            <h2 style={{ marginBottom: "0.75rem" }}>Help Us Write More Stories Like This</h2>
            <p style={{ marginBottom: "2rem", color: "var(--stone-600)", lineHeight: 1.75 }}>
              Every donation funds critical rescues exactly like {story.animal}&apos;s. Every volunteer makes our team stronger. Every adoption gives another animal their happy ending.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/donate" className="btn btn-primary btn-lg">
                ❤️ Donate Now
              </Link>
              <Link href="/rescue" className="btn btn-outline btn-lg">
                🚨 Report an Animal
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Back button */}
      <div className="container" style={{ paddingBlock: "2rem" }}>
        <Link
          href="/stories"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--saffron-600)",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          <ArrowLeft size={16} /> Back to All Stories
        </Link>
      </div>
    </main>
  );
}
