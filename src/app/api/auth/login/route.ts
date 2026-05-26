import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { verifyTotp } from "@/lib/totp";
import { SignJWT } from "jose";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "");

export async function POST(req: NextRequest) {
  // Rate limit: 10 attempts per IP per 15 minutes
  const ip = getClientIp(req);
  if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait 15 minutes." },
      { status: 429, headers: { "Retry-After": "900" } }
    );
  }

  try {
    const body = await req.json();
    const email    = (body.email    ?? "").trim().toLowerCase();
    const password = body.password  ?? "";
    const twoFaCode = body.twoFaCode as string | undefined;
    const pendingToken = body.pendingToken as string | undefined;

    // ── Step 2: 2FA verification ──────────────────────────────────────────
    if (pendingToken && twoFaCode) {
      return handle2fa(pendingToken, twoFaCode);
    }

    // ── Step 1: password verification ─────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true, password: true, twoFactorEnabled: true },
    });

    // Constant-time path — always run bcrypt to prevent user enumeration via timing
    if (!user || !user.password) {
      await verifyPassword(password, "$2b$12$dummyhashpadding00000000000000000000000000000000000000");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // If 2FA is enabled, return a short-lived pending token instead of a full session
    if (user.twoFactorEnabled) {
      const pending = await new SignJWT({ userId: user.id, type: "2fa-pending" })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("5m")
        .sign(SECRET);

      return NextResponse.json({ requires2fa: true, pendingToken: pending });
    }

    // No 2FA — create session normally
    await createSession(user.id);
    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("[login]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handle2fa(pendingToken: string, code: string) {
  const { jwtVerify } = await import("jose");
  let userId: string;

  try {
    const { payload } = await jwtVerify(pendingToken, SECRET);
    if (payload.type !== "2fa-pending" || typeof payload.userId !== "string") {
      throw new Error("Invalid token");
    }
    userId = payload.userId;
  } catch {
    return NextResponse.json({ error: "Session expired — please log in again" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: "2FA not configured" }, { status: 400 });
  }

  if (!verifyTotp(user.twoFactorSecret, code)) {
    return NextResponse.json({ error: "Invalid authenticator code" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
