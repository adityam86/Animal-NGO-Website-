import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  createSessionToken,
  generateTokenId,
  type AdminRole,
} from "@/lib/session-token";
import { recordAuditLog } from "@/lib/auth-server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, readBoundedJson } from "@/lib/security";
import { loginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ success: false, error: "Forbidden origin" }, { status: 403 });
    }

    const ipRate = checkRateLimit(`login-ip:${ip}`, 15, 15 * 60 * 1000);
    if (!ipRate.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipRate.retryAfterSeconds) } }
      );
    }

    const bodyResult = await readBoundedJson(request, 8 * 1024);
    if (!bodyResult.ok) {
      return NextResponse.json({ success: false, error: bodyResult.error }, { status: bodyResult.status });
    }

    const parsed = loginSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email and password." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const acctRate = checkRateLimit(`login-acct:${email}`, 8, 15 * 60 * 1000);
    if (!acctRate.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts for this account. Try again later." },
        { status: 429, headers: { "Retry-After": String(acctRate.retryAfterSeconds) } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    const isPasswordValid =
      user && user.isActive ? await verifyPassword(password, user.passwordHash) : false;

    if (!user || !isPasswordValid) {
      await recordAuditLog({
        userId: user?.id ?? null,
        action: "LOGIN_FAILED",
        resource: "/api/login",
        details: `Failed login attempt for ${email}`,
        ipAddress: ip,
      });
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate brand-new session identifier to prevent session fixation
    const jti = generateTokenId();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
    const token = await createSessionToken(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as AdminRole,
      },
      jti
    );

    await prisma.$transaction([
      prisma.adminSession.create({
        data: {
          jti,
          userId: user.id,
          expiresAt,
          ipAddress: ip,
          userAgent: request.headers.get("user-agent")?.slice(0, 250) ?? null,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    await recordAuditLog({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      resource: "/api/login",
      details: `Authenticated role ${user.role}`,
      ipAddress: ip,
    });

    const response = NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication service error" },
      { status: 500 }
    );
  }
}
