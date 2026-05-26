import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { sendEmail, passwordChangedEmail } from "@/lib/email";

// PUT /api/auth/password  { currentPassword, newPassword }
export async function PUT(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 5 attempts per IP per 15 min
  if (!rateLimit(`pw-change:${getClientIp(req)}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Both fields are required" }, { status: 400 });
  }

  // Fetch the current password hash from DB
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { password: true, name: true, email: true } });

  if (!dbUser?.password) {
    return NextResponse.json({ error: "This account uses OAuth login — no password to change" }, { status: 400 });
  }

  const valid = await verifyPassword(currentPassword, dbUser.password);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  // Validate new password
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }
  if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return NextResponse.json({ error: "New password must contain letters and numbers" }, { status: 400 });
  }
  if (newPassword.length > 128) {
    return NextResponse.json({ error: "New password is too long" }, { status: 400 });
  }

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  // Send security notification email (fire and forget)
  const mail = passwordChangedEmail(dbUser.name || dbUser.email);
  sendEmail({ to: dbUser.email, ...mail }).catch(console.error);

  return NextResponse.json({ success: true });
}
