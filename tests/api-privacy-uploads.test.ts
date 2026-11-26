import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockCookieGet,
  mockSessionFindUnique,
  mockAuditCreate,
  mockDonationFindMany,
  mockSponsorshipFindMany,
  mockRescueFindMany,
  mockRescueFindUnique,
  mockRescueCreate,
  mockAdoptionFindMany,
  mockContactCreate,
} = vi.hoisted(() => ({
  mockCookieGet: vi.fn(),
  mockSessionFindUnique: vi.fn(),
  mockAuditCreate: vi.fn(),
  mockDonationFindMany: vi.fn(),
  mockSponsorshipFindMany: vi.fn(),
  mockRescueFindMany: vi.fn(),
  mockRescueFindUnique: vi.fn(),
  mockRescueCreate: vi.fn(),
  mockAdoptionFindMany: vi.fn(),
  mockContactCreate: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
    set: vi.fn(),
  })),
}));

vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn(async () => undefined),
  writeFile: vi.fn(async () => undefined),
}));

vi.mock("@/lib/prisma", () => {
  const client = {
    adminSession: { findUnique: mockSessionFindUnique },
    auditLog: { create: mockAuditCreate },
    donation: { findMany: mockDonationFindMany },
    sponsorship: { findMany: mockSponsorshipFindMany },
    rescueCase: {
      findMany: mockRescueFindMany,
      findUnique: mockRescueFindUnique,
      create: mockRescueCreate,
    },
    adoptionApplication: { findMany: mockAdoptionFindMany },
    contactInquiry: { create: mockContactCreate },
  };
  return { default: client, prisma: client };
});

import { createSessionToken } from "@/lib/session-token";
import { resetRateLimitStore } from "@/lib/rate-limit";
import { GET as reportsGet } from "@/app/api/reports/[type]/route";
import { GET as rescuesListGet, POST as rescueCreatePost } from "@/app/api/rescue/route";
import { GET as rescueDetailGet } from "@/app/api/rescue/[id]/route";
import { POST as uploadPost } from "@/app/api/upload/route";
import { POST as rescueUploadPost } from "@/app/api/rescue/upload/route";
import { POST as contactPost } from "@/app/api/contact/route";
import { POST as aiChatPost } from "@/app/api/ai/chat/route";

const TEST_SECRET = "a_very_secure_test_session_secret_with_at_least_32_characters_12345";

async function authenticateAs(role: "ADMIN" | "COORDINATOR" = "ADMIN") {
  const token = await createSessionToken(
    {
      id: "user_staff",
      email: "staff@ayudar.org",
      name: "Staff Member",
      role,
    },
    "jti_staff"
  );
  mockCookieGet.mockReturnValue({ value: token });
  mockSessionFindUnique.mockResolvedValue({
    jti: "jti_staff",
    revokedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    user: {
      id: "user_staff",
      email: "staff@ayudar.org",
      name: "Staff Member",
      role,
      isActive: true,
    },
  });
}

