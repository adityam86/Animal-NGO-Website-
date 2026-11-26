"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export interface AdminUserSummary {
  id?: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminShell({
  children,
  adminUser,
}: {
  children: React.ReactNode;
  adminUser?: AdminUserSummary;
}) {
  const pathname = usePathname();
  const [openAtPath, setOpenAtPath] = useState<string | null>(null);
  const sidebarOpen = openAtPath === pathname;

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--cream-50)", color: "var(--color-text)" }}>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setOpenAtPath(null)}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar: Docked on Desktop, Slide-over Drawer on Mobile */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setOpenAtPath(null)}
        adminUser={adminUser}
      />

      {/* Main Workspace Canvas */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <AdminHeader
          adminUser={adminUser}
          onToggleSidebar={() =>
            setOpenAtPath((prev) => (prev === pathname ? null : pathname))
          }
        />

        <div className="admin-scroll-canvas">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
