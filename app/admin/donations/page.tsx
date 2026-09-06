import prisma from "@/lib/prisma";

export default async function AdminDonationsPage() {
  const donations = await prisma.donation.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Donations</h1>
          <p style={{ color: "var(--stone-500)" }}>View all donations received.</p>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--stone-100)", borderBottom: "1px solid var(--cream-200)", textAlign: "left" }}>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>ID & Date</th>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Donor</th>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Purpose</th>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--stone-500)" }}>
                  No donations yet.
                </td>
              </tr>
            ) : donations.map((donation) => (
              <tr key={donation.id} style={{ borderBottom: "1px solid var(--cream-200)" }}>
                <td style={{ padding: "1rem" }}>
                  <div style={{ fontWeight: 600 }}>{donation.id}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--stone-500)" }}>
                    {donation.createdAt.toLocaleDateString()}
                  </div>
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ fontWeight: 600 }}>{donation.donorName}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--stone-500)" }}>{donation.donorEmail}</div>
                </td>
                <td style={{ padding: "1rem", color: "var(--stone-600)" }}>
                  {donation.purpose}
                  <div style={{ fontSize: "0.75rem", background: "var(--cream-100)", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-full)", display: "inline-block", marginLeft: "0.5rem" }}>
                    {donation.frequency}
                  </div>
                </td>
                <td style={{ padding: "1rem", textAlign: "right", fontWeight: 700, color: "var(--saffron-700)", fontSize: "1.1rem" }}>
                  ₹{donation.amount.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
