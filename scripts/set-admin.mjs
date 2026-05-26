import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = `file:${path.resolve(__dirname, "../dev.db")}`;

const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

const EMAIL = "zenitht35@gmail.com";
const PASSWORD = "12345678";

const hashed = await bcrypt.hash(PASSWORD, 12);

const user = await prisma.user.upsert({
  where: { email: EMAIL },
  update: { password: hashed, role: "admin" },
  create: {
    name: "Nakie",
    email: EMAIL,
    password: hashed,
    role: "admin",
  },
});

console.log(`✅ Done — ${user.email} is now admin with the new password.`);
await prisma.$disconnect();
