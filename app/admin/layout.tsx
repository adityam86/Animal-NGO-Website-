import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }

  return <AdminShell adminUser={session}>{children}</AdminShell>;
}
