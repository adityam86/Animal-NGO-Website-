import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-server";
import {
  createCommunityDriveAction,
  updateCommunityDriveStatusAction,
  deleteCommunityDriveAction,
} from "@/app/admin/actions-addons";

export const dynamic = "force-dynamic";

export default async function AdminDrivesPage() {
  await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);

  const drives = await prisma.communityDrive.findMany({
    orderBy: [{ date: "desc" }],
  });

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>ABC &amp; Anti-Rabies Drive Calendar</h1>
        <p style={{ color: "var(--stone-600)", fontSize: "0.9rem" }}>
          Schedule public ward camps displayed directly on `/drives`. Citizen locality requests arrive in Admin Inquiries.
        </p>
      </div>

      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Schedule New Community Camp</h2>
        <form action={createCommunityDriveAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "0.85rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="cd-title">Camp Title *</label>
              <input id="cd-title" name="title" className="form-input" required placeholder="e.g., Kumarpur Morning ARV Drive" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cd-type">Drive Type *</label>
              <select id="cd-type" name="driveType" className="form-select" defaultValue="Anti-Rabies Vaccination">
                <option value="Anti-Rabies Vaccination">Anti-Rabies Vaccination</option>
                <option value="ABC Sterilization">ABC Sterilization</option>
                <option value="Feeding Camp">Feeding Camp</option>
                <option value="Awareness">Awareness</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cd-locality">Area / Ward *</label>
              <input id="cd-locality" name="areaWard" className="form-input" required placeholder="e.g., Ward 24, Kumarpur, Asansol" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cd-coord">Lead Coordinator *</label>
              <input id="cd-coord" name="coordinator" className="form-input" required defaultValue="Tarasankar Nag" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cd-date">Camp Date *</label>
              <input id="cd-date" name="date" type="date" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cd-time">Time Slot *</label>
              <input id="cd-time" name="timeSlot" className="form-input" required defaultValue="8:00 AM – 1:00 PM" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cd-notes">Coordinator Instructions</label>
            <textarea id="cd-notes" name="notes" className="form-textarea" placeholder="Meeting point, feeder focal contact, or recovery kennel instructions..." />
          </div>

          <div>
            <button type="submit" className="btn btn-primary">Publish Camp to Calendar</button>
          </div>
        </form>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {drives.length === 0 ? (
          <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--stone-500)" }}>
            No ABC or vaccination drives scheduled yet.
          </div>
        ) : (
          drives.map((d) => (
            <div key={d.id} className="card" style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span className="badge badge-green">{d.driveType}</span>
                  <span className="badge badge-stone">{d.status}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{d.title}</div>
                <div style={{ fontSize: "0.84rem", color: "var(--stone-600)" }}>
                  {new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · {d.timeSlot} · {d.areaWard} ({d.coordinator})
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <form
                  action={async (formData) => {
                    "use server";
                    const st = String(formData.get("status") || "Scheduled");
                    await updateCommunityDriveStatusAction(d.id, st);
                  }}
                  style={{ display: "flex", gap: "0.4rem" }}
                >
                  <select name="status" defaultValue={d.status} className="form-select" style={{ minWidth: 130 }}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button type="submit" className="btn btn-outline btn-sm">Update</button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await deleteCommunityDriveAction(d.id);
                  }}
                >
                  <button type="submit" className="btn btn-sm" style={{ background: "var(--crimson)", color: "white" }}>Delete</button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
