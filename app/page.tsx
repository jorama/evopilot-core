import { DashboardCard } from "@/components/dashboard-card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { TaskCard } from "@/components/task-card";
import { getDashboardSummary, getRecentTasks, listProjects } from "@/lib/data-store";

export default async function DashboardPage() {
  const [summary, recentTasks, projects] = await Promise.all([
    getDashboardSummary(),
    getRecentTasks(6),
    listProjects(),
  ]);

  return (
    <main className="space-y-6">
      <PageHeader
        title="Founder HQ"
        description="Monitor issues, generate safe fix prompts, and prepare PR-ready work."
        actionLabel="Add MVP"
        actionHref="/projects/new"
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Connected MVPs" value={summary.connectedMVPs} />
        <DashboardCard title="Open Issues" value={summary.openIssues} />
        <DashboardCard title="Fix Prompts Generated" value={summary.fixPromptsGenerated} />
        <DashboardCard title="PRs Ready" value={summary.prsReady} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Improvement Tasks</h2>
        {recentTasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Create your first improvement task to start the autopilot loop."
            actionLabel="Add MVP"
            actionHref="/projects/new"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recentTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Connected MVPs</h2>
        {projects.length === 0 ? (
          <EmptyState
            title="No MVPs connected"
            description="Add an MVP project to begin tracking issues and fixes."
            actionLabel="Add MVP"
            actionHref="/projects/new"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
