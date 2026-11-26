import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { PrismaClient } from "@prisma/client";

type Row = Record<string, unknown>;

const MIGRATION_BATCH_SIZE = 50;
const TRANSACTION_TIMEOUT_MS = 120_000;
const TRANSACTION_MAX_WAIT_MS = 20_000;

function toDate(val: unknown): Date {
  if (val instanceof Date) return val;
  if (typeof val === "number") return new Date(val);
  if (typeof val === "string" && val.trim()) {
    const parsed = new Date(val);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function toNullableDate(val: unknown): Date | null {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "number") return new Date(val);
  const parsed = new Date(String(val));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toBool(val: unknown, fallback = false): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val !== 0;
  if (typeof val === "string") return val === "true" || val === "1";
  return fallback;
}

function toOptStr(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const s = String(val);
  return s.length > 0 ? s : null;
}

function readTable(db: DatabaseSync, tableName: string): Row[] {
  const exists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
    .get(tableName) as { name?: string } | undefined;

  if (!exists?.name) {
    return [];
  }
  return db.prepare(`SELECT * FROM "${tableName}"`).all() as Row[];
}

async function processInBatches<T>(
  items: T[],
  batchSize: number,
  handler: (item: T) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    for (const item of chunk) {
      await handler(item);
    }
  }
}

export interface MigrationSummary {
  dryRun: boolean;
  sqlitePath: string;
  counts: Record<string, number>;
  /**
   * AdminSession rows are intentionally NOT carried over as active production sessions
   * so admins must re-authenticate against rotated PostgreSQL credentials.
   */
  intentionallySkipped: {
    adminSessions: number;
    reason: string;
  };
}

