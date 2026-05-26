import { prisma } from "./prisma";
import { getSession } from "./auth";
import { cacheLife, cacheTag } from "next/cache";

export async function getCurrentUser() {
  return getSession();
}

export async function getUserTasks(userId: string) {
  "use cache";
  cacheLife("seconds");           // 5 s — task list stays fresh
  cacheTag(`tasks-${userId}`);
  return prisma.task.findMany({
    where: { userId },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserProjects(userId: string) {
  "use cache";
  cacheLife("seconds");
  cacheTag(`projects-${userId}`);
  return prisma.project.findMany({
    where: { userId },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTaskStats(userId: string) {
  "use cache";
  cacheLife("seconds");
  cacheTag(`task-stats-${userId}`);
  const [total, completed, inProgress, overdue] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: "done" } }),
    prisma.task.count({ where: { userId, status: "in_progress" } }),
    prisma.task.count({
      where: {
        userId,
        status: { not: "done" },
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  return { total, completed, inProgress, overdue };
}

export async function getWeeklyActivity(userId: string) {
  "use cache";
  cacheLife("minutes");           // weekly chart refreshes every minute
  cacheTag(`weekly-${userId}`);

  // Build the 7-day window — oldest day first
  const windows: { label: string; start: Date; end: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    windows.push({
      label: start.toLocaleDateString("en-US", { weekday: "short" }),
      start,
      end,
    });
  }

  // Single query — fetch all relevant "done" tasks updated in the last 7 days
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      status: "done",
      updatedAt: { gte: windows[0].start },
    },
    select: { updatedAt: true },
  });

  // Group in-memory by day window (O(n) — no extra DB round-trips)
  return windows.map(({ label, start, end }) => ({
    day: label,
    tasks: tasks.filter((t) => t.updatedAt >= start && t.updatedAt < end).length,
  }));
}
