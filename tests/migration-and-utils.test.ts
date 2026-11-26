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
import { runSqliteToPostgresMigration } from "@/scripts/migrate-sqlite-to-postgres";

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
});
