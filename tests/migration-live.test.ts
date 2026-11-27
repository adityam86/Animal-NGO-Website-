import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const mockUpsertFns = vi.hoisted(() => ({
  shelterLocation: vi.fn(async () => ({})),
  animal: vi.fn(async () => ({})),
  rescueCase: vi.fn(async () => ({})),
  rescueCaseStatus: vi.fn(async () => ({})),
  story: vi.fn(async () => ({})),
  storyPhase: vi.fn(async () => ({})),
  volunteer: vi.fn(async () => ({})),
  volunteerRole: vi.fn(async () => ({})),
  volunteerAvailability: vi.fn(async () => ({})),
  donation: vi.fn(async () => ({})),
  adoptionApplication: vi.fn(async () => ({})),
  sponsorship: vi.fn(async () => ({})),
  medicalRecord: vi.fn(async () => ({})),
  vaccination: vi.fn(async () => ({})),
  user: vi.fn(async () => ({})),
  auditLog: vi.fn(async () => ({})),
  contactInquiry: vi.fn(async () => ({})),
  adminSessionUpsert: vi.fn(async () => ({})),
  transaction: vi.fn(),
  disconnect: vi.fn(async () => undefined),
}));

vi.mock("@prisma/client", () => {
  const txClient = {
    shelterLocation: { upsert: mockUpsertFns.shelterLocation },
    animal: { upsert: mockUpsertFns.animal },
    rescueCase: { upsert: mockUpsertFns.rescueCase },
    rescueCaseStatus: { upsert: mockUpsertFns.rescueCaseStatus },
    story: { upsert: mockUpsertFns.story },
    storyPhase: { upsert: mockUpsertFns.storyPhase },
    volunteer: { upsert: mockUpsertFns.volunteer },
    volunteerRole: { upsert: mockUpsertFns.volunteerRole },
    volunteerAvailability: { upsert: mockUpsertFns.volunteerAvailability },
    donation: { upsert: mockUpsertFns.donation },
    adoptionApplication: { upsert: mockUpsertFns.adoptionApplication },
    sponsorship: { upsert: mockUpsertFns.sponsorship },
    medicalRecord: { upsert: mockUpsertFns.medicalRecord },
    vaccination: { upsert: mockUpsertFns.vaccination },
    user: { upsert: mockUpsertFns.user },
    auditLog: { upsert: mockUpsertFns.auditLog },
    contactInquiry: { upsert: mockUpsertFns.contactInquiry },
    adminSession: { upsert: mockUpsertFns.adminSessionUpsert },
  };

  class MockPrismaClient {
    shelterLocation = txClient.shelterLocation;
    animal = txClient.animal;
    rescueCase = txClient.rescueCase;
    rescueCaseStatus = txClient.rescueCaseStatus;
    story = txClient.story;
    storyPhase = txClient.storyPhase;
    volunteer = txClient.volunteer;
    volunteerRole = txClient.volunteerRole;
    volunteerAvailability = txClient.volunteerAvailability;
    donation = txClient.donation;
    adoptionApplication = txClient.adoptionApplication;
    sponsorship = txClient.sponsorship;
    medicalRecord = txClient.medicalRecord;
    vaccination = txClient.vaccination;
    user = txClient.user;
    auditLog = txClient.auditLog;
    contactInquiry = txClient.contactInquiry;
    adminSession = txClient.adminSession;

    async $transaction<T>(cb: (tx: typeof txClient) => Promise<T>, opts?: unknown): Promise<T> {
      mockUpsertFns.transaction(cb, opts);
      return cb(txClient);
    }

    async $disconnect(): Promise<void> {
      await mockUpsertFns.disconnect();
    }
  }

  return {
    PrismaClient: MockPrismaClient,
  };
});

import { runSqliteToPostgresMigration } from "@/scripts/migrate-sqlite-to-postgres";

