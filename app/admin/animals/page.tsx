import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { deleteAnimal } from "../actions";

export default async function AdminAnimalsPage() {
  const animals = await prisma.animal.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Animals</h1>
          <p style={{ color: "var(--stone-500)" }}>Manage all rescued animals.</p>
        </div>
        <Link href="/admin/animals/new" className="btn btn-primary">
          + Add New Animal
        </Link>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", overflow: "hidden" }}>
        <div className="admin-table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
          <thead>
            <tr style={{ background: "var(--stone-100)", borderBottom: "1px solid var(--cream-200)", textAlign: "left" }}>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Animal</th>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Type</th>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Location</th>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {animals.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--stone-500)" }}>
                  No animals found.
                </td>
              </tr>
            ) : animals.map((animal) => (
              <tr key={animal.id} style={{ borderBottom: "1px solid var(--cream-200)" }}>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", position: "relative", background: "var(--cream-100)" }}>
                      {animal.image && <Image src={animal.image} alt={animal.name} fill style={{ objectFit: "cover" }} />}
                    </div>
                    <div style={{ fontWeight: 600 }}>{animal.name}</div>
                  </div>
                </td>
                <td style={{ padding: "1rem", color: "var(--stone-600)" }}>{animal.type}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ 
                    padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700,
                    background: animal.status === "Available for Adoption" ? "var(--green-100)" : "var(--saffron-100)",
                    color: animal.status === "Available for Adoption" ? "var(--green-700)" : "var(--saffron-700)"
                  }}>
                    {animal.status}
                  </span>
                </td>
                <td style={{ padding: "1rem", color: "var(--stone-600)" }}>{animal.location}</td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <form action={async () => {
                    "use server";
                    await deleteAnimal(animal.id);
                  }}>
                    <button type="submit" style={{ background: "transparent", border: "none", color: "var(--red-600)", fontWeight: 600, cursor: "pointer", padding: "0.5rem" }}>
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
