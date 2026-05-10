"use client";

import { useActionState } from "react";
import { createProjectAction } from "@/app/actions";
import { FRAMEWORK_OPTIONS } from "@/lib/constants";
import { SubmitButton } from "./forms/submit-button";

const initialState = { success: false, message: "" };

export function ProjectForm() {
  const [state, action] = useActionState(createProjectAction, initialState);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <label className="block text-sm font-medium text-slate-700">
        Project name
        <input name="name" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        GitHub repo URL
        <input name="repo_url" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Production URL
        <input name="production_url" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Framework
        <select name="framework" defaultValue="Next.js" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
          {FRAMEWORK_OPTIONS.map((framework) => (
            <option key={framework} value={framework}>
              {framework}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Test command
        <input
          name="test_command"
          defaultValue="npm test"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Playwright command
        <input
          name="playwright_command"
          defaultValue="npx playwright test"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Sentry project URL or key (optional)
        <input name="sentry_info" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Notes
        <textarea name="notes" rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>

      {state.message ? <p className="text-sm text-red-600">{state.message}</p> : null}

      <SubmitButton pendingLabel="Creating MVP...">Create MVP</SubmitButton>
    </form>
  );
}
