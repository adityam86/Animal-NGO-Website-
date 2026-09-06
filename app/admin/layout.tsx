import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--cream-50)", color: "var(--color-text)" }}>
      {/* Sleek Slate Sidebar */}
      <AdminSidebar />

      {/* Main Workspace Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {/* Sticky Command Header */}
        <AdminHeader />

        {/* Scrollable Work Canvas */}
        <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
