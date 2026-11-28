"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import StoryCard from "@/components/shared/StoryCard";
import { shouldBypassImageOptimization } from "@/lib/image-url";

export interface HomeStoryItem {
  slug: string;
  title: string;
  subtitle: string;
  animal: string;
  animalType: string;
  date: string;
  readTime: string;
  coverImage: string;
  outcome: string;
  excerpt: string;
}

interface StoriesSectionProps {
  stories: HomeStoryItem[];
}

export default function StoriesSection({ stories }: StoriesSectionProps) {
  const leadStory = stories[0] ?? null;
  const secondaryStories = stories.slice(1, 4);

  return (
    <section
      className="section"
      aria-labelledby="stories-heading"
      style={{
        background: "var(--cream-50)",
        borderBottom: "1px solid var(--cream-200)",
      }}
    >
      <div className="container">
        <FadeIn direction="up" distance={12}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "1.5rem",
              marginBottom: "clamp(2.25rem, 4vw, 3.25rem)",
            }}
          >
            <div>
              <span className="editorial-eyebrow" style={{ marginBottom: "0.8rem" }}>
                Rescue Chronicles
              </span>
              <h2
                id="stories-heading"
                style={{
                  fontSize: "clamp(1.9rem, 3.4vw, 2.65rem)",
                  color: "var(--stone-900)",
                  margin: 0,
                  maxWidth: "22ch",
                }}
              >
                Lives reclaimed from roadside trauma and neglect.
              </h2>
            </div>

            <Link
              href="/stories"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "var(--stone-900)",
                textDecoration: "none",
                borderBottom: "1.5px solid var(--saffron-500)",
                paddingBottom: "0.2rem",
              }}
            >
              Read All Documented Stories <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </FadeIn>

        {!leadStory ? (
          <div
            style={{
              padding: "2rem",
              background: "var(--color-surface)",
              border: "1px solid var(--cream-200)",
              borderRadius: "var(--radius-md)",
              color: "var(--stone-600)",
              fontSize: "0.94rem",
            }}
          >
            [Admin Placeholder: No published rescue chronicles found in the database yet. Add verified animal recovery journeys via the Admin Dashboard.]
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.25rem" }}>
            {/* Lead Story Feature */}
            <FadeIn direction="up" distance={12}>
              <article
                className="card"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--cream-200)",
                  background: "var(--color-surface)",
                }}
              >
                <Link
                  href={`/stories/${leadStory.slug}`}
                  className="editorial-photo-wrap"
                  style={{
                    position: "relative",
                    minHeight: "320px",
                    aspectRatio: "16 / 10",
                    width: "100%",
                    display: "block",
                    background: "var(--cream-200)",
                  }}
                >
                  <Image
                    src={leadStory.coverImage}
                    alt={`${leadStory.animal}: ${leadStory.title}`}
                    fill
                    unoptimized={shouldBypassImageOptimization(leadStory.coverImage)}
                    style={{ objectFit: "cover", objectPosition: "center 35%" }}
                    sizes="(max-width: 768px) 100vw, 52vw"
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "1rem",
                      left: "1rem",
                      padding: "0.28rem 0.7rem",
                      borderRadius: "3px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      background: "hsl(152, 34%, 22%)",
                      color: "#FAF7F2",
                    }}
                  >
                    {leadStory.outcome}
                  </span>
                </Link>

                <div
                  style={{
                    padding: "clamp(1.75rem, 3.5vw, 2.75rem)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "1.5rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "0.85rem",
                        marginBottom: "1rem",
                        fontSize: "0.76rem",
                        color: "var(--stone-500)",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.09em",
                          color: "var(--saffron-600)",
                        }}
                      >
                        Featured Chronicle · {leadStory.animal}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <Clock size={12} aria-hidden="true" />
                        {leadStory.readTime}
                        {leadStory.date ? ` · ${leadStory.date}` : ""}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                        lineHeight: 1.2,
                        color: "var(--stone-900)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <Link
                        href={`/stories/${leadStory.slug}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {leadStory.title}
                      </Link>
                    </h3>

                    <p
                      style={{
                        fontSize: "0.95rem",
                        fontStyle: "italic",
                        color: "var(--stone-500)",
                        marginBottom: "1rem",
                      }}
                    >
                      {leadStory.subtitle}
                    </p>

                    <p
                      style={{
                        fontSize: "0.96rem",
                        lineHeight: 1.75,
                        color: "var(--stone-600)",
                        margin: 0,
                      }}
                    >
                      {leadStory.excerpt}
                    </p>
                  </div>

                  <div>
                    <Link
                      href={`/stories/${leadStory.slug}`}
                      className="btn btn-outline"
                      style={{ borderRadius: "var(--radius-sm)" }}
                    >
                      Read Full Rescue Timeline <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            </FadeIn>

            {/* Secondary Grid */}
            {secondaryStories.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                  gap: "1.75rem",
                }}
              >
                {secondaryStories.map((story, idx) => (
                  <FadeIn key={story.slug} delay={idx * 0.06} direction="up" distance={12}>
                    <StoryCard
                      slug={story.slug}
                      title={story.title}
                      subtitle={story.subtitle}
                      date={story.date}
                      readTime={story.readTime}
                      coverImage={story.coverImage}
                      outcome={story.outcome}
                      excerpt={story.excerpt}
                      animal={story.animal}
                    />
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