function createFullMockSqliteDb(): { tmpDir: string; dbPath: string } {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ayudar-full-mig-"));
  const dbPath = path.join(tmpDir, "source.db");
  const db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE "User" ("id" TEXT PRIMARY KEY, "email" TEXT, "name" TEXT, "passwordHash" TEXT, "role" TEXT, "isActive" INTEGER, "lastLoginAt" TEXT, "createdAt" TEXT);
    CREATE TABLE "AdminSession" ("id" TEXT PRIMARY KEY, "jti" TEXT, "userId" TEXT, "expiresAt" TEXT, "revokedAt" TEXT, "createdAt" TEXT);
    CREATE TABLE "AuditLog" ("id" TEXT PRIMARY KEY, "userId" TEXT, "action" TEXT, "resource" TEXT, "details" TEXT, "ipAddress" TEXT, "createdAt" TEXT);
    CREATE TABLE "ContactInquiry" ("id" TEXT PRIMARY KEY, "name" TEXT, "phone" TEXT, "email" TEXT, "subject" TEXT, "message" TEXT, "status" TEXT, "adminNotes" TEXT, "createdAt" TEXT);
    CREATE TABLE "ShelterLocation" ("id" TEXT PRIMARY KEY, "name" TEXT, "address" TEXT, "capacity" INTEGER, "type" TEXT, "createdAt" TEXT);
    CREATE TABLE "Animal" ("id" TEXT PRIMARY KEY, "name" TEXT, "type" TEXT, "breed" TEXT, "gender" TEXT, "age" TEXT, "color" TEXT, "location" TEXT, "status" TEXT, "image" TEXT, "vaccinated" INTEGER, "dewormed" INTEGER, "sterilized" INTEGER, "rescueDate" TEXT, "shelter" TEXT, "story" TEXT, "shelterLocationId" TEXT, "createdAt" TEXT);
    CREATE TABLE "RescueCase" ("id" TEXT PRIMARY KEY, "animalType" TEXT, "emergencyLevel" TEXT, "location" TEXT, "reporterName" TEXT, "reporterPhone" TEXT, "reporterEmail" TEXT, "photoUrl" TEXT, "assignedTeam" TEXT, "status" TEXT, "reportedAt" TEXT, "description" TEXT, "createdAt" TEXT);
    CREATE TABLE "RescueCaseStatus" ("id" TEXT PRIMARY KEY, "rescueCaseId" TEXT, "status" TEXT, "time" TEXT, "done" INTEGER, "sortOrder" INTEGER);
    CREATE TABLE "Story" ("slug" TEXT PRIMARY KEY, "title" TEXT, "subtitle" TEXT, "animal" TEXT, "animalType" TEXT, "date" TEXT, "readTime" TEXT, "coverImage" TEXT, "outcome" TEXT, "excerpt" TEXT, "createdAt" TEXT);
    CREATE TABLE "StoryPhase" ("id" TEXT PRIMARY KEY, "storySlug" TEXT, "phase" TEXT, "title" TEXT, "description" TEXT, "sortOrder" INTEGER);
    CREATE TABLE "Volunteer" ("id" TEXT PRIMARY KEY, "name" TEXT, "age" INTEGER, "phone" TEXT, "email" TEXT, "location" TEXT, "experience" TEXT, "status" TEXT, "createdAt" TEXT);
    CREATE TABLE "VolunteerRole" ("id" TEXT PRIMARY KEY, "volunteerId" TEXT, "role" TEXT);
    CREATE TABLE "VolunteerAvailability" ("id" TEXT PRIMARY KEY, "volunteerId" TEXT, "availability" TEXT);
    CREATE TABLE "Donation" ("id" TEXT PRIMARY KEY, "amount" REAL, "currency" TEXT, "purpose" TEXT, "frequency" TEXT, "donorName" TEXT, "donorPhone" TEXT, "donorEmail" TEXT, "donorPan" TEXT, "paymentStatus" TEXT, "razorpayOrderId" TEXT, "razorpayPaymentId" TEXT, "verifiedAt" TEXT, "failureReason" TEXT, "createdAt" TEXT);
    CREATE TABLE "AdoptionApplication" ("id" TEXT PRIMARY KEY, "applicantName" TEXT, "age" INTEGER, "phone" TEXT, "email" TEXT, "address" TEXT, "occupation" TEXT, "hasPets" INTEGER, "petDetails" TEXT, "homeType" TEXT, "familyMembers" INTEGER, "reason" TEXT, "status" TEXT, "animalId" TEXT, "createdAt" TEXT);
    CREATE TABLE "Sponsorship" ("id" TEXT PRIMARY KEY, "sponsorName" TEXT, "sponsorPhone" TEXT, "sponsorEmail" TEXT, "animalId" TEXT, "tier" TEXT, "amount" REAL, "currency" TEXT, "frequency" TEXT, "paymentStatus" TEXT, "razorpayOrderId" TEXT, "razorpayPaymentId" TEXT, "verifiedAt" TEXT, "createdAt" TEXT);
    CREATE TABLE "MedicalRecord" ("id" TEXT PRIMARY KEY, "animalId" TEXT, "diagnosis" TEXT, "treatment" TEXT, "cost" REAL, "vetName" TEXT, "notes" TEXT, "date" TEXT, "createdAt" TEXT);
    CREATE TABLE "Vaccination" ("id" TEXT PRIMARY KEY, "animalId" TEXT, "vaccineName" TEXT, "dateAdministered" TEXT, "dateDue" TEXT, "vetName" TEXT, "notes" TEXT, "createdAt" TEXT);

    INSERT INTO "User" VALUES ('u1', 'staff@ayudar.org', 'Staff', 'scrypt$a$b', 'ADMIN', 1, NULL, '2026-01-01T00:00:00Z');
    INSERT INTO "AdminSession" VALUES ('s1', 'jti_old', 'u1', '2027-01-01T00:00:00Z', NULL, '2026-01-01T00:00:00Z');
    INSERT INTO "AuditLog" VALUES ('log_1', 'u1', 'LOGIN_SUCCESS', '/api/login', 'ok', '127.0.0.1', '2026-01-01T00:00:00Z');
    INSERT INTO "AuditLog" VALUES ('log_orphan', 'deleted_user', 'SYSTEM', '/api/webhooks', 'orphan user safe', '127.0.0.1', '2026-01-01T00:00:00Z');
    INSERT INTO "ContactInquiry" VALUES ('c1', 'Ravi', '+919876543210', 'ravi@example.com', 'Visit', 'Hello team', 'New', NULL, '2026-01-01T00:00:00Z');
    INSERT INTO "ShelterLocation" VALUES ('sh1', 'Main', 'Raniganj', 50, 'Dogs', '2026-01-01T00:00:00Z');
    INSERT INTO "Animal" VALUES ('a1', 'Bruno', 'Dog', 'Pariah', 'Male', '2y', 'Brown', 'NH19', 'Available for Adoption', '/images/dog_bruno.jpg', 1, 1, 1, '2026-01-01T00:00:00Z', 'Main', 'Story', 'sh1', '2026-01-01T00:00:00Z');
    INSERT INTO "RescueCase" VALUES ('r1', 'Dog', 'High', 'Road', 'Caller', '9999999999', NULL, NULL, 'Team 1', 'Reported', '2026-01-01T00:00:00Z', 'Limping', '2026-01-01T00:00:00Z');
    INSERT INTO "RescueCaseStatus" VALUES ('rs1', 'r1', 'Reported', '10:00', 1, 0);
    INSERT INTO "Story" VALUES ('bruno-story', 'Bruno', 'Sub', 'Bruno', 'Dog', '2026-01-01T00:00:00Z', '3m', '/images/dog_bruno.jpg', 'Adopted', 'Excerpt', '2026-01-01T00:00:00Z');
    INSERT INTO "StoryPhase" VALUES ('sp1', 'bruno-story', 'Before', 'Before Rescue', 'Hurt', 0);
    INSERT INTO "Volunteer" VALUES ('v1', 'Ananya', 22, '9876500000', 'ananya@example.com', 'Raniganj', 'First aid', 'Approved', '2026-01-01T00:00:00Z');
    INSERT INTO "VolunteerRole" VALUES ('vr1', 'v1', 'Rescue');
    INSERT INTO "VolunteerAvailability" VALUES ('va1', 'v1', 'Weekends');
    INSERT INTO "Donation" VALUES ('d1', 1000, 'INR', 'Medical', 'One-time', 'Donor', '9876500001', 'd@example.com', NULL, 'Completed', 'ord_1', 'pay_1', '2026-01-01T00:00:00Z', NULL, '2026-01-01T00:00:00Z');
    INSERT INTO "AdoptionApplication" VALUES ('ad1', 'Meera', 29, '9876500002', 'm@example.com', 'Asansol', 'Teacher', 0, NULL, 'House', 3, 'Love dogs', 'Pending', 'a1', '2026-01-01T00:00:00Z');
    INSERT INTO "Sponsorship" VALUES ('spon1', 'Karan', '9876500003', 'k@example.com', 'a1', 'Food - 500', 500, 'INR', 'Monthly', 'Completed', 'ord_2', 'pay_2', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');
    INSERT INTO "MedicalRecord" VALUES ('mr1', 'a1', 'Fracture', 'Splint', 1200, 'Dr. Sen', 'Healing', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');
    INSERT INTO "Vaccination" VALUES ('vax1', 'a1', 'Anti-Rabies', '2026-01-01T00:00:00Z', NULL, 'Dr. Sen', 'Batch 1', '2026-01-01T00:00:00Z');
  `);

  db.close();
  return { tmpDir, dbPath };
}

describe("Full 18-Model SQLite-to-PostgreSQL Migration & Idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/ayudar_test");
  });

  it("migrates all 17 content/audit models cleanly, nulls dangling audit userIds, skips AdminSession, and uses extended transaction timeout", async () => {
    const { tmpDir, dbPath } = createFullMockSqliteDb();

    try {
      const result = await runSqliteToPostgresMigration({ sqlitePath: dbPath, dryRun: false });

      expect(result.dryRun).toBe(false);
      expect(result.intentionallySkipped.adminSessions).toBe(1);
      expect(mockUpsertFns.adminSessionUpsert).not.toHaveBeenCalled();

      // Transaction timeout must be safely configured beyond default 5s
      expect(mockUpsertFns.transaction).toHaveBeenCalledWith(expect.any(Function), {
        maxWait: 20000,
        timeout: 120000,
      });

      // Verify every non-session model upserted cleanly
      expect(mockUpsertFns.shelterLocation).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.animal).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.rescueCase).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.rescueCaseStatus).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.story).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.storyPhase).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.volunteer).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.volunteerRole).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.volunteerAvailability).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.donation).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.adoptionApplication).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.sponsorship).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.medicalRecord).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.vaccination).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.user).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.contactInquiry).toHaveBeenCalledTimes(1);
      expect(mockUpsertFns.auditLog).toHaveBeenCalledTimes(2);

      // Orphan userId on auditLog is safely nulled so FK constraints never fail
      expect(mockUpsertFns.auditLog).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ where: { id: "log_1" }, create: expect.objectContaining({ userId: "u1" }) })
      );
      expect(mockUpsertFns.auditLog).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ where: { id: "log_orphan" }, create: expect.objectContaining({ userId: null }) })
      );

      // Rerunning migration uses identical idempotent upserts (`where: { id/slug }`)
      await runSqliteToPostgresMigration({ sqlitePath: dbPath, dryRun: false });
      expect(mockUpsertFns.animal).toHaveBeenCalledTimes(2);
      expect(mockUpsertFns.animal).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { id: "a1" } })
      );
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
