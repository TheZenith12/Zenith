import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail, verificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

// POST /api/auth/verify — resend/send verification email
export async function POST() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, name: true, emailVerified: true },
  });

  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (dbUser.emailVerified) return NextResponse.json({ error: "Email already verified" }, { status: 400 });

  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken: token, verificationTokenExpiry: expiry },
  });

  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${base}/api/auth/verify/${token}`;
  const mail = verificationEmail(dbUser.name || dbUser.email, verifyUrl);

  await sendEmail({ to: dbUser.email, ...mail });

  return NextResponse.json({ success: true });
}
