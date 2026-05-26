/**
 * Next.js middleware — server-side auth guard.
 * Runs on the Edge before any page renders.
 * Lightweight JWT check (no DB round-trip) for fast redirects.
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Use empty string fallback so proxy loads during build; secret is checked at request time
const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "");

/** Routes that require a valid session */
const PROTECTED = [
  "/dashboard",
  "/tasks",
  "/projects",
  "/analytics",
  "/settings",
  "/calendar",
  "/team",
  "/reports",
  "/admin",
];

/** Routes that authenticated users should skip (redirect to dashboard) */
const AUTH_ONLY = ["/login", "/register"];

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const jwt = req.cookies.get("session")?.value;
  if (!jwt) return false;
  try {
    await jwtVerify(jwt, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const authed = await isAuthenticated(req);

  // Redirect unauthenticated users away from protected pages
  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (!authed) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login/register
  if (AUTH_ONLY.includes(pathname) && authed) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/projects/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/calendar/:path*",
    "/team/:path*",
    "/reports/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
