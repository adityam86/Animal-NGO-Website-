import prisma from "@/lib/prisma";
import Link from "next/link";
import { Camera } from "lucide-react";
import GalleryGrid, { type GalleryItem } from "@/components/shared/GalleryGrid";
import { STORIES } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Documentary Sanctuary Gallery",
  description:
    "Verified sanctuary, Gaushala, veterinary recovery, and field rescue moments documented by Ayudar Animal Welfare Foundation.",
};

export default async function GalleryPage() {
  const dbPhotos = await prisma.galleryPhoto.findMany({
    orderBy: [{ capturedDate: "desc" }],
  });

  const fallbackDocumentary: GalleryItem[] = [
    {
      id: "doc-shelter",
      title: "Morning Kennel & Medical Rounds",
      category: "Medical Care",
      caption: "Routine wound dressing and morning checkups at Tilabad, Kumarpur sanctuary.",
      location: "Asansol Sanctuary",
      takenDate: "Field Archive",
      imageUrl: "/images/shelter_banner.jpg",
    },
    {
      id: "doc-cow",
      title: "Gaushala Care & Recovery Yard",
      category: "Gaushala",
      caption: "Rescued cows grazing and resting after highway injury rehabilitation.",
      location: "Tilabad Gaushala",
      takenDate: "Field Archive",
      imageUrl: STORIES[2]?.coverImage || "/images/cow_lakshmi.jpg",
    },
    {
      id: "doc-bruno",
      title: "Street Trauma Stabilization",
      category: "Rescue",
      caption: "Post-treatment recovery before permanent adoption screening.",
      location: "Raniganj Corridor",
      takenDate: "Field Archive",
      imageUrl: "/images/dog_bruno.jpg",
    },
    {
      id: "doc-cat",
      title: "Cat Care & Kitten Nursery",
      category: "Adoption",
      caption: "Feline recovery wing protecting orphaned and market-abandoned kittens.",
      location: "Asansol Wing",
      takenDate: "Field Archive",
      imageUrl: "/images/cat_mia.jpg",
    },
  ];

  const items: GalleryItem[] =
    dbPhotos.length > 0
      ? dbPhotos.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          caption: p.caption,
          location: "Ayudar Sanctuary",
          takenDate: new Date(p.capturedDate).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          }),
          imageUrl: p.imageUrl,
        }))
      : fallbackDocumentary;

  return (
    <main style={{ background: "var(--cream-50)", minHeight: "100vh", paddingTop: "72px" }}>
      <section
        style={{
          background: "linear-gradient(135deg, #1E3A2F 0%, #244739 65%, #2D5645 100%)",
          color: "white",
          padding: "clamp(3rem, 6vw, 4.5rem) 0",
        }}
      >
        <div className="container">
          <span className="editorial-eyebrow" style={{ color: "#FAF7F2", borderColor: "rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.1)", marginBottom: "0.85rem" }}>
            <Camera size={13} style={{ display: "inline", marginRight: 5 }} /> Verified Documentary Archive
          </span>
          <h1 style={{ color: "white", fontSize: "clamp(2rem, 4.2vw, 3rem)", marginBottom: "0.85rem" }}>
            Sanctuary &amp; Field Rescue Gallery
          </h1>
          <p style={{ color: "rgba(250, 247, 242, 0.85)", maxWidth: "58ch", lineHeight: 1.7, margin: 0 }}>
            Real field rescues, kennel care, Gaushala moments, and community sterilization camps across Asansol, Raniganj, and Durgapur.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <GalleryGrid items={items} />

          <div style={{ marginTop: "3rem", textAlign: "center" }}>
            <Link href="/donate" className="btn btn-terracotta" style={{ marginRight: "0.75rem" }}>
              Support Field Care →
            </Link>
            <Link href="/drives" className="btn btn-outline">
              View ABC &amp; ARV Drive Calendar
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
