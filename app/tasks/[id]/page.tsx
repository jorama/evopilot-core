import { generateFixPromptAction, updateTaskStatusAction } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SeverityBadge } from "@/components/severity-badge";
import { StatusBadge } from "@/components/status-badge";
import { TASK_STATUS_OPTIONS } from "@/lib/constants";
import { getProjectById, getTaskById } from "@/lib/data-store";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    return (
      <main>
        <EmptyState title="Task not found" description="The selected task does not exist." />
      </main>
    );
  }

  const project = await getProjectById(task.project_id);

  return (
    <main className="space-y-6">
      <PageHeader title={task.title} description="Task detail and generated repair prompt." />

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SeverityBadge severity={task.severity} />
          <StatusBadge status={task.status} />
        </div>

        <dl className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
          <div>
            <dt className="font-semibold text-slate-900">Project</dt>
            <dd>{project?.name || "Unknown"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Type</dt>
            <dd>{task.type}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Source</dt>
            <dd>{task.source}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Page URL</dt>
            <dd>{task.page_url || "Not provided"}</dd>
          </div>
        </dl>

        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <p>
            <strong className="text-slate-900">Error message:</strong> {task.error_message || "Not provided"}
          </p>
          <p>
            <strong className="text-slate-900">Steps to reproduce:</strong>{" "}
            {task.steps_to_reproduce || "Not provided"}
          </p>
          <p>
            <strong className="text-slate-900">Expected behavior:</strong>{" "}
            {task.expected_behavior || "Not provided"}
          </p>
          <p>
            <strong className="text-slate-900">Actual behavior:</strong> {task.actual_behavior || "Not provided"}
          </p>
          <p>
            <strong className="text-slate-900">Logs:</strong> {task.logs || "Not provided"}
          </p>
          <p>
            <strong className="text-slate-900">Screenshot URL:</strong> {task.screenshot_url || "Not provided"}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <form action={generateFixPromptAction.bind(null, task.id)}>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Generate Fix Prompt
            </button>
          </form>

          <form action={updateTaskStatusAction.bind(null, task.id)} className="flex items-center gap-2">
            <select
              name="status"
              aria-label="Status"
              defaultValue={task.status}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {TASK_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
            >
              Update Status
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Generated Fix Prompt</h2>
        {task.fix_prompt ? (
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-6 text-slate-100">
            {task.fix_prompt}
          </pre>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No fix prompt generated yet.</p>
        )}
      </section>
    </main>
  );
}
