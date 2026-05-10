import { initializeCrossAgentCoordination } from "@/core/runtime/coordination";
import { PageHeader } from "@/components/page-header";
import { getProjectContext } from "@/core/context/project-context";
import { listAgentRegistry, listAgentEvents, listAgentRuns, seedDefaultAgentRegistry } from "@/lib/core-store";
import { listProjects } from "@/lib/data-store";

export default async function FounderIntelligencePage() {
  await seedDefaultAgentRegistry();
  initializeCrossAgentCoordination();

  const [projects, agents, runs, events, globalContext] = await Promise.all([
    listProjects(),
    listAgentRegistry(),
    listAgentRuns({ limit: 50 }),
    listAgentEvents({ limit: 30 }),
    getProjectContext(),
  ]);

  const enabledAgents = agents.filter((agent) => agent.enabled).length;
  const activeProjects = projects.length;
  const openFailures = globalContext.recentFailures.length;
  const recentDeployments = globalContext.recentDeployments.length;
  const suggestedActions = [
    ...globalContext.recentFailures.slice(0, 2).map((task) => `Prioritize fix strategy for: ${task.title}`),
    ...(enabledAgents < agents.length ? ["Review disabled agents and confirm intended coverage"] : []),
    ...(events.length === 0 ? ["Start publishing event signals from workflows"] : []),
  ].slice(0, 5);

  return (
    <main className="space-y-6">
      <PageHeader
        title="Founder Intelligence HQ"
        description="Mission control for projects, agents, failures, and strategic AI recommendations."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Active Projects</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{activeProjects}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">System Health</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{enabledAgents}/{agents.length}</p>
          <p className="mt-1 text-xs text-slate-500">Agents enabled</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Open Failures</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{openFailures}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Recent Deployments</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{recentDeployments}</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Agent Activity Feed</h2>
          {runs.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No agent runs yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {runs.slice(0, 10).map((run) => (
                <li key={run.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold text-slate-900">{run.agent_id} · {run.status}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(run.started_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Suggested Actions</h2>
          {suggestedActions.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No suggestions yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {suggestedActions.map((action, index) => (
                <li key={`${action}-${index}`} className="rounded-lg border border-slate-200 p-3">
                  {action}
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Recent Deployments</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {globalContext.recentDeployments.length === 0 ? (
              <li className="text-slate-600">No recent deployment records.</li>
            ) : (
              globalContext.recentDeployments.slice(0, 5).map((task) => (
                <li key={task.id} className="rounded-lg border border-slate-200 p-3">
                  {task.title}
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Revenue Alerts (placeholder)</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {globalContext.placeholders.revenueAlerts.map((item) => (
              <li key={item} className="rounded-lg border border-slate-200 p-3">{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">User Issues (placeholder)</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {globalContext.placeholders.userIssues.map((item) => (
              <li key={item} className="rounded-lg border border-slate-200 p-3">{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">AI Recommendations (placeholder)</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {globalContext.placeholders.aiRecommendations.map((item) => (
            <li key={item} className="rounded-lg border border-slate-200 p-3">{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
