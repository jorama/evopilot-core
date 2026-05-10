"use client";

import { useActionState } from "react";
import { createTaskAction } from "@/app/actions";
import { SEVERITY_OPTIONS, TASK_SOURCE_OPTIONS, TASK_TYPE_OPTIONS } from "@/lib/constants";
import { SubmitButton } from "./forms/submit-button";

const initialState = { success: false, message: "" };

export function TaskForm({ projectId }: { projectId: string }) {
  const actionWithProjectId = createTaskAction.bind(null, projectId);
  const [state, action] = useActionState(actionWithProjectId, initialState);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <label className="block text-sm font-medium text-slate-700">
        Title
        <input name="title" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm font-medium text-slate-700">
          Type
          <select name="type" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            {TASK_TYPE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Severity
          <select name="severity" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            {SEVERITY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Source
          <select name="source" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            {TASK_SOURCE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Page URL
        <input name="page_url" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Error message
        <textarea
          name="error_message"
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Steps to reproduce
        <textarea
          name="steps_to_reproduce"
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Expected behavior
          <textarea
            name="expected_behavior"
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Actual behavior
          <textarea
            name="actual_behavior"
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Logs
        <textarea name="logs" rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Screenshot URL (optional)
        <input name="screenshot_url" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>

      {state.message ? <p className="text-sm text-red-600">{state.message}</p> : null}

      <SubmitButton pendingLabel="Creating task...">Create Improvement Task</SubmitButton>
    </form>
  );
}
