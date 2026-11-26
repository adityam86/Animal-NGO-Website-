import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  // Protect admin API routes
  if (pathname.startsWith("/api/reports") || pathname === "/api/upload" || pathname.startsWith("/api/admin")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protect /admin UI routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      if (token) {
        response.cookies.delete(SESSION_COOKIE_NAME);
      }
      return response;
    }
  }

  // Redirect authenticated admin away from /login
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/api/reports/:path*", "/api/upload", "/api/admin/:path*"],
};
