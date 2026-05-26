import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!clientId || clientId === "your_github_client_id") {
    return NextResponse.redirect(`${base}/login?error=GitHub+OAuth+тохиргоогүй`);
  }

  // Generate random state for CSRF protection
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${base}/api/auth/github/callback`,
    scope: "user:email",
    state,
  });

  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params}`
  );

  // Store state in a short-lived HttpOnly cookie
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
