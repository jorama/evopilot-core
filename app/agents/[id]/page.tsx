import { initializeCrossAgentCoordination } from "@/core/runtime/coordination";
import { notFound } from "next/navigation";
import { runAgentAction, toggleAgentEnabledAction } from "@/app/actions";
import { AgentStatusBadge } from "@/components/agent-status-badge";
import { PageHeader } from "@/components/page-header";
import {
  getAgentById,
  listAgentEvents,
  listAgentMemories,
  listAgentRuns,
  seedDefaultAgentRegistry,
} from "@/lib/core-store";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await seedDefaultAgentRegistry();
  initializeCrossAgentCoordination();

  const [agent, runs, events, memories] = await Promise.all([
    getAgentById(id),
    listAgentRuns({ agentId: id, limit: 20 }),
    listAgentEvents({ limit: 20 }),
    listAgentMemories({ limit: 20 }),
  ]);

  if (!agent) {
    notFound();
  }

  const lastRun = runs[0];
  const agentEvents = events.filter((event) => event.source_agent === agent.id).slice(0, 10);
  const agentMemories = memories
    .filter((memory) => memory.tags.includes(agent.type.toLowerCase().split(" ")[0]))
    .slice(0, 10);

  return (
    <main className="space-y-6">
      <PageHeader title={agent.name} description={agent.description} />

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <AgentStatusBadge status={lastRun?.status ?? "idle"} />
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{agent.type}</span>
        </div>

        <dl className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <div>
            <dt className="font-semibold text-slate-900">Capabilities</dt>
            <dd>{agent.capabilities.join(" · ")}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Enabled</dt>
            <dd>{agent.enabled ? "Enabled" : "Disabled"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Last run</dt>
            <dd>{lastRun ? new Date(lastRun.started_at).toLocaleString() : "No runs yet"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Registry created</dt>
            <dd>{new Date(agent.created_at).toLocaleString()}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <form action={toggleAgentEnabledAction.bind(null, agent.id)}>
            <input type="hidden" name="enabled" value={String(!agent.enabled)} />
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
            >
              {agent.enabled ? "Disable Agent" : "Enable Agent"}
            </button>
          </form>

          <form action={runAgentAction.bind(null, agent.id)}>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Run Agent
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Run History</h2>
        {runs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No runs yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2">Started</th>
                  <th className="px-3 py-2">Completed</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Project</th>
                  <th className="px-3 py-2">Task</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">{new Date(run.started_at).toLocaleString()}</td>
                    <td className="px-3 py-2">{run.completed_at ? new Date(run.completed_at).toLocaleString() : "—"}</td>
                    <td className="px-3 py-2">
                      <AgentStatusBadge status={run.status} />
                    </td>
                    <td className="px-3 py-2">{run.project_id || "—"}</td>
                    <td className="px-3 py-2">{run.task_id || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Agent Events</h3>
          {agentEvents.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No events yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {agentEvents.map((event) => (
                <li key={event.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold text-slate-900">{event.event_type}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(event.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Memory Highlights</h3>
          {agentMemories.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No memories saved yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {agentMemories.map((memory) => (
                <li key={memory.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold text-slate-900">{memory.memory_type}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(memory.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
