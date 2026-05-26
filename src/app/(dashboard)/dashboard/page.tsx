import { getSession } from "@/lib/auth";
import { getTaskStats, getWeeklyActivity, getUserTasks, getUserProjects } from "@/lib/data";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) return null;

  const [stats, activity, tasks, projects] = await Promise.all([
    getTaskStats(user.id),
    getWeeklyActivity(user.id),
    getUserTasks(user.id),
    getUserProjects(user.id),
  ]);

  return (
    <DashboardClient
      user={{ name: user.name || "User" }}
      stats={stats}
      activity={activity}
      tasks={tasks.slice(0, 5)}
      projects={projects.slice(0, 4)}
    />
  );
}
