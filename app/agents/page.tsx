import { initializeCrossAgentCoordination } from "@/core/runtime/coordination";
import Link from "next/link";
import { toggleAgentEnabledAction } from "@/app/actions";
import { AgentStatusBadge } from "@/components/agent-status-badge";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { listAgentRegistry, listAgentRuns, seedDefaultAgentRegistry } from "@/lib/core-store";

export default async function AgentsPage() {
  await seedDefaultAgentRegistry();
  initializeCrossAgentCoordination();
  const [agents, runs] = await Promise.all([listAgentRegistry(), listAgentRuns({ limit: 100 })]);

  const lastRunMap = new Map<string, (typeof runs)[number]>();
  for (const run of runs) {
    if (!lastRunMap.has(run.agent_id)) {
      lastRunMap.set(run.agent_id, run);
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Agent Registry"
        description="Manage AI workforce agents, capabilities, and runtime status."
      />

      {agents.length === 0 ? (
        <EmptyState
          title="No agents registered"
          description="Seed the registry to activate core orchestration agents."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => {
            const lastRun = lastRunMap.get(agent.id);

            return (
              <article key={agent.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{agent.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">{agent.description}</p>
                  </div>
                  <AgentStatusBadge status={lastRun?.status ?? "idle"} />
                </div>

                <dl className="mt-4 grid gap-2 text-sm text-slate-700">
                  <div>
                    <dt className="font-semibold text-slate-900">Type</dt>
                    <dd>{agent.type}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Capabilities</dt>
                    <dd>{agent.capabilities.join(" · ")}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Last run</dt>
                    <dd>{lastRun ? new Date(lastRun.started_at).toLocaleString() : "No runs yet"}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-center justify-between">
                  <form action={toggleAgentEnabledAction.bind(null, agent.id)}>
                    <input type="hidden" name="enabled" value={String(!agent.enabled)} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      {agent.enabled ? "Disable" : "Enable"}
                    </button>
                  </form>

                  <Link href={`/agents/${agent.id}`} className="text-sm font-medium text-slate-700 underline">
                    View agent
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
