import type { AgentStatus } from "@/core/types";

const classes: Record<AgentStatus, string> = {
  idle: "bg-slate-100 text-slate-700",
  running: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
};

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>
      {status}
    </span>
  );
}
