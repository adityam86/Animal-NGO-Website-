import prisma from "@/lib/prisma";
import Link from "next/link";
import { deleteStory } from "../actions";

export default async function AdminStoriesPage() {
  const stories = await prisma.story.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Rescue Stories</h1>
          <p style={{ color: "var(--stone-500)" }}>Manage published success stories.</p>
        </div>
        <Link href="/admin/stories/new" className="btn btn-primary">
          + Draft New Story
        </Link>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", overflow: "hidden" }}>
        <div className="admin-table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
            <thead>
              <tr style={{ background: "var(--stone-100)", borderBottom: "1px solid var(--cream-200)", textAlign: "left" }}>
                <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Title</th>
                <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Animal</th>
                <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Outcome</th>
                <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--stone-500)" }}>
                    No stories published yet.
                  </td>
                </tr>
              ) : stories.map((story) => (
                <tr key={story.slug} style={{ borderBottom: "1px solid var(--cream-200)" }}>
                  <td style={{ padding: "1rem" }}>
                    <Link href={`/stories/${story.slug}`} target="_blank" style={{ fontWeight: 600, color: "var(--saffron-700)", textDecoration: "none" }}>
                      {story.title} ↗
                    </Link>
                    <div style={{ fontSize: "0.85rem", color: "var(--stone-500)" }}>{story.date.toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: "1rem", color: "var(--stone-600)" }}>
                    {story.animal} ({story.animalType})
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700,
                      background: "var(--green-100)",
                      color: "var(--green-700)",
                      whiteSpace: "nowrap",
                    }}>
                      {story.outcome}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <form action={async () => {
                      "use server";
                      await deleteStory(story.slug);
                    }}>
                      <button type="submit" style={{ background: "transparent", border: "none", color: "var(--red-600)", fontWeight: 600, cursor: "pointer", padding: "0.4rem" }}>
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
