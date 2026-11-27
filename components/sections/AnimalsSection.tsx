import Link from "next/link";
import prisma from "@/lib/prisma";
import AnimalCard from "@/components/shared/AnimalCard";
import { ANIMALS } from "@/lib/data";
import FadeIn from "@/components/motion/FadeIn";

export default async function AnimalsSection() {
  let adoptable: Array<{
    id: string;
    name: string;
    type: string;
    breed: string;
    gender: string;
    age: string;
    image: string;
    status: string;
    vaccinated: boolean;
    sterilized: boolean;
    location: string;
  }> = [];

  try {
    adoptable = await prisma.animal.findMany({
      where: { status: "Available for Adoption" },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        name: true,
        type: true,
        breed: true,
        gender: true,
        age: true,
        image: true,
        status: true,
        vaccinated: true,
        sterilized: true,
        location: true,
      },
    });
  } catch {
    adoptable = [];
  }

  if (adoptable.length === 0) {
    adoptable = ANIMALS.filter((a) => a.status === "Available for Adoption").slice(0, 4);
  }

  return (
    <section className="section" style={{ background: "white" }}>
      <div className="container">
        <FadeIn direction="up" distance={20}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "2.75rem",
            }}
          >
            <div>
              <div className="section-tag" style={{ background: "var(--sage-tint, var(--green-50))", color: "var(--green-700)" }}>
                Ready for a Home
              </div>
              <h2>Adopt a Rescued Companion</h2>
              <p style={{ marginTop: "0.5rem", maxWidth: 480, color: "var(--stone-600)" }}>
                Vaccinated, dewormed, sterilized, and waiting to become your forever family member.
              </p>
            </div>
            <Link href="/adoption" className="btn btn-outline">
              View All Adoptables →
            </Link>
          </div>
        </FadeIn>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            overflowX: "auto",
            paddingBottom: "1.25rem",
            paddingTop: "0.5rem",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {adoptable.map((animal, idx) => (
            <FadeIn
              key={animal.id}
              delay={idx * 0.1}
              direction="up"
              distance={20}
              style={{ scrollSnapAlign: "start", flexShrink: 0 }}
            >
              <AnimalCard {...animal} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
