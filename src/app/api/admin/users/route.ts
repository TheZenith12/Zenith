import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      plan: true, planStatus: true, planRequested: true, planRequestedAt: true,
      createdAt: true,
      _count: { select: { tasks: true, projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
