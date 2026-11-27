import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth-server";
import { createAdminUser, toggleAdminUserActive } from "../actions";

export default async function AdminSettingsPage() {
  const [session, users, logs] = await Promise.all([
    getAdminSession(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 style={{ marginBottom: "0.25rem" }}>Team &amp; Security Audit</h1>
        <p style={{ color: "var(--stone-500)", margin: 0 }}>
          Manage authorized operations personnel, access roles, and inspect recent audit activity.
        </p>
      </div>

      <div className="admin-split-2-1">
        {/* Staff Roster */}
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--cream-200)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "1.15rem 1.25rem", borderBottom: "1px solid var(--cream-200)" }}>
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Operations Staff Accounts</h2>
          </div>
          <div className="admin-table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
              <thead>
                <tr style={{ background: "var(--stone-100)", borderBottom: "1px solid var(--cream-200)", textAlign: "left" }}>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", textTransform: "uppercase" }}>Staff</th>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", textTransform: "uppercase" }}>Role</th>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", textTransform: "uppercase" }}>State</th>
                  <th style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--stone-500)" }}>
                      No admin accounts seeded yet.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--cream-200)" }}>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div style={{ fontWeight: 700 }}>{u.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--stone-500)" }}>{u.email}</div>
                        {u.lastLoginAt && (
                          <div style={{ fontSize: "0.72rem", color: "var(--stone-400)" }}>
                            Last login: {u.lastLoginAt.toLocaleDateString("en-IN")}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontWeight: 600, fontSize: "0.82rem" }}>{u.role}</td>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span
                          style={{
                            padding: "0.2rem 0.6rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            background: u.isActive ? "var(--green-100)" : "hsl(0, 80%, 95%)",
                            color: u.isActive ? "var(--green-700)" : "hsl(0, 75%, 40%)",
                          }}
                        >
                          {u.isActive ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td style={{ padding: "0.9rem 1rem", textAlign: "right" }}>
                        {isSuperAdmin && u.id !== session?.userId ? (
                          <form
                            action={async () => {
                              "use server";
                              await toggleAdminUserActive(u.id, !u.isActive);
                            }}
                          >
                            <button type="submit" className="btn btn-outline btn-sm">
                              {u.isActive ? "Suspend" : "Restore"}
                            </button>
                          </form>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "var(--stone-400)" }}>
                            {u.id === session?.userId ? "Current Session" : "Super Admin only"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Panel (SUPER_ADMIN only) */}
        <div
          style={{
            background: "var(--color-surface)",
            padding: "1.5rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--cream-200)",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Add Team Member</h2>
          <p style={{ fontSize: "0.82rem", color: "var(--stone-500)", marginBottom: "1rem" }}>
            {isSuperAdmin
              ? "Provision role-scoped access for coordinators, vets, or administrators."
              : "Only SUPER_ADMIN accounts can provision new staff logins."}
          </p>
          {isSuperAdmin && (
            <form action={createAdminUser} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="staff-name">Full Name *</label>
                <input id="staff-name" name="name" required className="form-input" placeholder="Dr. Verma / Coordinator" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="staff-email">Email *</label>
                <input id="staff-email" name="email" type="email" required className="form-input" placeholder="staff@ayudar.org" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="staff-password">Initial Password (8+ chars) *</label>
                <input id="staff-password" name="password" type="password" minLength={8} required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="staff-role">Role *</label>
                <select id="staff-role" name="role" defaultValue="COORDINATOR" className="form-select">
                  <option value="COORDINATOR">COORDINATOR</option>
                  <option value="VET">VET</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Create Staff Account
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Security Audit Log */}
      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--cream-200)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "1.15rem 1.25rem", borderBottom: "1px solid var(--cream-200)" }}>
          <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Recent Audit Log (Last 30 Events)</h2>
        </div>
        <div className="admin-table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640, fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: "var(--stone-100)", borderBottom: "1px solid var(--cream-200)", textAlign: "left" }}>
                <th style={{ padding: "0.75rem 1rem" }}>Timestamp</th>
                <th style={{ padding: "0.75rem 1rem" }}>Actor</th>
                <th style={{ padding: "0.75rem 1rem" }}>Action</th>
                <th style={{ padding: "0.75rem 1rem" }}>Resource &amp; Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--stone-500)" }}>
                    No audit events recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--cream-200)" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--stone-500)", whiteSpace: "nowrap" }}>
                      {log.createdAt.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {log.user ? `${log.user.name} (${log.user.email})` : "System / Webhook"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>{log.action}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--stone-600)" }}>
                      <code>{log.resource}</code>
                      {log.details ? ` — ${log.details}` : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
