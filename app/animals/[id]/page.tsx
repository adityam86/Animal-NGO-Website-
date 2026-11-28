import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { CheckCircle, XCircle, MapPin, Calendar, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import FadeIn from "@/components/motion/FadeIn";
import AnimalQrTag from "@/components/shared/AnimalQrTag";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const animal = await prisma.animal.findUnique({ where: { id } });
  if (!animal) return { title: "Animal Not Found" };
  return { title: `${animal.name} (${animal.type}) | Ayudar`, description: animal.story.slice(0, 160) };
}

export default async function AnimalProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const animal = await prisma.animal.findUnique({
    where: { id },
    include: {
      vaccinations: {
        orderBy: { dateAdministered: "desc" },
        take: 5,
        select: { id: true, vaccineName: true, dateAdministered: true },
      },
    },
  });
  if (!animal) notFound();

  const healthItems = [
    { label: "Vaccinated", done: animal.vaccinated },
    { label: "Dewormed", done: animal.dewormed },
    { label: "Sterilized", done: animal.sterilized },
  ];

  const isAvailable = animal.status === "Available for Adoption";

  return (
    <main style={{ paddingTop: "68px" }}>
      <section className="section" style={{ background: "var(--cream-50)", minHeight: "85vh" }}>
        <div className="container">
          {/* Breadcrumbs / Back button */}
          <div style={{ marginBottom: "2rem" }}>
            <Link
              href="/animals"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "var(--stone-600)",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 600,
                transition: "color 0.2s",
              }}
            >
              <ArrowLeft size={16} /> Back to All Animals
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3.5rem", alignItems: "flex-start" }}>
            {/* Image */}
            <FadeIn direction="left" distance={30}>
              <div
                style={{
                  position: "relative",
                  borderRadius: "var(--radius-2xl)",
                  overflow: "hidden",
                  aspectRatio: "3/4",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.08)",
                  border: "1px solid var(--cream-200)",
                }}
              >
                <Image
                  src={animal.image}
                  alt={animal.name}
                  fill
                  unoptimized={animal.image.startsWith("data:")}
                  style={{ objectFit: "cover" }}
                  priority
                />
                <div
                  style={{
                    position: "absolute",
                    top: "1.25rem",
                    left: "1.25rem",
                    background: isAvailable ? "var(--green-500)" : "var(--saffron-500)",
                    color: "white",
                    padding: "0.4rem 1.1rem",
                    borderRadius: "var(--radius-full)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {animal.status}
                </div>
              </div>
            </FadeIn>

            {/* Info */}
            <FadeIn direction="right" distance={30}>
              <div>
                {/* ID + type */}
                <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.75rem", alignItems: "center" }}>
                  <span className="badge badge-saffron" style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}>{animal.type}</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--stone-400)", fontWeight: 600 }}>ID: {animal.id}</span>
                </div>

                <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 3.5vw, 2.75rem)" }}>{animal.name}</h1>
                <p style={{ color: "var(--stone-500)", fontSize: "1.05rem", marginBottom: "1.75rem" }}>
                  {animal.breed} • {animal.gender} • {animal.age} • {animal.color}
                </p>

                {/* Details grid */}
                <div className="responsive-grid-2" style={{ marginBottom: "1.5rem" }}>
                  <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "1.1rem", border: "1px solid var(--cream-200)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>Rescue Date</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontWeight: 600, color: "var(--stone-800)", fontSize: "0.92rem" }}>
                      <Calendar size={15} style={{ color: "var(--saffron-500)" }} /> {new Date(animal.rescueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "1.1rem", border: "1px solid var(--cream-200)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>Location Found</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontWeight: 600, color: "var(--stone-800)", fontSize: "0.92rem" }}>
                      <MapPin size={15} style={{ color: "var(--saffron-500)" }} /> {animal.location}
                    </div>
                  </div>
                </div>

                {/* Health Status */}
                <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "1.5rem", border: "1px solid var(--cream-200)", marginBottom: "1.75rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.85rem" }}>Medical & Health Status</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {healthItems.map((h) => (
                      <div key={h.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.35rem 0", borderBottom: "1px solid var(--cream-100)" }}>
                        {h.done ? (
                          <CheckCircle size={18} color="var(--green-500)" />
                        ) : (
                          <XCircle size={18} color="var(--stone-300)" />
                        )}
                        <span style={{ fontWeight: 600, fontSize: "0.92rem", color: h.done ? "var(--stone-700)" : "var(--stone-400)" }}>
                          {h.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {animal.vaccinations && animal.vaccinations.length > 0 && (
                    <div style={{ marginTop: "0.9rem", paddingTop: "0.85rem", borderTop: "1px dashed var(--cream-200)" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase", marginBottom: "0.45rem" }}>
                        Recent Immunizations
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                        {animal.vaccinations.map((v) => (
                          <span
                            key={v.id}
                            style={{
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              padding: "0.22rem 0.65rem",
                              borderRadius: "var(--radius-full)",
                              background: "var(--green-50)",
                              color: "var(--green-800)",
                              border: "1px solid var(--green-100)",
                            }}
                          >
                            {v.vaccineName} ({new Date(v.dateAdministered).toLocaleDateString("en-IN", { month: "short", year: "numeric" })})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Story */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <h3 style={{ fontSize: "1.05rem", marginBottom: "0.65rem", color: "var(--stone-800)" }}>Their Story</h3>
                  <p style={{ lineHeight: 1.85, color: "var(--stone-600)", fontSize: "0.95rem" }}>{animal.story}</p>
                </div>

                {/* Documentation Note */}
                {(animal.name === "Bruno" || animal.name === "Lakshmi") && (
                  <div style={{ marginBottom: "1.75rem", background: "var(--cream-50)", borderRadius: "var(--radius-md)", padding: "1.15rem 1.25rem", border: "1px solid var(--cream-200)" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--stone-600)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                      Field Intake Archive
                    </div>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--stone-600)", lineHeight: 1.6 }}>
                      [Admin Placeholder: Upload verified Day-1 field rescue intake photograph for {animal.name} to enable side-by-side recovery comparison.]
                    </p>
                  </div>
                )}

                {/* Shelter */}
                <div style={{ background: "var(--green-50)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", border: "1px solid var(--green-100)" }}>
                  <MapPin size={20} style={{ color: "var(--green-600)", flexShrink: 0 }} aria-hidden="true" />
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--green-700)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Current Shelter</div>
                    <div style={{ fontWeight: 600, color: "var(--stone-800)", fontSize: "0.95rem" }}>{animal.shelter}</div>
                  </div>
                </div>

                {/* Printable QR Collar & Kennel Tag */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <AnimalQrTag
                    id={animal.id}
                    name={animal.name}
                    type={animal.type}
                    gender={animal.gender}
                    status={animal.status}
                    vaccinated={animal.vaccinated}
                    sterilized={animal.sterilized}
                    dewormed={animal.dewormed}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {isAvailable && (
                    <Link
                      href={`/adoption?animal=${animal.id}`}
                      className="btn btn-primary btn-lg"
                      style={{ flex: 1, justifyContent: "center", borderRadius: "var(--radius-sm)" }}
                    >
                      Adopt {animal.name}
                    </Link>
                  )}
                  <Link
                    href={`/sponsor?animal=${animal.id}`}
                    className="btn btn-outline btn-lg"
                    style={{ flex: 1, justifyContent: "center", fontSize: "1.05rem" }}
                  >
                    💛 Sponsor Care
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </main>
  );
}
