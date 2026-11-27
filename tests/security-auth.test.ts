import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  mockCookieGet,
  mockCookieSet,
  mockRedirect,
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
  mockRedirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
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

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
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
import AdminLayout from "@/app/admin/layout";
import LoginPage from "@/app/login/page";

const TEST_SECRET = "a_very_secure_test_session_secret_with_at_least_32_characters_12345";

function mockActiveDbSession(overrides?: {
  revokedAt?: Date | null;
  expiresAt?: Date;
  isActive?: boolean;
  role?: string;
}) {
  mockSessionFindUnique.mockResolvedValue({
    jti: "j1",
    revokedAt: overrides?.revokedAt ?? null,
    expiresAt: overrides?.expiresAt ?? new Date(Date.now() + 60_000),
    user: {
      id: "u1",
      email: "admin@ayudar.org",
      name: "Admin",
      role: overrides?.role ?? "ADMIN",
      isActive: overrides?.isActive ?? true,
    },
  });
}

describe("Authentication, Session Revocation, Redirect Loop & Authorization", () => {
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

  it("grants valid active DB session access and rejects expired, revoked, and suspended sessions without /login loop", async () => {
    const validToken = await createSessionToken(
      {
        id: "u1",
        email: "admin@ayudar.org",
        name: "Admin",
        role: "ADMIN",
      },
      "j1"
    );

    // 1. Valid active DB session -> /admin passes (200), /login redirects cleanly to /admin
    mockActiveDbSession();
    const validAdminRes = await proxy(
      new NextRequest("https://ayudar.org/admin", {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${validToken}` },
      })
    );
    expect(validAdminRes.status).toBe(200);

    const validLoginRedirect = await proxy(
      new NextRequest("https://ayudar.org/login", {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${validToken}` },
      })
    );
    expect(validLoginRedirect.status).toBe(307);
    expect(validLoginRedirect.headers.get("location")).toContain("/admin");

    // 2. DB Session Expired (even with valid JWT signature) -> /admin & /api/reports rejected, /login accessible
    mockActiveDbSession({ expiresAt: new Date(Date.now() - 10_000) });
    const expiredAdminRes = await proxy(
      new NextRequest("https://ayudar.org/admin", {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${validToken}` },
      })
    );
    expect(expiredAdminRes.status).toBe(307);
    expect(expiredAdminRes.headers.get("location")).toContain("/login");
    expect(expiredAdminRes.headers.get("set-cookie")).toContain("Max-Age=0");

    // 3. DB Session Revoked -> cryptographically valid JWT MUST NOT grant /admin, and /login renders without redirect loop
    mockActiveDbSession({ revokedAt: new Date() });
    const revokedApiRes = await proxy(
      new NextRequest("https://ayudar.org/api/reports/donations", {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${validToken}` },
      })
    );
    expect(revokedApiRes.status).toBe(401);

    const revokedAdminRes = await proxy(
      new NextRequest("https://ayudar.org/admin", {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${validToken}` },
      })
    );
    expect(revokedAdminRes.status).toBe(307);
    expect(revokedAdminRes.headers.get("location")).toContain("/login?session=expired");
    expect(revokedAdminRes.headers.get("set-cookie")).toContain("Max-Age=0");

    // Following redirect to /login with the same revoked JWT cookie MUST NOT loop to /admin
    const loginAfterRevoke = await proxy(
      new NextRequest("https://ayudar.org/login?session=expired", {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${validToken}` },
      })
    );
    expect(loginAfterRevoke.status).toBe(200);
    expect(loginAfterRevoke.headers.get("location")).toBeNull();
    expect(loginAfterRevoke.headers.get("set-cookie")).toContain("Max-Age=0");

    mockCookieGet.mockReturnValue({ value: validToken });
    await expect(AdminLayout({ children: null })).rejects.toThrow("NEXT_REDIRECT:/login?session=expired");
    await expect(LoginPage({ searchParams: Promise.resolve({ session: "expired" }) })).resolves.toBeTruthy();

    // 4. Suspended Admin (isActive: false) -> /admin rejected, /login accessible without loop
    mockActiveDbSession({ isActive: false });
    const suspendedAdminRes = await proxy(
      new NextRequest("https://ayudar.org/admin", {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${validToken}` },
      })
    );
    expect(suspendedAdminRes.status).toBe(307);
    expect(suspendedAdminRes.headers.get("location")).toContain("/login?session=expired");

    const loginSuspendedRes = await proxy(
      new NextRequest("https://ayudar.org/login?session=expired", {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${validToken}` },
      })
    );
    expect(loginSuspendedRes.status).toBe(200);
    expect(loginSuspendedRes.headers.get("location")).toBeNull();
  });

  it("authenticates DB user on POST /api/login, revokes on logout, and keeps /login accessible cleanly", async () => {
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
    expect((await loginPost(badReq)).status).toBe(401);

    const okReq = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.5" },
      body: JSON.stringify({ email: "ops@ayudar.org", password: "RescuePass#99" }),
    });
    const okRes = await loginPost(okReq);
    expect(okRes.status).toBe(200);
    const setCookie = okRes.headers.get("set-cookie") || "";
    const token = setCookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`))?.[1] || "";
    expect(token).toBeTruthy();

    // Logout revokes DB session and clears cookie
    mockCookieGet.mockReturnValue({ value: token });
    mockSessionUpdateMany.mockResolvedValue({ count: 1 });
    const logoutRes = await logoutPost(
      new Request("http://localhost:3000/api/logout", { method: "POST" })
    );
    expect(logoutRes.status).toBe(303);
    expect(mockSessionUpdateMany).toHaveBeenCalledTimes(1);
    expect(logoutRes.headers.get("set-cookie")).toContain("Max-Age=0");

    // Post-logout navigation to /login succeeds cleanly (no DB session found)
    mockSessionFindUnique.mockResolvedValue(null);
    const loginAfterLogout = await proxy(new NextRequest("https://ayudar.org/login"));
    expect(loginAfterLogout.status).toBe(200);
  }, 15000);

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

    await expect(deleteAnimal("ani_1")).rejects.toThrow(/Forbidden/i);
  });
});
