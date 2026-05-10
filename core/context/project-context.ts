import { listAgentEvents, listAgentMemories, listAgentRuns } from "@/lib/core-store";
import { getProjectById, listProjects, listTasks } from "@/lib/data-store";

export async function getProjectContext(projectId?: string) {
  const [projects, tasks, runs, events, memories] = await Promise.all([
    projectId ? Promise.resolve([]) : listProjects(),
    listTasks(projectId),
    listAgentRuns({ limit: 20 }),
    listAgentEvents({ projectId, limit: 20 }),
    listAgentMemories({ projectId, limit: 20 }),
  ]);

  const project = projectId ? await getProjectById(projectId) : null;
  const scopedRuns = projectId
    ? runs.filter((run) => run.project_id === projectId)
    : runs;

  const recentFailures = tasks.filter(
    (task) => task.status !== "Deployed" && task.status !== "Rejected" && task.severity !== "Low",
  );
  const recentDeployments = tasks.filter((task) => task.status === "Deployed").slice(0, 10);

  return {
    project,
    allProjects: projects,
    recentTasks: tasks.slice(0, 20),
    recentFailures: recentFailures.slice(0, 10),
    recentDeployments,
    recentAgentActivity: {
      runs: scopedRuns.slice(0, 20),
      events,
      memories,
    },
    metrics: {
      openTasks: tasks.filter((task) => task.status !== "Deployed" && task.status !== "Rejected").length,
      highSeverityTasks: tasks.filter(
        (task) => task.severity === "High" || task.severity === "Critical",
      ).length,
      deploymentCount: recentDeployments.length,
      failureSignals: recentFailures.length,
      agentRunCount: scopedRuns.length,
    },
    placeholders: {
      revenueAlerts: ["Revenue anomaly monitoring foundation in progress"],
      userIssues: ["User issue ingestion pipeline pending integration"],
      aiRecommendations: ["Cross-agent prioritization engine coming in next phase"],
    },
  };
}