export async function runSqliteToPostgresMigration(options: {
  sqlitePath: string;
  dryRun: boolean;
}): Promise<MigrationSummary> {
  if (!fs.existsSync(options.sqlitePath)) {
    throw new Error(`SQLite database not found at ${options.sqlitePath}`);
  }

  const sqlite = new DatabaseSync(options.sqlitePath, { readOnly: true });

  try {
    const data = {
      shelters: readTable(sqlite, "ShelterLocation"),
      animals: readTable(sqlite, "Animal"),
      rescues: readTable(sqlite, "RescueCase"),
      rescueStatuses: readTable(sqlite, "RescueCaseStatus"),
      stories: readTable(sqlite, "Story"),
      storyPhases: readTable(sqlite, "StoryPhase"),
      volunteers: readTable(sqlite, "Volunteer"),
      volunteerRoles: readTable(sqlite, "VolunteerRole"),
      volunteerAvails: readTable(sqlite, "VolunteerAvailability"),
      donations: readTable(sqlite, "Donation"),
      adoptions: readTable(sqlite, "AdoptionApplication"),
      sponsorships: readTable(sqlite, "Sponsorship"),
      medicalRecords: readTable(sqlite, "MedicalRecord"),
      vaccinations: readTable(sqlite, "Vaccination"),
      users: readTable(sqlite, "User"),
      auditLogs: readTable(sqlite, "AuditLog"),
      contacts: readTable(sqlite, "ContactInquiry"),
    };
    const adminSessions = readTable(sqlite, "AdminSession");

    const counts: Record<string, number> = Object.fromEntries(
      Object.entries(data).map(([k, rows]) => [k, rows.length])
    );

    const summary: MigrationSummary = {
      dryRun: options.dryRun,
      sqlitePath: options.sqlitePath,
      counts,
      intentionallySkipped: {
        adminSessions: adminSessions.length,
        reason:
          "Active SQLite sessions are intentionally excluded; staff must sign in cleanly in production.",
      },
    };

    if (options.dryRun) {
      return summary;
    }

    const dbUrl = process.env.DATABASE_URL || "";
    if (!dbUrl.startsWith("postgres://") && !dbUrl.startsWith("postgresql://")) {
      throw new Error(
        "DATABASE_URL must point to a valid PostgreSQL database before running live migration."
      );
    }

    const userIds = new Set(data.users.map((u) => String(u.id)));
    const prisma = new PrismaClient();
    try {
      await prisma.$transaction(
        async (tx) => {
          await processInBatches(data.shelters, MIGRATION_BATCH_SIZE, async (s) => {
            await tx.shelterLocation.upsert({
              where: { id: String(s.id) },
              update: {
                name: String(s.name),
                address: String(s.address),
                capacity: Number(s.capacity) || 0,
                type: String(s.type),
              },
              create: {
                id: String(s.id),
                name: String(s.name),
                address: String(s.address),
                capacity: Number(s.capacity) || 0,
                type: String(s.type),
                createdAt: toDate(s.createdAt),
              },
            });
          });

          await processInBatches(data.animals, MIGRATION_BATCH_SIZE, async (a) => {
            await tx.animal.upsert({
              where: { id: String(a.id) },
              update: {
                name: String(a.name),
                status: String(a.status),
                shelterLocationId: toOptStr(a.shelterLocationId),
              },
              create: {
                id: String(a.id),
                name: String(a.name),
                type: String(a.type),
                breed: String(a.breed),
                gender: String(a.gender),
                age: String(a.age),
                color: String(a.color),
                location: String(a.location),
                status: String(a.status),
                image: String(a.image),
                vaccinated: toBool(a.vaccinated),
                dewormed: toBool(a.dewormed),
                sterilized: toBool(a.sterilized),
                rescueDate: toDate(a.rescueDate),
                shelter: String(a.shelter),
                story: String(a.story),
                shelterLocationId: toOptStr(a.shelterLocationId),
                createdAt: toDate(a.createdAt),
              },
            });
          });

          await processInBatches(data.rescues, MIGRATION_BATCH_SIZE, async (rc) => {
            await tx.rescueCase.upsert({
              where: { id: String(rc.id) },
              update: { status: String(rc.status), assignedTeam: toOptStr(rc.assignedTeam) },
              create: {
                id: String(rc.id),
                animalType: String(rc.animalType),
                emergencyLevel: String(rc.emergencyLevel),
                location: String(rc.location),
                reporterName: String(rc.reporterName),
                reporterPhone: String(rc.reporterPhone),
                reporterEmail: toOptStr(rc.reporterEmail),
                photoUrl: toOptStr(rc.photoUrl),
                assignedTeam: toOptStr(rc.assignedTeam),
                status: String(rc.status),
                reportedAt: toDate(rc.reportedAt),
                description: String(rc.description),
                createdAt: toDate(rc.createdAt),
              },
            });
          });

          await processInBatches(data.rescueStatuses, MIGRATION_BATCH_SIZE, async (rs) => {
            await tx.rescueCaseStatus.upsert({
              where: { id: String(rs.id) },
              update: { done: toBool(rs.done), time: toOptStr(rs.time) },
              create: {
                id: String(rs.id),
                rescueCaseId: String(rs.rescueCaseId),
                status: String(rs.status),
                time: toOptStr(rs.time),
                done: toBool(rs.done),
                sortOrder: Number(rs.sortOrder) || 0,
              },
            });
          });

          await processInBatches(data.stories, MIGRATION_BATCH_SIZE, async (st) => {
            await tx.story.upsert({
              where: { slug: String(st.slug) },
              update: { outcome: String(st.outcome) },
              create: {
                slug: String(st.slug),
                title: String(st.title),
                subtitle: String(st.subtitle),
                animal: String(st.animal),
                animalType: String(st.animalType),
                date: toDate(st.date),
                readTime: String(st.readTime),
                coverImage: String(st.coverImage),
                outcome: String(st.outcome),
                excerpt: String(st.excerpt),
                createdAt: toDate(st.createdAt),
              },
            });
          });

          await processInBatches(data.storyPhases, MIGRATION_BATCH_SIZE, async (sp) => {
            await tx.storyPhase.upsert({
              where: { id: String(sp.id) },
              update: {},
              create: {
                id: String(sp.id),
                storySlug: String(sp.storySlug),
                phase: String(sp.phase),
                title: String(sp.title),
                description: String(sp.description),
                sortOrder: Number(sp.sortOrder) || 0,
              },
            });
          });

          await processInBatches(data.volunteers, MIGRATION_BATCH_SIZE, async (v) => {
            await tx.volunteer.upsert({
              where: { id: String(v.id) },
              update: { status: String(v.status) },
              create: {
                id: String(v.id),
                name: String(v.name),
                age: Number(v.age) || 18,
                phone: String(v.phone),
                email: String(v.email),
                location: toOptStr(v.location),
                experience: toOptStr(v.experience),
                status: String(v.status || "Pending"),
                createdAt: toDate(v.createdAt),
              },
            });
          });

          await processInBatches(data.volunteerRoles, MIGRATION_BATCH_SIZE, async (vr) => {
            await tx.volunteerRole.upsert({
              where: { id: String(vr.id) },
              update: {},
              create: {
                id: String(vr.id),
                volunteerId: String(vr.volunteerId),
                role: String(vr.role),
              },
            });
          });

          await processInBatches(data.volunteerAvails, MIGRATION_BATCH_SIZE, async (va) => {
            await tx.volunteerAvailability.upsert({
              where: { id: String(va.id) },
              update: {},
              create: {
                id: String(va.id),
                volunteerId: String(va.volunteerId),
                availability: String(va.availability),
              },
            });
          });

          await processInBatches(data.donations, MIGRATION_BATCH_SIZE, async (d) => {
            await tx.donation.upsert({
              where: { id: String(d.id) },
              update: { paymentStatus: String(d.paymentStatus) },
              create: {
                id: String(d.id),
                amount: Number(d.amount) || 0,
                currency: String(d.currency || "INR"),
                purpose: String(d.purpose),
                frequency: String(d.frequency),
                donorName: String(d.donorName),
                donorPhone: String(d.donorPhone),
                donorEmail: String(d.donorEmail),
                donorPan: toOptStr(d.donorPan),
                paymentStatus: String(d.paymentStatus || "Pending"),
                razorpayOrderId: toOptStr(d.razorpayOrderId),
                razorpayPaymentId: toOptStr(d.razorpayPaymentId),
                verifiedAt: toNullableDate(d.verifiedAt),
                failureReason: toOptStr(d.failureReason),
                createdAt: toDate(d.createdAt),
              },
            });
          });

          await processInBatches(data.adoptions, MIGRATION_BATCH_SIZE, async (ad) => {
            await tx.adoptionApplication.upsert({
              where: { id: String(ad.id) },
              update: { status: String(ad.status) },
              create: {
                id: String(ad.id),
                applicantName: String(ad.applicantName),
                age: Number(ad.age) || 18,
                phone: String(ad.phone),
                email: String(ad.email),
                address: String(ad.address),
                occupation: String(ad.occupation || ""),
                hasPets: toBool(ad.hasPets),
                petDetails: toOptStr(ad.petDetails),
                homeType: String(ad.homeType),
                familyMembers: Number(ad.familyMembers) || 1,
                reason: String(ad.reason),
                status: String(ad.status || "Pending"),
                animalId: toOptStr(ad.animalId),
                createdAt: toDate(ad.createdAt),
              },
            });
          });

          await processInBatches(data.sponsorships, MIGRATION_BATCH_SIZE, async (sp) => {
            await tx.sponsorship.upsert({
              where: { id: String(sp.id) },
              update: { paymentStatus: String(sp.paymentStatus) },
              create: {
                id: String(sp.id),
                sponsorName: String(sp.sponsorName),
                sponsorPhone: String(sp.sponsorPhone),
                sponsorEmail: String(sp.sponsorEmail),
                animalId: toOptStr(sp.animalId),
                tier: String(sp.tier),
                amount: Number(sp.amount) || 0,
                currency: String(sp.currency || "INR"),
                frequency: String(sp.frequency),
                paymentStatus: String(sp.paymentStatus || "Pending"),
                razorpayOrderId: toOptStr(sp.razorpayOrderId),
                razorpayPaymentId: toOptStr(sp.razorpayPaymentId),
                verifiedAt: toNullableDate(sp.verifiedAt),
                createdAt: toDate(sp.createdAt),
              },
            });
          });

          await processInBatches(data.medicalRecords, MIGRATION_BATCH_SIZE, async (mr) => {
            await tx.medicalRecord.upsert({
              where: { id: String(mr.id) },
              update: {},
              create: {
                id: String(mr.id),
                animalId: String(mr.animalId),
                diagnosis: String(mr.diagnosis),
                treatment: String(mr.treatment),
                cost: Number(mr.cost) || 0,
                vetName: String(mr.vetName),
                notes: toOptStr(mr.notes),
                date: toDate(mr.date),
                createdAt: toDate(mr.createdAt),
              },
            });
          });

          await processInBatches(data.vaccinations, MIGRATION_BATCH_SIZE, async (vax) => {
            await tx.vaccination.upsert({
              where: { id: String(vax.id) },
              update: {},
              create: {
                id: String(vax.id),
                animalId: String(vax.animalId),
                vaccineName: String(vax.vaccineName),
                dateAdministered: toDate(vax.dateAdministered),
                dateDue: toNullableDate(vax.dateDue),
                vetName: String(vax.vetName),
                notes: toOptStr(vax.notes),
                createdAt: toDate(vax.createdAt),
              },
            });
          });

          await processInBatches(data.users, MIGRATION_BATCH_SIZE, async (u) => {
            await tx.user.upsert({
              where: { id: String(u.id) },
              update: {},
              create: {
                id: String(u.id),
                email: String(u.email),
                name: String(u.name),
                passwordHash: String(u.passwordHash),
                role: String(u.role || "ADMIN"),
                isActive: toBool(u.isActive, true),
                lastLoginAt: toNullableDate(u.lastLoginAt),
                createdAt: toDate(u.createdAt),
              },
            });
          });

          await processInBatches(data.auditLogs, MIGRATION_BATCH_SIZE, async (log) => {
            const rawUserId = toOptStr(log.userId);
            await tx.auditLog.upsert({
              where: { id: String(log.id) },
              update: {},
              create: {
                id: String(log.id),
                userId: rawUserId && userIds.has(rawUserId) ? rawUserId : null,
                action: String(log.action),
                resource: String(log.resource),
                details: toOptStr(log.details),
                ipAddress: toOptStr(log.ipAddress),
                createdAt: toDate(log.createdAt),
              },
            });
          });

          await processInBatches(data.contacts, MIGRATION_BATCH_SIZE, async (c) => {
            await tx.contactInquiry.upsert({
              where: { id: String(c.id) },
              update: { status: String(c.status) },
              create: {
                id: String(c.id),
                name: String(c.name),
                phone: toOptStr(c.phone),
                email: String(c.email),
                subject: String(c.subject),
                message: String(c.message),
                status: String(c.status || "New"),
                adminNotes: toOptStr(c.adminNotes),
                createdAt: toDate(c.createdAt),
              },
            });
          });
        },
        {
          maxWait: TRANSACTION_MAX_WAIT_MS,
          timeout: TRANSACTION_TIMEOUT_MS,
        }
      );

      return { ...summary, dryRun: false };
    } finally {
      await prisma.$disconnect();
    }
  } finally {
    sqlite.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const sqliteIdx = args.indexOf("--sqlite");
  const sqlitePath =
    sqliteIdx >= 0 && args[sqliteIdx + 1]
      ? path.resolve(args[sqliteIdx + 1])
      : path.resolve(process.cwd(), "prisma", "dev.db");

  const summary = await runSqliteToPostgresMigration({ sqlitePath, dryRun });
  console.log(
    JSON.stringify(
      {
        mode: summary.dryRun ? "DRY_RUN" : "MIGRATED",
        sqlitePath: summary.sqlitePath,
        records: summary.counts,
        intentionallySkipped: summary.intentionallySkipped,
      },
      null,
      2
    )
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error("SQLite -> PostgreSQL migration failed:", err);
    process.exit(1);
  });
}
