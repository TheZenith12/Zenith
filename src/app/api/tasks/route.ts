import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const VALID_PRIORITIES = ["low", "medium", "high"] as const;

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("project");

  const tasks = await prisma.task.findMany({
    where: { userId: user.id, ...(projectId ? { projectId } : {}) },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks, {
    headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=30" },
  });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const title       = (body.title ?? "").trim();
  const description = body.description ? String(body.description).slice(0, 2000) : undefined;
  const priority    = body.priority ?? "medium";
  const dueDate     = body.dueDate;
  const projectId   = body.projectId;

  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
  if (title.length > 200) return NextResponse.json({ error: "Title must be 200 characters or fewer" }, { status: 400 });

  if (!VALID_PRIORITIES.includes(priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }

  // If a projectId is provided, ensure it belongs to this user
  if (projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId: projectId || null,
      userId: user.id,
    },
    include: { project: true },
  });

  return NextResponse.json(task);
}
