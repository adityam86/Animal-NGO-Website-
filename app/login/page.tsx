import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth-server";
import LoginForm from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staff Sign In",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  const sp = await searchParams;
  const sessionNotice =
    sp.session === "expired"
      ? "Your session has expired or was revoked. Please sign in again."
      : undefined;

  return <LoginForm sessionNotice={sessionNotice} />;
}
