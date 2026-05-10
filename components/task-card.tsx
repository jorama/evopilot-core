import Link from "next/link";
import { GitHubIssueStatusBadge } from "./github-issue-status-badge";
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
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={task.severity} />
          <StatusBadge status={task.status} />
          <GitHubIssueStatusBadge status={task.github_issue_status} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">{task.type}</p>
        <div className="flex items-center gap-3">
          {task.github_issue_url ? (
            <a
              href={task.github_issue_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-700 underline"
            >
              GitHub #{task.github_issue_number}
            </a>
          ) : null}
          <Link href={`/tasks/${task.id}`} className="text-sm font-medium text-slate-700 underline">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
