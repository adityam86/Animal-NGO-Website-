import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, verifyDummyPassword } from "@/lib/password";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  createSessionToken,
  generateTokenId,
  type AdminRole,
} from "@/lib/session-token";
import { recordAuditLog } from "@/lib/auth-server";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, readBoundedJson } from "@/lib/security";
import { loginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ success: false, error: "Forbidden origin" }, { status: 403 });
    }

    // 1. IP-level rate limiting (defense against credential stuffing across multiple accounts)
    const ipRate = await checkDistributedRateLimit(`login-ip:${ip}`, 20, 15 * 60 * 1000, { sensitive: true });
    if (!ipRate.allowed) {
      if (ipRate.backend === "outage-blocked" || ipRate.backend === "unconfigured-blocked") {
        return NextResponse.json(
          { success: false, error: "Authentication service temporarily unavailable. Please try again shortly." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Too many login attempts from this network. Please try again later." },
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

    // 2. Composite IP+email throttling:
    // Prevents an attacker from locking out an administrator using only their email address.
    // Each distinct IP is limited to 5 attempts per specific target account.
    const compositeRate = await checkDistributedRateLimit(
      `login-composite:${ip}:${email}`,
      5,
      15 * 60 * 1000,
      { sensitive: true }
    );
    if (!compositeRate.allowed) {
      if (compositeRate.backend === "outage-blocked" || compositeRate.backend === "unconfigured-blocked") {
        return NextResponse.json(
          { success: false, error: "Authentication service temporarily unavailable. Please try again shortly." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Too many failed attempts for this account from your connection. Please wait 15 minutes." },
        { status: 429, headers: { "Retry-After": String(compositeRate.retryAfterSeconds) } }
      );
    }

    // 3. Broader global account threshold across all IPs (safety net against distributed brute-force)
    const broadAcctRate = await checkDistributedRateLimit(
      `login-acct-broad:${email}`,
      30,
      15 * 60 * 1000,
      { sensitive: true }
    );
    if (!broadAcctRate.allowed) {
      if (broadAcctRate.backend === "outage-blocked" || broadAcctRate.backend === "unconfigured-blocked") {
        return NextResponse.json(
          { success: false, error: "Authentication service temporarily unavailable. Please try again shortly." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Account login temporarily restricted due to excessive attempts across networks. Contact administrator." },
        { status: 429, headers: { "Retry-After": String(broadAcctRate.retryAfterSeconds) } }
      );
    }

    // 4. User lookup & timing parity verification
    const user = await prisma.user.findUnique({
      where: { email },
    });

    let isPasswordValid = false;
    if (user && user.isActive) {
      isPasswordValid = await verifyPassword(password, user.passwordHash);
    } else {
      // Execute dummy scrypt verification to eliminate timing difference side-channel
      await verifyDummyPassword(password);
    }

    if (!user || !user.isActive || !isPasswordValid) {
      await recordAuditLog({
        userId: user?.id ?? null,
        action: "LOGIN_FAILED",
        resource: "/api/login",
        details: `Failed login attempt for ${email}`,
        ipAddress: ip,
      });
      // Generic error message prevents account existence enumeration
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
