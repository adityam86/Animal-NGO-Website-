import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL;
  if (process.env.VERCEL && (!configured || configured.startsWith("file:"))) {
    const tmpDb = "/tmp/dev.db";
    if (!fs.existsSync(tmpDb)) {
      const bundledDb = path.join(process.cwd(), "prisma", "dev.db");
      if (fs.existsSync(bundledDb)) {
        try {
          fs.copyFileSync(bundledDb, tmpDb);
        } catch (err) {
          console.warn("Could not copy bundled SQLite db to /tmp:", err);
        }
      }
    }
    if (fs.existsSync(tmpDb)) {
      return `file:${tmpDb}`;
    }
  }
  return configured || "file:./dev.db";
}

const resolvedUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = resolvedUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: { url: resolvedUrl },
      },
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
