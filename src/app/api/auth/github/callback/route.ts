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
    return NextResponse.redirect(`${base}/login?error=GitHub+нэвтрэлт+цуцлагдлаа`);
  }

  // ── CSRF: verify state matches the cookie we set ──────────────────────────
  const stateCookie = req.cookies.get("oauth_state")?.value;
  if (!stateParam || !stateCookie || stateParam !== stateCookie) {
    return NextResponse.redirect(`${base}/login?error=OAuth+state+хүчингүй`);
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${base}/api/auth/github/callback`,
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error("No access token");

    // 2. Get GitHub user info
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const ghUser = await userRes.json();

    // GitHub may hide email — fetch separately
    let email = ghUser.email as string | null;
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: "application/vnd.github+json",
        },
      });
      const emails: { email: string; primary: boolean; verified: boolean }[] = await emailRes.json();
      email = emails.find((e) => e.primary && e.verified)?.email || emails[0]?.email || null;
    }

    if (!email) throw new Error("No email from GitHub");

    const name   = ghUser.name || ghUser.login || email.split("@")[0];
    const avatar = ghUser.avatar_url || null;

    // 3. Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email, name, image: avatar } });
    } else if (avatar && !user.image) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { image: avatar, name: user.name || name },
      });
    }

    // 4. Create session
    await createSession(user.id);

    // 5. Clear state cookie and redirect
    const response = NextResponse.redirect(`${base}/dashboard`);
    response.cookies.delete("oauth_state");
    return response;
  } catch (err) {
    console.error("[github-callback]", err);
    return NextResponse.redirect(`${base}/login?error=GitHub+нэвтрэлт+амжилтгүй`);
  }
}
