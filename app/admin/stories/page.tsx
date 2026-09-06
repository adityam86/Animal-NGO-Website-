import prisma from "@/lib/prisma";

export default async function AdminStoriesPage() {
  const stories = await prisma.story.findMany({
    orderBy: { date: 'desc' }
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Rescue Stories</h1>
          <p style={{ color: "var(--stone-500)" }}>Manage published success stories.</p>
        </div>
        <button className="btn btn-primary">
          + Draft New Story
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--stone-100)", borderBottom: "1px solid var(--cream-200)", textAlign: "left" }}>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Title</th>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Animal</th>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {stories.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: "2rem", textAlign: "center", color: "var(--stone-500)" }}>
                  No stories published yet.
                </td>
              </tr>
            ) : stories.map((story) => (
              <tr key={story.slug} style={{ borderBottom: "1px solid var(--cream-200)" }}>
                <td style={{ padding: "1rem" }}>
                  <div style={{ fontWeight: 600, color: "var(--saffron-700)" }}>{story.title}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--stone-500)" }}>{story.date.toLocaleDateString()}</div>
                </td>
                <td style={{ padding: "1rem", color: "var(--stone-600)" }}>
                  {story.animal} ({story.animalType})
                </td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ 
                    padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700,
                    background: "var(--green-100)",
                    color: "var(--green-700)"
                  }}>
                    {story.outcome}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
