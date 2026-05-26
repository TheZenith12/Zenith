import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/export?format=csv|json
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const format = new URL(req.url).searchParams.get("format") || "json";

  const [tasks, projects] = await Promise.all([
    prisma.task.findMany({
      where: { userId: user.id },
      include: { project: { select: { name: true, color: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { userId: user.id },
      include: { _count: { select: { tasks: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (format === "csv") {
    const lines = [
      // Header
      ["ID", "Title", "Status", "Priority", "Project", "Due Date", "Created At"].join(","),
      // Rows
      ...tasks.map((t) =>
        [
          t.id,
          `"${(t.title || "").replace(/"/g, '""')}"`,
          t.status,
          t.priority,
          `"${(t.project?.name || "").replace(/"/g, '""')}"`,
          t.dueDate ? t.dueDate.toISOString().split("T")[0] : "",
          t.createdAt.toISOString().split("T")[0],
        ].join(",")
      ),
    ];

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="zenith-tasks-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  // Default: JSON
  const data = {
    exportedAt: new Date().toISOString(),
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      project: t.project?.name ?? null,
      dueDate: t.dueDate ?? null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      color: p.color,
      taskCount: p._count.tasks,
      createdAt: p.createdAt,
    })),
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="zenith-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
