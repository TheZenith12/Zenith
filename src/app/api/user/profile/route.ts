import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidImageSource(str: string): boolean {
  // Accept https/http URLs
  try {
    const u = new URL(str);
    if (u.protocol === "https:" || u.protocol === "http:") return true;
  } catch { /* not a URL */ }
  // Accept base64-encoded images (for avatar upload from file input)
  if (/^data:image\/(jpeg|png|gif|webp);base64,[A-Za-z0-9+/]+=*$/.test(str)) return true;
  return false;
}

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, username: true, jobTitle: true, bio: true, image: true, role: true, emailVerified: true },
  });

  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, email, username, jobTitle, bio, image } = body;

  // Validate field lengths
  if (name !== undefined && String(name).length > 100) {
    return NextResponse.json({ error: "Name must be 100 characters or fewer" }, { status: 400 });
  }
  if (username !== undefined && String(username).length > 30) {
    return NextResponse.json({ error: "Username must be 30 characters or fewer" }, { status: 400 });
  }
  if (username !== undefined && username && !/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return NextResponse.json({ error: "Username may only contain letters, numbers, underscores, dots and hyphens" }, { status: 400 });
  }
  if (jobTitle !== undefined && String(jobTitle).length > 100) {
    return NextResponse.json({ error: "Job title must be 100 characters or fewer" }, { status: 400 });
  }
  if (bio !== undefined && String(bio).length > 500) {
    return NextResponse.json({ error: "Bio must be 500 characters or fewer" }, { status: 400 });
  }

  // Validate email format if changing
  if (email && email !== user.email) {
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  // Validate image — must be https/http URL or a base64 image (for file upload)
  if (image !== undefined && image !== null && image !== "") {
    if (!isValidImageSource(String(image))) {
      return NextResponse.json({ error: "Image must be a valid URL or image file" }, { status: 400 });
    }
    // Cap base64 payload at ~3MB (covers 2MB file with base64 overhead)
    if (String(image).length > 4_200_000) {
      return NextResponse.json({ error: "Image file is too large (max 2MB)" }, { status: 400 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name     !== undefined && { name:     String(name).trim() }),
      ...(email    !== undefined && { email:    String(email).trim().toLowerCase() }),
      ...(username !== undefined && { username: username ? String(username).trim() : null }),
      ...(jobTitle !== undefined && { jobTitle: jobTitle ? String(jobTitle).trim() : null }),
      ...(bio      !== undefined && { bio:      bio      ? String(bio).trim()      : null }),
      ...(image    !== undefined && { image:    image    ? String(image).trim()    : null }),
    },
    select: { name: true, email: true, username: true, jobTitle: true, bio: true, image: true },
  });

  return NextResponse.json(updated);
}
