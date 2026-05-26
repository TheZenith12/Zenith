import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// One-time endpoint: makes the current logged-in user an admin
// if no admin exists yet in the system
export async function POST() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login first" }, { status: 401 });

  const existingAdmin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (existingAdmin && existingAdmin.id !== user.id) {
    return NextResponse.json({ error: "An admin already exists", admin: existingAdmin.email }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: "admin" },
    select: { name: true, email: true, role: true },
  });

  return NextResponse.json({ success: true, user: updated });
}
