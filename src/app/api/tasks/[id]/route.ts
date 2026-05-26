import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const VALID_STATUSES   = ["todo", "in_progress", "done"] as const;
const VALID_PRIORITIES = ["low", "medium", "high"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Validate title — can be updated but not to an empty string
  if (data.title !== undefined) {
    const title = String(data.title).trim();
    if (!title) return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    if (title.length > 200) return NextResponse.json({ error: "Title must be 200 characters or fewer" }, { status: 400 });
    data.title = title;
  }

  // Validate status against allowed enum values
  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Validate priority
  if (data.priority !== undefined && !VALID_PRIORITIES.includes(data.priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }

  // Clamp description length
  if (data.description !== undefined && data.description !== null) {
    data.description = String(data.description).slice(0, 2000);
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(data.title       !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status      !== undefined && { status: data.status }),
      ...(data.priority    !== undefined && { priority: data.priority }),
      ...(data.dueDate     !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
    },
    include: { project: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
