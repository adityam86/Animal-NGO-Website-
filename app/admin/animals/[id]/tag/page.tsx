import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-server";
import AnimalQrTag from "@/components/shared/AnimalQrTag";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnimalTagPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);
  const { id } = await params;

  const animal = await prisma.animal.findUnique({ where: { id } });
  if (!animal) notFound();

  return (
    <div>
      <div className="no-print" style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <Link href="/admin/animals" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.86rem", fontWeight: 600, color: "var(--stone-600)", marginBottom: "0.4rem" }}>
            <ArrowLeft size={15} /> Back to Animals Directory
          </Link>
          <h1 style={{ fontSize: "1.65rem", margin: 0 }}>Printable Kennel &amp; Collar Tag — {animal.name}</h1>
        </div>
      </div>

      <div className="card" style={{ padding: "1.75rem", maxWidth: "680px" }}>
        <p className="no-print" style={{ fontSize: "0.88rem", color: "var(--stone-600)", marginBottom: "1.25rem" }}>
          Print this tag for shelter kennel doors or laminated reflective collars. Anyone who scans the QR opens {animal.name}&apos;s verified medical record &amp; shelter helpline directly.
        </p>

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

        <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--cream-200)", fontSize: "0.84rem", color: "var(--stone-600)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <span><strong>Shelter Wing:</strong> {animal.shelter}</span>
          <span><strong>Rescue Location:</strong> {animal.location}</span>
        </div>
      </div>
    </div>
  );
}
