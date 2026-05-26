import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL || "file:dev.db";

  // Turso cloud (libsql://) — needs authToken
  if (!url.startsWith("file:")) {
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!authToken) {
      throw new Error("TURSO_AUTH_TOKEN is required when DATABASE_URL is a remote libsql:// URL");
    }
    const adapter = new PrismaLibSql({ url, authToken });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({ adapter } as any);
  }

  // Local SQLite file
  const adapter = new PrismaLibSql({ url });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
