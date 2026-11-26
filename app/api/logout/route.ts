import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-token";
import { recordAuditLog } from "@/lib/auth-server";
import { getClientIp, isSameOriginRequest } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const payload = await verifySessionToken(token);

    if (payload) {
      await prisma.adminSession.updateMany({
        where: { jti: payload.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await recordAuditLog({
        userId: payload.sub,
        action: "LOGOUT",
        resource: "/api/logout",
        ipAddress: getClientIp(request),
      });
    }
  } catch (err) {
    console.error("Logout cleanup warning:", err);
  }

  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
  return response;
}
