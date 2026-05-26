import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/auth/verify/[token] — confirm email verification link
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const { token } = await params;

  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
    select: { id: true, verificationTokenExpiry: true },
  });

  if (!user) {
    return NextResponse.redirect(`${base}/dashboard?verified=invalid`);
  }

  if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
    return NextResponse.redirect(`${base}/dashboard?verified=expired`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  return NextResponse.redirect(`${base}/dashboard?verified=success`);
}
