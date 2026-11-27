import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { deleteAnimal } from "../actions";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 20;

export default async function AdminAnimalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const typeFilter = sp.type?.trim() || "All";
  const statusFilter = sp.status?.trim() || "All";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const where: Prisma.AnimalWhereInput = {};
  if (typeFilter !== "All") where.type = typeFilter;
  if (statusFilter !== "All") where.status = statusFilter;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { breed: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }

  const [animals, total] = await Promise.all([
    prisma.animal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.animal.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Animals ({total})</h1>
          <p style={{ color: "var(--stone-500)", margin: 0 }}>
            Manage rescued animals, medical readiness flags, and adoption profiles.
          </p>
        </div>
        <Link href="/admin/animals/new" className="btn btn-primary">
          + Add New Animal
        </Link>
      </div>

      {/* Filter Bar */}
      <form
        method="GET"
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
          background: "var(--color-surface)",
          padding: "1rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--cream-200)",
        }}
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, breed, or location..."
          className="form-input"
          style={{ flex: 1, minWidth: 190 }}
        />
        <select name="type" defaultValue={typeFilter} className="form-select" style={{ width: 150 }}>
          <option value="All">All Types</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Cow">Cow</option>
          <option value="Puppy">Puppy</option>
          <option value="Kitten">Kitten</option>
          <option value="Calf">Calf</option>
          <option value="Other">Other</option>
        </select>
        <select name="status" defaultValue={statusFilter} className="form-select" style={{ width: 200 }}>
          <option value="All">All Statuses</option>
          <option value="Available for Adoption">Available for Adoption</option>
          <option value="Rescued">Rescued</option>
          <option value="Under Treatment">Under Treatment</option>
          <option value="Recovering">Recovering</option>
          <option value="Sponsored">Sponsored</option>
          <option value="Adopted">Adopted</option>
        </select>
        <button type="submit" className="btn btn-primary btn-sm">
          Apply
        </button>
        {(q || typeFilter !== "All" || statusFilter !== "All") && (
          <Link href="/admin/animals" className="btn btn-outline btn-sm">
            Reset
          </Link>
        )}
      </form>

      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--cream-200)",
          overflow: "hidden",
        }}
      >
        <div className="admin-table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 660 }}>
            <thead>
              <tr style={{ background: "var(--stone-100)", borderBottom: "1px solid var(--cream-200)", textAlign: "left" }}>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Animal</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Type &amp; Health</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Location &amp; Shelter</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {animals.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2.5rem", textAlign: "center", color: "var(--stone-500)" }}>
                    No animals match your filter.
                  </td>
                </tr>
              ) : (
                animals.map((animal) => (
                  <tr key={animal.id} style={{ borderBottom: "1px solid var(--cream-200)" }}>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                        <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", position: "relative", background: "var(--cream-100)", flexShrink: 0 }}>
                          {animal.image && (
                            <Image
                              src={animal.image}
                              alt={animal.name}
                              fill
                              unoptimized={animal.image.startsWith("data:")}
                              style={{ objectFit: "cover" }}
                            />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{animal.name}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--stone-500)" }}>
                            {animal.breed} • {animal.age}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.9rem 1rem", color: "var(--stone-600)" }}>
                      <div>{animal.type}</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--stone-500)" }}>
                        {animal.vaccinated ? "✓ Vaccinated" : "Unvaccinated"} •{" "}
                        {animal.sterilized ? "✓ Sterilized" : "Intact"}
                      </div>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.7rem",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          background:
                            animal.status === "Available for Adoption"
                              ? "var(--green-100)"
                              : "var(--saffron-100)",
                          color:
                            animal.status === "Available for Adoption"
                              ? "var(--green-700)"
                              : "var(--saffron-800)",
                        }}
                      >
                        {animal.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem", color: "var(--stone-600)", fontSize: "0.85rem" }}>
                      <div>{animal.location}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--stone-400)" }}>{animal.shelter}</div>
                    </td>
                    <td style={{ padding: "0.9rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                        <Link
                          href={`/admin/animals/${animal.id}/edit`}
                          className="btn btn-outline btn-sm"
                          style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem" }}
                        >
                          Edit
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteAnimal(animal.id);
                          }}
                        >
                          <button
                            type="submit"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--red-600)",
                              fontWeight: 600,
                              cursor: "pointer",
                              padding: "0.35rem 0.5rem",
                              fontSize: "0.82rem",
                            }}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--stone-500)" }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {page > 1 && (
              <Link
                href={`/admin/animals?q=${encodeURIComponent(q)}&type=${encodeURIComponent(typeFilter)}&status=${encodeURIComponent(statusFilter)}&page=${page - 1}`}
                className="btn btn-outline btn-sm"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/animals?q=${encodeURIComponent(q)}&type=${encodeURIComponent(typeFilter)}&status=${encodeURIComponent(statusFilter)}&page=${page + 1}`}
                className="btn btn-outline btn-sm"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
