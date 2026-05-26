import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

  // Local SQLite file — convert relative path to absolute
  if (rawUrl.startsWith("file:")) {
    const url = rawUrl.startsWith("file:./")
      ? `file:${path.resolve(process.cwd(), rawUrl.slice(7))}`
      : rawUrl;
    const adapter = new PrismaLibSql({ url });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({ adapter } as any);
  }

  // Turso (libsql://) — requires authToken
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!authToken) {
    throw new Error("TURSO_AUTH_TOKEN is required when DATABASE_URL is a remote libsql:// URL");
  }
  const adapter = new PrismaLibSql({ url: rawUrl, authToken });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
