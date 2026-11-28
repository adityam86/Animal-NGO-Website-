import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const {
  mockCookieGet,
  mockSessionFindUnique,
  mockAuditCreate,
  mockDonationFindMany,
  mockDonationFindFirst,
  mockSponsorshipFindMany,
  mockSponsorshipFindFirst,
  mockRescueFindMany,
  mockRescueFindUnique,
  mockRescueCreate,
  mockAdoptionFindMany,
  mockContactCreate,
  mockFundraiserFindMany,
} = vi.hoisted(() => ({
  mockCookieGet: vi.fn(),
  mockSessionFindUnique: vi.fn(),
  mockAuditCreate: vi.fn(),
  mockDonationFindMany: vi.fn(),
  mockDonationFindFirst: vi.fn(),
  mockSponsorshipFindMany: vi.fn(),
  mockSponsorshipFindFirst: vi.fn(),
  mockRescueFindMany: vi.fn(),
  mockRescueFindUnique: vi.fn(),
  mockRescueCreate: vi.fn(),
  mockAdoptionFindMany: vi.fn(),
  mockContactCreate: vi.fn(),
  mockFundraiserFindMany: vi.fn(),
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
    donation: { findMany: mockDonationFindMany, findFirst: mockDonationFindFirst },
    sponsorship: { findMany: mockSponsorshipFindMany, findFirst: mockSponsorshipFindFirst },
    rescueCase: {
      findMany: mockRescueFindMany,
      findUnique: mockRescueFindUnique,
      create: mockRescueCreate,
    },
    adoptionApplication: { findMany: mockAdoptionFindMany },
    contactInquiry: { create: mockContactCreate },
    medicalFundraiser: { findMany: mockFundraiserFindMany },
  };
  return { default: client, prisma: client };
});

