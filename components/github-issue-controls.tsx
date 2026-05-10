"use client";

import { useActionState } from "react";
import { createGitHubIssueAction } from "@/app/actions";
import type { ActionState, GitHubIssueStatus } from "@/lib/types";

const initialState: ActionState = {
  success: false,
  message: "",
};

export function GitHubIssueControls({
  taskId,
  githubIssueUrl,
  githubIssueStatus,
}: {
  taskId: string;
  githubIssueUrl: string;
  githubIssueStatus: GitHubIssueStatus;
}) {
  const [state, action, isPending] = useActionState(createGitHubIssueAction.bind(null, taskId), initialState);
  const hasIssue = Boolean(githubIssueUrl.trim());

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {hasIssue ? (
          <button
            type="submit"
            name="mode"
            value="create"
            disabled
            className="rounded-lg bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Issue Already Created
          </button>
        ) : (
          <button
            type="submit"
            name="mode"
            value="create"
            disabled={isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            {isPending ? "Creating GitHub Issue..." : "Create GitHub Issue"}
          </button>
        )}

        <button
          type="submit"
          name="mode"
          value="update"
          disabled={!hasIssue || isPending}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-60"
        >
          Update Issue
        </button>

        <button
          type="submit"
          name="mode"
          value="recreate"
          disabled={isPending}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
        >
          Recreate Issue
        </button>
      </div>

      <p className="text-xs text-slate-500">Current GitHub issue status: {githubIssueStatus}</p>

      {state.message ? (
        <p className={`text-sm ${state.success ? "text-emerald-700" : "text-rose-700"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
