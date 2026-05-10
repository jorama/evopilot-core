import Link from "next/link";
import { SeverityBadge } from "./severity-badge";
import { StatusBadge } from "./status-badge";
import type { ImprovementTaskWithProject } from "@/lib/types";

export function TaskCard({ task }: { task: ImprovementTaskWithProject }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{task.project_name || "Unknown project"}</p>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={task.severity} />
          <StatusBadge status={task.status} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-500">{task.type}</p>
        <Link href={`/tasks/${task.id}`} className="text-sm font-medium text-slate-700 underline">
          View
        </Link>
      </div>
    </article>
  );
}
