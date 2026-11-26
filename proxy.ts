import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyActiveSessionToken } from "@/lib/auth-server";
import { SESSION_COOKIE_NAME } from "@/lib/session-token";

function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifyActiveSessionToken(token);

  // Protect admin API routes (enforces JWT + non-revoked DB session + active user)
  if (pathname.startsWith("/api/reports") || pathname === "/api/upload" || pathname.startsWith("/api/admin")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protect /admin UI routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      if (token) {
        loginUrl.searchParams.set("session", "expired");
      }
      const response = NextResponse.redirect(loginUrl);
      if (token) {
        clearSessionCookie(response);
      }
      return response;
    }
    return NextResponse.next();
  }

  // On /login: only redirect to /admin when DB-backed session is active & valid.
  // If a revoked/expired/suspended cookie is still attached, clear it and render /login cleanly.
  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (token) {
      const response = NextResponse.next();
      clearSessionCookie(response);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/api/reports/:path*", "/api/upload", "/api/admin/:path*"],
};
