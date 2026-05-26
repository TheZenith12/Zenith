import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { sendEmail, verificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per IP per hour
  const ip = getClientIp(req);
  if (!rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  try {
    const body = await req.json();
    const name     = (body.name     ?? "").trim();
    const email    = (body.email    ?? "").trim().toLowerCase();
    const password = (body.password ?? "");

    // Presence checks
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    // Length limits to prevent abuse / DoS
    if (name.length > 100) {
      return NextResponse.json({ error: "Name must be 100 characters or fewer" }, { status: 400 });
    }
    if (email.length > 254) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Format check
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Password strength: min 8 chars, at least one letter and one digit
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (!/[a-zA-Z]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one letter" }, { status: 400 });
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one number" }, { status: 400 });
    }
    if (password.length > 128) {
      return NextResponse.json({ error: "Password is too long" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const verificationToken = randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, verificationToken, verificationTokenExpiry },
    });

    // Send verification email (fire and forget — don't block registration)
    const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyUrl = `${base}/api/auth/verify/${verificationToken}`;
    const mail = verificationEmail(name, verifyUrl);
    sendEmail({ to: email, ...mail }).catch(console.error);

    // Seed demo data for new users
    const project = await prisma.project.create({
      data: {
        name: "My First Project",
        description: "Welcome to Zenith!",
        color: "#6366f1",
        userId: user.id,
      },
    });

    await prisma.task.createMany({
      data: [
        { title: "Explore the dashboard", status: "done", priority: "low", userId: user.id, projectId: project.id },
        { title: "Create your first project", status: "in_progress", priority: "medium", userId: user.id, projectId: project.id },
        { title: "Invite team members", status: "todo", priority: "high", userId: user.id, projectId: project.id },
        { title: "Set up integrations", status: "todo", priority: "medium", userId: user.id },
      ],
    });

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
