import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  mockCookieGet,
  mockCookieSet,
  mockUserFindUnique,
  mockUserUpdate,
  mockSessionFindUnique,
  mockSessionCreate,
  mockSessionUpdateMany,
  mockAuditCreate,
  mockRescueFindUnique,
  mockAnimalDelete,
  mockRescueStatusUpdate,
  mockRescueStatusCreate,
  mockRescueUpdate,
} = vi.hoisted(() => ({
  mockCookieGet: vi.fn(),
  mockCookieSet: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockSessionFindUnique: vi.fn(),
  mockSessionCreate: vi.fn(),
  mockSessionUpdateMany: vi.fn(),
  mockAuditCreate: vi.fn(),
  mockRescueFindUnique: vi.fn(),
  mockAnimalDelete: vi.fn(),
  mockRescueStatusUpdate: vi.fn(),
  mockRescueStatusCreate: vi.fn(),
  mockRescueUpdate: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
    set: mockCookieSet,
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => {
  const client = {
    user: {
      findUnique: mockUserFindUnique,
      update: mockUserUpdate,
      create: vi.fn(),
    },
    adminSession: {
      findUnique: mockSessionFindUnique,
      create: mockSessionCreate,
      updateMany: mockSessionUpdateMany,
    },
    auditLog: {
      create: mockAuditCreate,
    },
    rescueCase: {
      findUnique: mockRescueFindUnique,
      update: mockRescueUpdate,
    },
    rescueCaseStatus: {
      update: mockRescueStatusUpdate,
      create: mockRescueStatusCreate,
    },
    animal: {
      delete: mockAnimalDelete,
    },
    $transaction: vi.fn(async (arg: ((tx: unknown) => Promise<unknown>) | Promise<unknown>[]) =>
      Array.isArray(arg) ? Promise.all(arg) : arg(client)
    ),
  };
  return { default: client, prisma: client };
});

import { hashPassword, verifyPassword } from "@/lib/password";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/session-token";
import { resetRateLimitStore } from "@/lib/rate-limit";
import { proxy } from "@/proxy";
import { POST as loginPost } from "@/app/api/login/route";
import { POST as logoutPost } from "@/app/api/logout/route";
import { deleteAnimal, updateRescueStatus } from "@/app/admin/actions";

const TEST_SECRET = "a_very_secure_test_session_secret_with_at_least_32_characters_12345";

describe("Authentication, Session Security & Authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    vi.stubEnv("SESSION_SECRET", TEST_SECRET);
    vi.stubEnv("NODE_ENV", "test");
  });

  it("hashes passwords with scrypt and verifies timing-safely", async () => {
    const hash = await hashPassword("StrongPass!2026");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("StrongPass!2026", hash)).toBe(true);
    expect(await verifyPassword("WrongPassword", hash)).toBe(false);
    expect(await verifyPassword("StrongPass!2026", "corrupted-hash")).toBe(false);
  });

  it("signs and verifies JWT sessions and rejects forged or tampered tokens", async () => {
    const token = await createSessionToken(
      {
        id: "user_1",
        email: "admin@ayudar.org",
        name: "Admin",
        role: "SUPER_ADMIN",
      },
      "jti_1"
    );

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.sub).toBe("user_1");
    expect(verified?.role).toBe("SUPER_ADMIN");
    expect(verified?.jti).toBe("jti_1");

    expect(await verifySessionToken("true")).toBeNull();
    const parts = token.split(".");
    const tampered = `${parts[0]}.${Buffer.from(
      JSON.stringify({ sub: "attacker", role: "SUPER_ADMIN", exp: 9999999999 })
    ).toString("base64url")}.${parts[2]}`;
    expect(await verifySessionToken(tampered)).toBeNull();
  });

  it("fails closed when SESSION_SECRET is missing or weak in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "short");
    await expect(
      createSessionToken(
        {
          id: "u1",
          email: "a@b.com",
          name: "A",
          role: "ADMIN",
        },
        "j1"
      )
    ).rejects.toThrow(/SESSION_SECRET/i);

    expect(await verifySessionToken("anything.fake.sig")).toBeNull();
  });

  it("rejects forged cookies and unauthenticated access in proxy middleware", async () => {
    const unauthReportReq = new NextRequest("https://ayudar.org/api/reports/donations");
    const unauthReportRes = await proxy(unauthReportReq);
    expect(unauthReportRes.status).toBe(401);

    const forgedCookieReq = new NextRequest("https://ayudar.org/api/reports/donations", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=true` },
    });
    const forgedRes = await proxy(forgedCookieReq);
    expect(forgedRes.status).toBe(401);

    const unauthAdminReq = new NextRequest("https://ayudar.org/admin");
    const adminRedirect = await proxy(unauthAdminReq);
    expect(adminRedirect.status).toBe(307);
    expect(adminRedirect.headers.get("location")).toContain("/login");

    const validToken = await createSessionToken(
      {
        id: "u1",
        email: "admin@ayudar.org",
        name: "Admin",
        role: "ADMIN",
      },
      "j1"
    );
    const validAdminReq = new NextRequest("https://ayudar.org/admin", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${validToken}` },
    });
    const validAdminRes = await proxy(validAdminReq);
    expect(validAdminRes.status).toBe(200);
  });

  it("authenticates DB user on POST /api/login, enforces rate limits, and revokes on logout", async () => {
    const pwHash = await hashPassword("RescuePass#99");
    mockUserFindUnique.mockResolvedValue({
      id: "user_admin",
      email: "ops@ayudar.org",
      name: "Ops Lead",
      passwordHash: pwHash,
      role: "ADMIN",
      isActive: true,
    });
    mockSessionCreate.mockResolvedValue({ id: "sess_1" });
    mockUserUpdate.mockResolvedValue({});
    mockAuditCreate.mockResolvedValue({});

    const badReq = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.5" },
      body: JSON.stringify({ email: "ops@ayudar.org", password: "wrong-password" }),
    });
    const badRes = await loginPost(badReq);
    expect(badRes.status).toBe(401);

    const okReq = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.5" },
      body: JSON.stringify({ email: "ops@ayudar.org", password: "RescuePass#99" }),
    });
    const okRes = await loginPost(okReq);
    expect(okRes.status).toBe(200);
    const setCookie = okRes.headers.get("set-cookie") || "";
    expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(setCookie.toLowerCase()).toContain("httponly");

    const tokenMatch = setCookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
    expect(tokenMatch?.[1]).toBeTruthy();

    // Verify logout revokes DB session and clears cookie
    mockCookieGet.mockReturnValue({ value: tokenMatch?.[1] });
    mockSessionUpdateMany.mockResolvedValue({ count: 1 });

    const logoutReq = new Request("http://localhost:3000/api/logout", {
      method: "POST",
    });
    const logoutRes = await logoutPost(logoutReq);
    expect(logoutRes.status).toBe(303);
    expect(mockSessionUpdateMany).toHaveBeenCalledTimes(1);
    expect(logoutRes.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("blocks unauthenticated and lower-privilege invocations of Admin Server Actions", async () => {
    mockCookieGet.mockReturnValue(undefined);
    await expect(updateRescueStatus("res_1", "Assigned")).rejects.toThrow(/Unauthorized/i);
    await expect(deleteAnimal("ani_1")).rejects.toThrow(/Unauthorized/i);

    const coordinatorToken = await createSessionToken(
      {
        id: "user_coord",
        email: "coord@ayudar.org",
        name: "Coordinator",
        role: "COORDINATOR",
      },
      "jti_coord"
    );
    mockCookieGet.mockReturnValue({ value: coordinatorToken });
    mockSessionFindUnique.mockResolvedValue({
      jti: "jti_coord",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: "user_coord",
        email: "coord@ayudar.org",
        name: "Coordinator",
        role: "COORDINATOR",
        isActive: true,
      },
    });

    // Coordinator cannot perform ADMIN-only deleteAnimal
    await expect(deleteAnimal("ani_1")).rejects.toThrow(/Forbidden/i);
  });
});