describe("Data Privacy, CSV Security, Uploads & Public Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    vi.stubEnv("SESSION_SECRET", TEST_SECRET);
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
  });

  it("blocks unauthenticated and lower-privilege CSV exports and neutralizes CSV formula injection", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const unauthRes = await reportsGet(new Request("http://localhost:3000/api/reports/donations"), {
      params: Promise.resolve({ type: "donations" }),
    });
    expect(unauthRes.status).toBe(401);

    await authenticateAs("COORDINATOR");
    const coordRes = await reportsGet(new Request("http://localhost:3000/api/reports/donations"), {
      params: Promise.resolve({ type: "donations" }),
    });
    expect(coordRes.status).toBe(403);

    await authenticateAs("ADMIN");
    mockDonationFindMany.mockResolvedValue([
      {
        id: "don_1",
        donorName: "=cmd|' /C calc'!A0",
        donorEmail: "donor@example.com",
        donorPhone: "+919876543210",
        amount: 1000,
        purpose: "Medical Care",
        frequency: "One-time",
        paymentStatus: "Completed",
        donorPan: "ABCDE1234F",
        razorpayOrderId: "order_123",
        razorpayPaymentId: "pay_123",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    ]);

    const adminRes = await reportsGet(new Request("http://localhost:3000/api/reports/donations"), {
      params: Promise.resolve({ type: "donations" }),
    });
    expect(adminRes.status).toBe(200);
    const csvText = await adminRes.text();
    expect(csvText).toContain(`"'=cmd|' /C calc'!A0"`);
  });

  it("protects GET /api/rescue and strips reporter PII from public GET /api/rescue/[id]", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const listUnauth = await rescuesListGet(new Request("http://localhost:3000/api/rescue"));
    expect(listUnauth.status).toBe(401);

    mockRescueFindUnique.mockResolvedValue({
      id: "RES-2026-001",
      animalType: "Dog",
      emergencyLevel: "Critical",
      location: "NH-19 Crossing",
      assignedTeam: "Rapid Unit 1",
      status: "On The Way",
      reportedAt: new Date("2026-01-01T10:00:00Z"),
      history: [{ id: "h1", status: "Reported", time: "10:00 AM", done: true }],
    });

    const publicRes = await rescueDetailGet(
      new Request("http://localhost:3000/api/rescue/RES-2026-001"),
      { params: Promise.resolve({ id: "RES-2026-001" }) }
    );
    expect(publicRes.status).toBe(200);
    const body = await publicRes.json();
    expect(body.reporterName).toBeUndefined();
    expect(body.reporterPhone).toBeUndefined();
    expect(body.reporterEmail).toBeUndefined();
    expect(body.description).toBeUndefined();

    // Ensure select query explicitly excludes reporter PII
    const callArgs = mockRescueFindUnique.mock.calls[0]?.[0];
    expect(callArgs?.select?.reporterPhone).toBeUndefined();
    expect(callArgs?.select?.reporterName).toBeUndefined();
    expect(callArgs?.select?.reporterEmail).toBeUndefined();
  });

  it("requires admin session for /api/upload and rejects SVG XSS payloads on both upload routes", async () => {
    const svgBytes = new TextEncoder().encode(`<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`);
    const svgFile = new File([svgBytes], "exploit.jpg", { type: "image/jpeg" });
    const form = new FormData();
    form.append("file", svgFile);

    mockCookieGet.mockReturnValue(undefined);
    const unauthUpload = await uploadPost(
      new Request("http://localhost:3000/api/upload", { method: "POST", body: form })
    );
    expect(unauthUpload.status).toBe(401);

    const rescueSvgRes = await rescueUploadPost(
      new Request("http://localhost:3000/api/rescue/upload", { method: "POST", body: form })
    );
    expect(rescueSvgRes.status).toBe(400);

    // Valid PNG magic bytes succeed cleanly on rescue upload
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);
    const validPng = new File([pngBytes], "injured.png", { type: "image/png" });
    const pngForm = new FormData();
    pngForm.append("file", validPng);

    const rescuePngRes = await rescueUploadPost(
      new Request("http://localhost:3000/api/rescue/upload", { method: "POST", body: pngForm })
    );
    expect(rescuePngRes.status).toBe(200);
    const pngJson = await rescuePngRes.json();
    expect(pngJson.url).toBeTruthy();
  });

  it("validates public rescue, contact, and AI chat routes and guards cross-origin requests", async () => {
    const crossSiteRes = await rescueCreatePost(
      new Request("http://localhost:3000/api/rescue", {
        method: "POST",
        headers: { "sec-fetch-site": "cross-site", "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(crossSiteRes.status).toBe(403);

    const badContactRes = await contactPost(
      new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "A",
          email: "not-an-email",
          subject: "Help",
          message: "hi",
        }),
      })
    );
    expect(badContactRes.status).toBe(400);

    mockContactCreate.mockResolvedValue({
      id: "inq_1",
      status: "New",
      createdAt: new Date(),
    });

    const okContactRes = await contactPost(
      new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Priya Sen",
          email: "priya@example.com",
          phone: "+919876500000",
          subject: "Adoption Enquiry",
          message: "Hello, I would like to visit the Raniganj shelter this weekend.",
        }),
      })
    );
    expect(okContactRes.status).toBe(201);

    const triageRes = await aiChatPost(
      new Request("http://localhost:3000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Injured dog bleeding heavily on road" }),
      })
    );
    expect(triageRes.status).toBe(200);
    const triageJson = await triageRes.json();
    expect(triageJson.isEmergency).toBe(true);
    expect(triageJson.disclaimer).toContain("not a substitute");
  });
});
