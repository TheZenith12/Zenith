import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT /api/admin/users/plan  { userId, plan, action: "approve" | "reject" | "set" }
export async function PUT(req: NextRequest) {
  const admin = await getSession();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, plan, action } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  if (action === "approve" || action === "set") {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { plan: plan || "pro", planStatus: "active", planRequested: null, planRequestedAt: null },
      select: { id: true, name: true, email: true, plan: true, planStatus: true },
    });
    return NextResponse.json(updated);
  }

  if (action === "reject") {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { planStatus: "active", planRequested: null, planRequestedAt: null },
      select: { id: true, name: true, email: true, plan: true, planStatus: true },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
