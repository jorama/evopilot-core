import Link from "next/link";
import { updateTaskStatusAction } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SeverityBadge } from "@/components/severity-badge";
import { StatusBadge } from "@/components/status-badge";
import { TASK_STATUS_OPTIONS } from "@/lib/constants";
import { listTasks } from "@/lib/data-store";

export default async function TasksPage() {
  const tasks = await listTasks();

  return (
    <main className="space-y-6">
      <PageHeader
        title="Founder HQ Tasks"
        description="Manage all improvement tasks, statuses, and PR readiness."
      />

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="Create a project and add an issue to see tasks here."
          actionLabel="Add MVP"
          actionHref="/projects/new"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-900">{task.title}</td>
                    <td className="px-4 py-3 text-slate-700">{task.project_name || "Unknown"}</td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={task.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">{task.type}</td>
                    <td className="px-4 py-3 text-slate-700">{task.source}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(task.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <Link href={`/tasks/${task.id}`} className="text-xs font-semibold text-slate-700 underline">
                          View
                        </Link>
                        <form action={updateTaskStatusAction.bind(null, task.id)} className="flex items-center gap-2">
                          <select
                            name="status"
                            defaultValue={task.status}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          >
                            {TASK_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold"
                          >
                            Update
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
