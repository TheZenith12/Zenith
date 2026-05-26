import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

const rawSecret = process.env.NEXTAUTH_SECRET;
if (!rawSecret) {
  // Fail loudly so this is never silently skipped in production
  throw new Error("NEXTAUTH_SECRET environment variable is not set. Add it to .env.local");
}
const SECRET = new TextEncoder().encode(rawSecret);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  const jwt = await new SignJWT({ userId, token })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set("session", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });

  return jwt;
}

// cache() deduplicates this call within a single server render:
// layout calls getSession() + dashboard page calls getSession() = only 1 DB query
export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("session")?.value;
  if (!jwt) return null;

  try {
    const { payload } = await jwtVerify(jwt, SECRET);
    const { userId, token } = payload as { userId: string; token: string };

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) return null;
    return session.user;
  } catch {
    return null;
  }
});

export async function destroySession() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("session")?.value;

  if (jwt) {
    try {
      const { payload } = await jwtVerify(jwt, SECRET);
      const { token } = payload as { token: string };
      await prisma.session.deleteMany({ where: { token } });
    } catch {}
  }

  cookieStore.delete("session");
}
