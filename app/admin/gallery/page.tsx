import prisma from "@/lib/prisma";
import Image from "next/image";
import { requireAdminSession } from "@/lib/auth-server";
import AdminImageField from "@/components/admin/AdminImageField";
import {
  createGalleryPhotoAction,
  deleteGalleryPhotoAction,
} from "@/app/admin/actions-addons";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);

  const photos = await prisma.galleryPhoto.findMany({
    orderBy: [{ capturedDate: "desc" }],
  });

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>Sanctuary Photo Gallery</h1>
        <p style={{ color: "var(--stone-600)", fontSize: "0.9rem" }}>
          Upload verified sanctuary, Gaushala, veterinary recovery, and drive photographs published onto `/gallery`.
        </p>
      </div>

      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Add Documentary Photo</h2>
        <form action={createGalleryPhotoAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "0.85rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="gp-title">Title *</label>
              <input id="gp-title" name="title" className="form-input" required placeholder="e.g., Post-Op Kennel Rounds" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="gp-cat">Category *</label>
              <select id="gp-cat" name="category" className="form-select" defaultValue="Rescue">
                <option value="Rescue">Rescue</option>
                <option value="Medical Care">Medical Care</option>
                <option value="Gaushala">Gaushala</option>
                <option value="Shelter">Shelter</option>
                <option value="Adoption">Adoption</option>
                <option value="Community Drive">Community Drive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="gp-date">Captured Date</label>
              <input id="gp-date" name="capturedDate" type="date" className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gp-caption">Caption</label>
            <textarea id="gp-caption" name="caption" className="form-textarea" style={{ minHeight: 70 }} placeholder="Short documentary note without private citizen phone numbers..." />
          </div>

          <AdminImageField inputName="imageUrl" defaultUrl="/images/shelter_banner.jpg" label="Documentary Photograph *" />

          <div>
            <button type="submit" className="btn btn-primary">Publish to Gallery</button>
          </div>
        </form>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
        {photos.map((p) => (
          <div key={p.id} className="card" style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <div style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--cream-100)" }}>
              <Image src={p.imageUrl} alt={p.title} fill unoptimized style={{ objectFit: "cover" }} />
            </div>
            <div>
              <span className="badge badge-green" style={{ marginBottom: "0.25rem" }}>{p.category}</span>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{p.title}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--stone-500)" }}>
                {new Date(p.capturedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await deleteGalleryPhotoAction(p.id);
              }}
            >
              <button type="submit" className="btn btn-sm" style={{ background: "var(--crimson)", color: "white", width: "100%" }}>
                Delete Photo
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
