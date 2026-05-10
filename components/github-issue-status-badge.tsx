import type { GitHubIssueStatus } from "@/lib/types";

const classes: Record<GitHubIssueStatus, string> = {
  "Not Created": "bg-slate-100 text-slate-700",
  Created: "bg-emerald-100 text-emerald-700",
  Updated: "bg-blue-100 text-blue-700",
  Failed: "bg-rose-100 text-rose-700",
};

export function GitHubIssueStatusBadge({ status }: { status: GitHubIssueStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>
      {status}
    </span>
  );
}
