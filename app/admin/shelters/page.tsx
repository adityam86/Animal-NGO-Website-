import prisma from "@/lib/prisma";
import { addShelter, assignAnimalToShelter } from "./actions";

export default async function AdminSheltersPage() {
  const [shelters, unassignedAnimals] = await Promise.all([
    prisma.shelterLocation.findMany({
      include: {
        animals: {
          select: { id: true, name: true, type: true }
        },
        _count: {
          select: { animals: true }
        }
      },
      orderBy: { name: "asc" }
    }),
    prisma.animal.findMany({
      where: { shelterLocationId: null },
      select: { id: true, name: true, type: true }
    })
  ]);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>Shelters & Occupancy</h1>
        <p style={{ color: "var(--stone-500)" }}>Manage shelter capacities, facilities, and animal housing assignments.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", alignItems: "flex-start", marginBottom: "3rem" }}>
        {/* Shelter List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {shelters.length === 0 ? (
            <div style={{ background: "white", padding: "3rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏠</div>
              <p style={{ color: "var(--stone-500)", margin: 0 }}>No shelters registered yet. Create one on the right.</p>
            </div>
          ) : shelters.map((shelter) => {
            const occupancy = shelter._count.animals;
            const percentage = Math.min(100, Math.round((occupancy / shelter.capacity) * 100)) || 0;
            const isFull = occupancy >= shelter.capacity;

            return (
              <div key={shelter.id} style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", color: "var(--stone-800)", marginBottom: "0.25rem" }}>{shelter.name}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--stone-500)", margin: 0 }}>📍 {shelter.address}</p>
                  </div>
                  <span style={{ 
                    padding: "0.3rem 0.8rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700,
                    background: isFull ? "hsl(0,75%,95%)" : "hsl(142,55%,95%)",
                    color: isFull ? "hsl(0,75%,40%)" : "hsl(142,55%,35%)"
                  }}>
                    Type: {shelter.type}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--stone-600)", marginBottom: "0.4rem" }}>
                    <span>Occupancy: <strong>{occupancy}</strong> / {shelter.capacity} animals</span>
                    <span>{percentage}% Full</span>
                  </div>
                  <div style={{ height: 10, background: "var(--cream-100)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${percentage}%`, background: percentage > 85 ? "var(--red-500)" : "var(--green-500)", borderRadius: "var(--radius-full)", transition: "width 0.3s" }} />
                  </div>
                </div>

                {/* Animals in shelter */}
                <div>
                  <h4 style={{ fontSize: "0.9rem", color: "var(--stone-700)", marginBottom: "0.75rem" }}>Housed Animals ({occupancy})</h4>
                  {shelter.animals.length === 0 ? (
                    <p style={{ fontSize: "0.85rem", color: "var(--stone-400)", fontStyle: "italic", margin: 0 }}>This shelter is currently empty.</p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {shelter.animals.map(animal => (
                        <div key={animal.id} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.75rem", background: "var(--cream-50)", border: "1px solid var(--cream-200)", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
                          <span>{animal.name} ({animal.type})</span>
                          <form action={async () => {
                            "use server";
                            await assignAnimalToShelter(animal.id, null);
                          }}>
                            <button type="submit" style={{ background: "transparent", border: "none", color: "var(--red-600)", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", padding: 0 }}>
                              ×
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Add Shelter */}
          <div style={{ background: "white", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>Create Shelter Location</h3>
            <form action={addShelter} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Shelter Name *</label>
                <input name="name" required className="form-input" placeholder="e.g. Main Shelter, Cat Wing" />
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <input name="address" required className="form-input" placeholder="e.g. GT Road, Raniganj" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Capacity *</label>
                  <input type="number" name="capacity" required className="form-input" placeholder="e.g. 50" min="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select name="type" required className="form-select">
                    <option>Dogs</option>
                    <option>Cats</option>
                    <option>Gaushala</option>
                    <option>Mixed</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Create Shelter
              </button>
            </form>
          </div>

          {/* Assign Animals */}
          <div style={{ background: "white", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Assign Unhoused Animals</h3>
            {unassignedAnimals.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--stone-500)", margin: 0 }}>All animals are currently housed in a shelter location.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {unassignedAnimals.map((animal) => (
                  <div key={animal.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--cream-200)", background: "var(--cream-50)" }}>
                    <div style={{ fontSize: "0.85rem" }}>
                      <strong>{animal.name}</strong> ({animal.type})
                    </div>
                    <form action={async (formData) => {
                      "use server";
                      const shelterId = formData.get("shelterId") as string;
                      if (shelterId) await assignAnimalToShelter(animal.id, shelterId);
                    }} style={{ display: "flex", gap: "0.25rem" }}>
                      <select 
                        name="shelterId" 
                        required
                        style={{ padding: "0.25rem 0.5rem", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", border: "1px solid var(--cream-200)" }}
                      >
                        <option value="">Move to...</option>
                        {shelters.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <button type="submit" style={{ padding: "0.25rem 0.5rem", background: "var(--saffron-600)", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                        Go
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
