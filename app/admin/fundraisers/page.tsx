import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-server";
import AdminImageField from "@/components/admin/AdminImageField";
import {
  createMedicalFundraiserAction,
  toggleFundraiserActiveAction,
  deleteFundraiserAction,
} from "@/app/admin/actions-addons";

export const dynamic = "force-dynamic";

export default async function AdminFundraisersPage() {
  await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);

  const [fundraisers, animals] = await Promise.all([
    prisma.medicalFundraiser.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: {
        donations: {
          where: { paymentStatus: "Completed" },
          select: { amount: true },
        },
      },
    }),
    prisma.animal.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, type: true },
      take: 100,
    }),
  ]);

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>Medical Case Fundraisers</h1>
        <p style={{ color: "var(--stone-600)", fontSize: "0.9rem" }}>
          Publish real surgery or critical ICU fundraisers onto `/donate`. Progress bars tally completed Razorpay donations automatically.
        </p>
      </div>

      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Launch New Medical Fundraiser</h2>
        <form action={createMedicalFundraiserAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "0.85rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="mf-title">Campaign Title *</label>
              <input id="mf-title" name="title" className="form-input" required placeholder="e.g., Orthopedic Fracture Pinning" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mf-patient">Patient Name *</label>
              <input id="mf-patient" name="animalName" className="form-input" required placeholder="e.g., Sheru" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mf-species">Species *</label>
              <select id="mf-species" name="species" className="form-select" defaultValue="Dog">
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Cow / Calf">Cow / Calf</option>
                <option value="Bird">Bird</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mf-goal">Goal Amount (₹) *</label>
              <input id="mf-goal" name="goalInr" type="number" min={500} className="form-input" required placeholder="12000" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mf-purpose">Allocation Purpose *</label>
              <select id="mf-purpose" name="purpose" className="form-select" defaultValue="Medical Treatment">
                <option value="Medical Treatment">Medical Treatment</option>
                <option value="Animal Rescue">Animal Rescue</option>
                <option value="Cow Care (Gaushala)">Cow Care (Gaushala)</option>
                <option value="Shelter & Food">Shelter &amp; Food</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mf-animal">Link Existing Animal (Optional)</label>
              <select id="mf-animal" name="animalId" className="form-select" defaultValue="">
                <option value="">None</option>
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mf-summary">Clinical &amp; Billing Summary *</label>
            <textarea id="mf-summary" name="summary" className="form-textarea" required placeholder="Describe surgery, X-rays, dressings, and treatment breakdown..." />
          </div>

          <AdminImageField inputName="image" label="Fundraiser Patient Photo *" />

          <div>
            <button type="submit" className="btn btn-primary">Publish Active Fundraiser</button>
          </div>
        </form>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {fundraisers.length === 0 ? (
          <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--stone-500)" }}>
            No custom fundraisers created yet. Until you publish one here, `/donate` displays Ayudar&apos;s standard medical priority allocations.
          </div>
        ) : (
          fundraisers.map((f) => {
            const raised = f.donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
            return (
              <div key={f.id} className="card" style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem" }}>
                    <span className={`badge ${f.isActive ? "badge-green" : "badge-stone"}`}>
                      {f.isActive ? "Active on /donate" : "Paused"}
                    </span>
                    <span className="badge badge-amber">{f.purpose}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{f.animalName}: {f.title}</div>
                  <div style={{ fontSize: "0.84rem", color: "var(--stone-600)" }}>
                    Raised ₹{raised.toLocaleString("en-IN")} of ₹{f.goalInr.toLocaleString("en-IN")} ({f.donations.length} verified donations) · {f.species}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <form
                    action={async () => {
                      "use server";
                      await toggleFundraiserActiveAction(f.id, !f.isActive);
                    }}
                  >
                    <button type="submit" className="btn btn-outline btn-sm">
                      {f.isActive ? "Pause" : "Activate"}
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await deleteFundraiserAction(f.id);
                    }}
                  >
                    <button type="submit" className="btn btn-sm" style={{ background: "var(--crimson)", color: "white" }}>
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
