import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const PLAN_LIMITS: Record<string, number> = { free: 5, pro: Infinity, enterprise: Infinity };

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fullUser = await prisma.user.findUnique({ where: { id: user.id }, select: { plan: true } });
  const plan = fullUser?.plan || "free";
  const limit = PLAN_LIMITS[plan] ?? 5;

  const projectCount = await prisma.project.count({ where: { userId: user.id } });
  if (projectCount >= limit) {
    return NextResponse.json({
      error: `Free plan is limited to ${limit} projects. Upgrade to Pro for unlimited projects.`,
      limitReached: true,
      currentPlan: plan,
      limit,
    }, { status: 403 });
  }

  const { name, description, color } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const project = await prisma.project.create({
    data: { name, description, color: color || "#6366f1", userId: user.id },
    include: { _count: { select: { tasks: true } } },
  });

  return NextResponse.json(project);
}
