import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTaskStats, getWeeklyActivity, getUserProjects } from "@/lib/data";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [stats, activity, projects] = await Promise.all([
    getTaskStats(user.id),
    getWeeklyActivity(user.id),
    getUserProjects(user.id),
  ]);

  return NextResponse.json({ stats, activity, projects });
}