import { createSessionToken } from "@/lib/session-token";
import { resetRateLimitStore } from "@/lib/rate-limit";
import { generateUploadToken } from "@/lib/upload-token";
import { sendDonationReceiptEmail, sendTransactionalEmail } from "@/lib/email";
import { GET as reportsGet } from "@/app/api/reports/[type]/route";
import { GET as rescuesListGet, POST as rescueCreatePost } from "@/app/api/rescue/route";
import { GET as rescueDetailGet } from "@/app/api/rescue/[id]/route";
import { GET as rescueMapGet } from "@/app/api/rescue/map/route";
import { GET as rescueAudioFetchGet } from "@/app/api/admin/rescues/photo/[filename]/route";
import { POST as rescueAudioPost } from "@/app/api/rescue/audio/route";
import { GET as receiptVerifyGet } from "@/app/api/receipts/verify/route";
import { POST as driveRequestPost } from "@/app/api/drives/request/route";
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
    vi.stubEnv("AWS_ACCESS_KEY_ID", "");
    vi.stubEnv("AWS_SECRET_ACCESS_KEY", "");
    vi.stubEnv("AWS_ENDPOINT_URL_S3", "");
    vi.stubEnv("PRIVATE_STORAGE_BUCKET", "");
    vi.stubEnv("PRIVATE_STORAGE_ACCESS_KEY", "");
    vi.stubEnv("PRIVATE_STORAGE_SECRET_KEY", "");
    vi.stubEnv("PRIVATE_STORAGE_ENDPOINT", "");
    vi.stubEnv("PUBLIC_STORAGE_BUCKET", "");
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("GOOGLE_API_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

    // Valid PNG succeeds cleanly on rescue upload when signed token is provided
    const validPngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    const validPng = new File([validPngBuffer], "injured.png", { type: "image/png" });
    const { generateUploadToken } = await import("@/lib/upload-token");
    const validToken = generateUploadToken("127.0.0.1");

    const pngForm = new FormData();
    pngForm.append("file", validPng);
    pngForm.append("uploadToken", validToken);

    const rescuePngRes = await rescueUploadPost(
      new Request("http://localhost:3000/api/rescue/upload", {
        method: "POST",
        headers: { "x-forwarded-for": "127.0.0.1" },
        body: pngForm,
      })
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
    expect(triageJson.provider).toBe("rules");
    expect(triageJson.hotline).toBe("+91 73840 20901");
    expect(triageJson.disclaimer).toContain("not a substitute");
  });

  it("uses configured OpenAI or Gemini LLM with conversation history and falls back safely on upstream error", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test-key");
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  reply: "Keep the injured cat warm inside a towel-lined carrier.",
                  isEmergency: true,
                  title: "🚨 Trauma Stabilization",
                  steps: ["Place a clean towel gently under the cat.", "Keep away from loud traffic."],
                  warnings: ["Never administer human painkillers."],
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const openaiRes = await aiChatPost(
      new Request("http://localhost:3000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "She cannot walk properly now, what next?",
          history: [
            { sender: "user", text: "Found an injured cat near Kumarpur" },
            { sender: "bot", text: "Check if she is breathing steadily." },
          ],
        }),
      })
    );
    expect(openaiRes.status).toBe(200);
    const openaiJson = await openaiRes.json();
    expect(openaiJson.provider).toBe("openai");
    expect(openaiJson.isEmergency).toBe(true);
    expect(openaiJson.dispatchUrl).toBe("/rescue");
    expect(openaiJson.hotline).toBe("+91 73840 20901");
    expect(openaiJson.steps).toHaveLength(2);
    expect(openaiJson.reply).toContain("veterinary diagnosis");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Verify Gemini support and automatic rules fallback if Gemini fails
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("GEMINI_API_KEY", "gm-test-key");
    const geminiFallbackFetch = vi.fn().mockResolvedValueOnce(new Response("upstream error", { status: 500 }));
    vi.stubGlobal("fetch", geminiFallbackFetch);

    const fallbackRes = await aiChatPost(
      new Request("http://localhost:3000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Where is the Ayudar shelter?" }),
      })
    );
    expect(fallbackRes.status).toBe(200);
    const fallbackJson = await fallbackRes.json();
    expect(fallbackJson.provider).toBe("rules");
    expect(fallbackJson.reply).toContain("Tilabad, Kumarpur, Asansol");
  });

  it("verifies 80G receipts with masked PII, aggregates heatmap without PII, validates witness voice uploads, supports Bengali/Hindi chat & drive requests", async () => {
    // 1. Email dispatcher skips safely without throwing when RESEND_API_KEY is unset
    vi.stubEnv("RESEND_API_KEY", "");
    const emailRes = await sendTransactionalEmail({
      to: "donor@example.com",
      subject: "Test Receipt",
      html: "<p>Hello</p>",
    });
    expect(emailRes.sent).toBe(false);
    await expect(
      sendDonationReceiptEmail({
        recordType: "donation",
        recordId: "don_test",
        paymentId: "pay_test",
        donorName: "Subhamoy Banerjee",
        donorEmail: "donor@example.com",
        amount: 2500,
        purpose: "Medical Care",
        frequency: "One-time",
        pan: "ABCDE1234F",
      })
    ).resolves.toBeUndefined();

    // 2. Public 80G Verifier masks name & PAN cleanly
    mockDonationFindFirst.mockResolvedValue({
      id: "don_999",
      donorName: "Subhamoy Banerjee",
      amount: 2500,
      purpose: "Medical Treatment",
      frequency: "One-time",
      paymentStatus: "Completed",
      donorPan: "ABCDE1234F",
      razorpayPaymentId: "pay_live_999",
      createdAt: new Date("2026-06-01T12:00:00Z"),
    });

    const verifyRes = await receiptVerifyGet(
      new Request("http://localhost:3000/api/receipts/verify?ref=don_999")
    );
    expect(verifyRes.status).toBe(200);
    const verifyJson = await verifyRes.json();
    expect(verifyJson.verified).toBe(true);
    expect(verifyJson.maskedDonorName).not.toContain("Subhamoy");
    expect(verifyJson.maskedPan).toBe("AB*****4F");

    // 3. Rescue heatmap rounds coords (~0.003 grid) and never leaks PII
    mockRescueFindMany.mockResolvedValue([
      {
        animalType: "Dog",
        emergencyLevel: "Critical",
        reportedAt: new Date("2026-06-02T10:00:00Z"),
        latitude: 23.703819,
        longitude: 86.938713,
      },
      {
        animalType: "Dog",
        emergencyLevel: "Normal",
        reportedAt: new Date("2026-06-02T11:00:00Z"),
        latitude: 23.7039,
        longitude: 86.9388,
      },
    ]);
    const mapRes = await rescueMapGet();
    expect(mapRes.status).toBe(200);
    const mapJson = await mapRes.json();
    expect(mapJson.hotspots).toHaveLength(1);
    expect(mapJson.hotspots[0].count).toBe(2);
    expect(mapJson.hotspots[0].criticalCount).toBe(1);

    // 4. Witness audio upload requires upload token & rejects SVG payloads, accepts WebM magic bytes
    const badAudioForm = new FormData();
    badAudioForm.append("uploadToken", generateUploadToken("unknown"));
    badAudioForm.append(
      "audio",
      new File([new TextEncoder().encode("<svg><script>alert(1)</script></svg>")], "evil.webm", {
        type: "audio/webm",
      })
    );
    const badAudioRes = await rescueAudioPost(
      new Request("http://localhost:3000/api/rescue/audio", {
        method: "POST",
        body: badAudioForm,
      })
    );
    expect(badAudioRes.status).toBe(400);

    const webmBytes = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x00, 0x00, 0x00, 0x00]);
    const okAudioForm = new FormData();
    okAudioForm.append("uploadToken", generateUploadToken("unknown"));
    okAudioForm.append("audio", new File([webmBytes], "witness.webm", { type: "audio/webm" }));
    const okAudioRes = await rescueAudioPost(
      new Request("http://localhost:3000/api/rescue/audio", {
        method: "POST",
        body: okAudioForm,
      })
    );
    expect(okAudioRes.status).toBe(201);
    const okAudioJson = await okAudioRes.json();
    expect(okAudioJson.url).toMatch(
      /^(?:\/api\/admin\/rescues\/photo\/rescue-audio-.*\.webm|data:audio\/webm;base64,.+)$/
    );

    mockCookieGet.mockReturnValue(undefined);
    const unauthAudioGet = await rescueAudioFetchGet(
      new Request("http://localhost:3000/api/admin/rescues/photo/rescue-audio-1.webm"),
      { params: Promise.resolve({ filename: "rescue-audio-1.webm" }) }
    );
    expect(unauthAudioGet.status).toBe(401);

    // 5. Bilingual Bengali/Hindi chat fallback & locality drive request validation
    const bnChat = await aiChatPost(
      new Request("http://localhost:3000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "hello", language: "bn" }),
      })
    );
    expect(bnChat.status).toBe(200);
    expect((await bnChat.json()).reply).toContain("আয়ুদার");

    const hiChat = await aiChatPost(
      new Request("http://localhost:3000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "dog bleeding on road", language: "hi" }),
      })
    );
    expect(hiChat.status).toBe(200);
    const hiJson = await hiChat.json();
    expect(hiJson.isEmergency).toBe(true);
    expect(hiJson.reply).toContain("ताराशंकर नाग");

    mockContactCreate.mockResolvedValue({ id: "inq_drive_1" });
    const driveRes = await driveRequestPost(
      new Request("http://localhost:3000/api/drives/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coordinatorName: "Riya Chatterjee",
          phone: "+919876543210",
          email: "riya@example.com",
          wardOrLocality: "Burnpur Ward 14",
          driveType: "Anti-Rabies Camp",
          estimatedAnimals: 18,
          notes: "Evening feeding spot near market gate",
        }),
      })
    );
    expect(driveRes.status).toBe(201);
  });
});
