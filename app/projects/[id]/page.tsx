import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TaskCard } from "@/components/task-card";
import { generateFixPromptAction } from "@/app/actions";
import { getProjectById, listTasks } from "@/lib/data-store";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, tasks] = await Promise.all([getProjectById(id), listTasks(id)]);

  if (!project) {
    return (
      <main>
        <EmptyState title="Project not found" description="The selected project does not exist." />
      </main>
    );
  }

  const newestTask = tasks[0];
  const tasksWithGitHubIssues = tasks.filter((task) => task.github_issue_url.trim()).length;
  const tasksWithoutGitHubIssues = tasks.length - tasksWithGitHubIssues;

  return (
    <main className="space-y-6">
      <PageHeader title={project.name} description="Project detail and improvement workflow." />

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
          <div>
            <dt className="font-semibold text-slate-900">Repo URL</dt>
            <dd>{project.repo_url || "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Production URL</dt>
            <dd>{project.production_url || "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Framework</dt>
            <dd>{project.framework}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Health Score</dt>
            <dd>— Placeholder (coming soon)</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">GitHub owner/repo</dt>
            <dd>
              {project.github_owner && project.github_repo
                ? `${project.github_owner}/${project.github_repo}`
                : "Not configured"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">GitHub issue coverage</dt>
            <dd>
              {tasksWithGitHubIssues} created · {tasksWithoutGitHubIssues} pending
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/projects/${project.id}/tasks/new`}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Add Issue Manually
          </Link>

          {newestTask ? (
            <form action={generateFixPromptAction.bind(null, newestTask.id)}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
              >
                Generate Fix Prompt
              </button>
            </form>
          ) : null}

          <Link
            href="/tasks"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
          >
            View Tasks
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tasks linked to this project</h2>
        {tasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Add an issue manually to create the first improvement task."
            actionLabel="Add Issue"
            actionHref={`/projects/${project.id}/tasks/new`}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
