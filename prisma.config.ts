import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function resolveUrl(rawUrl: string): string {
  if (rawUrl.startsWith("file:./")) {
    return `file:${path.resolve(process.cwd(), rawUrl.slice(7))}`;
  }
  return rawUrl;
}

function getAdapter() {
  const rawUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const url = resolveUrl(rawUrl);

  if (rawUrl.startsWith("file:")) {
    return new PrismaLibSql({ url });
  }

  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!authToken) throw new Error("TURSO_AUTH_TOKEN is required for remote libsql:// connections");
  return new PrismaLibSql({ url, authToken });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: resolveUrl(process.env.DATABASE_URL || "file:./prisma/dev.db"),
    adapter: getAdapter(),
  },
});
