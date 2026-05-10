import type { TaskStatus } from "@/lib/types";

const statusClasses: Record<TaskStatus, string> = {
  New: "bg-slate-100 text-slate-700",
  Investigating: "bg-blue-100 text-blue-700",
  "Fix Prompt Generated": "bg-indigo-100 text-indigo-700",
  "Branch Created": "bg-violet-100 text-violet-700",
  "Tests Running": "bg-amber-100 text-amber-700",
  "PR Ready": "bg-emerald-100 text-emerald-700",
  Approved: "bg-green-100 text-green-700",
  Deployed: "bg-teal-100 text-teal-700",
  Rejected: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}>
      {status}
    </span>
  );
}
