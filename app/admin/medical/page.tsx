import prisma from "@/lib/prisma";
import { addMedicalRecord, addVaccination } from "./actions";

export default async function AdminMedicalPage() {
  const [animals, medicalRecords, vaccinations] = await Promise.all([
    prisma.animal.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, type: true }
    }),
    prisma.medicalRecord.findMany({
      orderBy: { date: "desc" },
      include: { animal: true },
      take: 15
    }),
    prisma.vaccination.findMany({
      orderBy: { dateAdministered: "desc" },
      include: { animal: true },
      take: 15
    })
  ]);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>Medical Portal</h1>
        <p style={{ color: "var(--stone-500)" }}>Manage treatments, vaccinations, and veterinary reports.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
        {/* Record Treatment Form */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>🩹 Record New Treatment</h2>
          <form action={addMedicalRecord} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Select Animal *</label>
              <select name="animalId" required className="form-select">
                <option value="">Choose animal...</option>
                {animals.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Diagnosis *</label>
              <input name="diagnosis" required className="form-input" placeholder="e.g. Parasite infection, fractured front leg" />
            </div>

            <div className="form-group">
              <label className="form-label">Treatment Prescribed *</label>
              <input name="treatment" required className="form-input" placeholder="e.g. Antibiotics, splint application, wound cleaning" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Cost (₹)</label>
                <input type="number" step="0.01" name="cost" className="form-input" placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Veterinarian *</label>
                <input name="vetName" required className="form-input" placeholder="Dr. Sharma" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Treatment Date</label>
                <input type="date" name="date" className="form-input" defaultValue={new Date().toISOString().substring(0, 10)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea name="notes" className="form-textarea" placeholder="Any recovery notes, follow up required..." rows={2} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start", marginTop: "0.5rem" }}>
              Save Treatment Record
            </button>
          </form>
        </div>

        {/* Record Vaccination Form */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>💉 Record Vaccination</h2>
          <form action={addVaccination} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Select Animal *</label>
              <select name="animalId" required className="form-select">
                <option value="">Choose animal...</option>
                {animals.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Vaccine Name *</label>
              <input name="vaccineName" required className="form-input" placeholder="e.g. Anti-Rabies, 9-in-1, DHPPi" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Date Administered</label>
                <input type="date" name="dateAdministered" className="form-input" defaultValue={new Date().toISOString().substring(0, 10)} />
              </div>
              <div className="form-group">
                <label className="form-label">Next Due Date</label>
                <input type="date" name="dateDue" className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Veterinarian *</label>
              <input name="vetName" required className="form-input" placeholder="Dr. Sharma" />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea name="notes" className="form-textarea" placeholder="Batch number, side effects..." rows={2} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start", marginTop: "0.5rem" }}>
              Save Vaccination Record
            </button>
          </form>
        </div>
      </div>

      {/* History Tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        
        {/* Treatments List */}
        <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--cream-200)" }}>
            <h2 style={{ fontSize: "1.1rem" }}>Recent Treatments & Medical History</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "var(--stone-100)", borderBottom: "1px solid var(--cream-200)", textAlign: "left" }}>
                <th style={{ padding: "1rem" }}>Date</th>
                <th style={{ padding: "1rem" }}>Animal</th>
                <th style={{ padding: "1rem" }}>Diagnosis</th>
                <th style={{ padding: "1rem" }}>Treatment</th>
                <th style={{ padding: "1rem" }}>Cost</th>
                <th style={{ padding: "1rem" }}>Vet</th>
              </tr>
            </thead>
            <tbody>
              {medicalRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--stone-500)" }}>
                    No medical records found.
                  </td>
                </tr>
              ) : medicalRecords.map((record) => (
                <tr key={record.id} style={{ borderBottom: "1px solid var(--cream-200)" }}>
                  <td style={{ padding: "1rem" }}>{new Date(record.date).toLocaleDateString()}</td>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>{record.animal.name} ({record.animal.type})</td>
                  <td style={{ padding: "1rem" }}>{record.diagnosis}</td>
                  <td style={{ padding: "1rem" }}>{record.treatment}</td>
                  <td style={{ padding: "1rem" }}>₹{record.cost}</td>
                  <td style={{ padding: "1rem", color: "var(--stone-600)" }}>{record.vetName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vaccinations List */}
        <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--cream-200)" }}>
            <h2 style={{ fontSize: "1.1rem" }}>Recent Vaccinations</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "var(--stone-100)", borderBottom: "1px solid var(--cream-200)", textAlign: "left" }}>
                <th style={{ padding: "1rem" }}>Administered</th>
                <th style={{ padding: "1rem" }}>Animal</th>
                <th style={{ padding: "1rem" }}>Vaccine</th>
                <th style={{ padding: "1rem" }}>Next Due</th>
                <th style={{ padding: "1rem" }}>Vet</th>
                <th style={{ padding: "1rem" }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {vaccinations.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--stone-500)" }}>
                    No vaccinations recorded.
                  </td>
                </tr>
              ) : vaccinations.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid var(--cream-200)" }}>
                  <td style={{ padding: "1rem" }}>{new Date(v.dateAdministered).toLocaleDateString()}</td>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>{v.animal.name} ({v.animal.type})</td>
                  <td style={{ padding: "1rem" }}>{v.vaccineName}</td>
                  <td style={{ padding: "1rem" }}>
                    {v.dateDue ? new Date(v.dateDue).toLocaleDateString() : <span style={{ color: "var(--stone-400)" }}>N/A</span>}
                  </td>
                  <td style={{ padding: "1rem", color: "var(--stone-600)" }}>{v.vetName}</td>
                  <td style={{ padding: "1rem", color: "var(--stone-500)", fontSize: "0.85rem" }}>{v.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
