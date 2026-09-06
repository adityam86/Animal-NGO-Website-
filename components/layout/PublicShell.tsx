"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EmergencyFAB from "@/components/shared/EmergencyFAB";
import AIChatbot from "@/components/shared/AIChatbot";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminOrLogin = pathname?.startsWith("/admin") || pathname === "/login";

  if (isAdminOrLogin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <EmergencyFAB />
      <AIChatbot />
    </>
  );
}
