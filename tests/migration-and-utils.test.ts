import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  sanitizeCsvCell,
  sanitizePlainText,
  validateImageSignature,
} from "@/lib/security";
import { checkRateLimit, resetRateLimitStore } from "@/lib/rate-limit";
import {
  runSqliteToPostgresMigration,
  toDate,
  toNullableDate,
} from "@/scripts/migrate-sqlite-to-postgres";

describe("Security Utilities & SQLite-to-PostgreSQL Migration Verification", () => {
  it("sanitizes plain text, neutralizes CSV formulas, and enforces sliding rate limits", () => {
    expect(sanitizePlainText("  <script>alert(1)</script>Hello  ")).toBe("scriptalert(1)/scriptHello");
    expect(sanitizeCsvCell("=1+1")).toBe(`"'=1+1"`);
    expect(sanitizeCsvCell("+SUM(A1:A2)")).toBe(`"'+SUM(A1:A2)"`);
    expect(sanitizeCsvCell('Normal "Text"')).toBe(`"Normal ""Text"""`);

    resetRateLimitStore();
    expect(checkRateLimit("k", 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit("k", 2, 60_000).allowed).toBe(true);
    const blocked = checkRateLimit("k", 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it("validates image magic bytes cleanly and blocks masked SVG scripts", () => {
    const jpgBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    expect(validateImageSignature(jpgBuf, "image/jpeg", "photo.jpg")).toEqual({
      mimeType: "image/jpeg",
      extension: "jpg",
    });

    const svgMask = Buffer.from('<svg onload="alert(1)"><rect/></svg>', "utf8");
    expect(validateImageSignature(svgMask, "image/png", "fake.png")).toBeNull();
  });

  it("reads an isolated SQLite database accurately during dry-run migration verification", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ayudar-mig-"));
    const dbPath = path.join(tmpDir, "test.db");

    const db = new DatabaseSync(dbPath);
    db.exec(`
      CREATE TABLE "Animal" ("id" TEXT PRIMARY KEY, "name" TEXT);
      CREATE TABLE "Donation" ("id" TEXT PRIMARY KEY, "amount" REAL);
      INSERT INTO "Animal" ("id", "name") VALUES ('ani_1', 'Bruno'), ('ani_2', 'Lakshmi');
      INSERT INTO "Donation" ("id", "amount") VALUES ('don_1', 500);
    `);
    db.close();

    try {
      const summary = await runSqliteToPostgresMigration({
        sqlitePath: dbPath,
        dryRun: true,
      });

      expect(summary.dryRun).toBe(true);
      expect(summary.counts.animals).toBe(2);
      expect(summary.counts.donations).toBe(1);
      expect(summary.counts.rescues).toBe(0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("strictly converts dates without silent replacement, preserves nullable dates, and aborts on corrupt records", () => {
    // 1. Valid conversions
    const isoDate = toDate("2026-06-15T12:00:00.000Z", "Animal 1");
    expect(isoDate).toBeInstanceOf(Date);
    expect(isoDate.toISOString()).toBe("2026-06-15T12:00:00.000Z");

    const epochNum = 1718452800000;
    const fromEpoch = toDate(epochNum, "Rescue 1");
    expect(fromEpoch.getTime()).toBe(epochNum);

    const existingDate = new Date("2026-01-01T00:00:00Z");
    expect(toDate(existingDate)).toBe(existingDate);

    // 2. Invalid dates MUST throw and report the record context (NEVER silently replace with new Date())
    expect(() => toDate("corrupted-date-xyz", "Animal record ani_99")).toThrow(
      /Invalid or missing date 'corrupted-date-xyz' encountered in Animal record ani_99/
    );
    expect(() => toDate(null, "Donation record don_42")).toThrow(
      /Invalid or missing date 'null' encountered in Donation record don_42/
    );
    expect(() => toDate(undefined, "Story story_1")).toThrow(
      /Invalid or missing date 'undefined'/
    );
    expect(() => toDate("", "User u1")).toThrow(/Invalid or missing date ''/);

    // 3. Nullable dates: empty/null/undefined return null cleanly
    expect(toNullableDate(null, "Donation verifiedAt")).toBeNull();
    expect(toNullableDate(undefined, "Donation verifiedAt")).toBeNull();
    expect(toNullableDate("", "Donation verifiedAt")).toBeNull();
    expect(toNullableDate("   ", "Donation verifiedAt")).toBeNull();

    // 4. Nullable dates: valid dates convert accurately
    const validNullDate = toNullableDate("2026-07-20T18:30:00Z", "Vaccination dateDue");
    expect(validNullDate).toBeInstanceOf(Date);
    expect(validNullDate?.toISOString()).toBe("2026-07-20T18:30:00.000Z");

    // 5. Nullable dates: invalid non-null value MUST throw and abort
    expect(() => toNullableDate("garbage-date-value", "Vaccination vax_1")).toThrow(
      /Invalid non-null date 'garbage-date-value' encountered in nullable field of Vaccination vax_1/
    );
  });
});
