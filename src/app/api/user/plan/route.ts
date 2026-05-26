import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true, planStatus: true, planRequested: true, planRequestedAt: true, _count: { select: { projects: true } } },
  });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestedPlan } = await req.json();
  if (!["pro", "enterprise"].includes(requestedPlan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { planRequested: requestedPlan, planRequestedAt: new Date(), planStatus: "pending" },
    select: { plan: true, planStatus: true, planRequested: true },
  });

  return NextResponse.json(updated);
}
