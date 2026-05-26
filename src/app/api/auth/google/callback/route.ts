import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");
  const stateParam = searchParams.get("state");

  if (error || !code) {
    return NextResponse.redirect(`${base}/login?error=Google+нэвтрэлт+цуцлагдлаа`);
  }

  // ── CSRF: verify state matches the cookie we set ──────────────────────────
  const stateCookie = req.cookies.get("oauth_state")?.value;
  if (!stateParam || !stateCookie || stateParam !== stateCookie) {
    return NextResponse.redirect(`${base}/login?error=OAuth+state+хүчингүй`);
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${base}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error("No access token");

    // 2. Get user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();
    const { email, name, picture } = googleUser;

    if (!email) throw new Error("No email from Google");

    // 3. Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          image: picture || null,
        },
      });
    } else if (picture && !user.image) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { image: picture, name: user.name || name },
      });
    }

    // 4. Create session
    await createSession(user.id);

    // 5. Clear state cookie and redirect
    const response = NextResponse.redirect(`${base}/dashboard`);
    response.cookies.delete("oauth_state");
    return response;
  } catch (err) {
    console.error("[google-callback]", err);
    return NextResponse.redirect(`${base}/login?error=Google+нэвтрэлт+амжилтгүй`);
  }
}
