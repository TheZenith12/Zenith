import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateSecret, totpUri, totpQrUrl, verifyTotp } from "@/lib/totp";
import { sendEmail, twoFactorSetupEmail } from "@/lib/email";

// GET /api/auth/2fa — get setup info (secret + QR) for enabling 2FA
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, twoFactorEnabled: true, twoFactorSecret: true },
  });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (dbUser.twoFactorEnabled) {
    return NextResponse.json({ enabled: true });
  }

  // Generate a new temporary secret (not saved yet — only saved on confirm)
  const secret = generateSecret();
  const uri = totpUri(dbUser.email, secret);
  const qrUrl = totpQrUrl(uri);

  // Store the temp secret so the enable endpoint can retrieve it
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: secret }, // saved but twoFactorEnabled remains false
  });

  return NextResponse.json({ enabled: false, secret, qrUrl, uri });
}

// POST /api/auth/2fa  { code }  — confirm and enable 2FA
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, name: true, twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!dbUser?.twoFactorSecret) {
    return NextResponse.json({ error: "Start setup first (GET /api/auth/2fa)" }, { status: 400 });
  }
  if (dbUser.twoFactorEnabled) {
    return NextResponse.json({ error: "2FA is already enabled" }, { status: 400 });
  }

  if (!verifyTotp(dbUser.twoFactorSecret, code)) {
    return NextResponse.json({ error: "Invalid code — check your authenticator app" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true },
  });

  // Security notification
  const mail = twoFactorSetupEmail(dbUser.name || dbUser.email);
  sendEmail({ to: dbUser.email, ...mail }).catch(console.error);

  return NextResponse.json({ success: true });
}

// DELETE /api/auth/2fa  { code }  — disable 2FA (requires a valid code)
export async function DELETE(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!dbUser?.twoFactorEnabled) {
    return NextResponse.json({ error: "2FA is not enabled" }, { status: 400 });
  }

  if (!verifyTotp(dbUser.twoFactorSecret!, code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  return NextResponse.json({ success: true });
}
