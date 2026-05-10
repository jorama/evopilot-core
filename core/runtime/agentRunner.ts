import { publishEvent } from "@/core/events/event-bus";
import { saveMemory } from "@/core/memory/store";
import { getProjectContext } from "@/core/context/project-context";
import { getRegisteredAgentDefinitionById } from "@/core/agents/registry";
import { completeAgentRun, createAgentRun } from "@/lib/core-store";
import type { AgentDefinition, AgentExecutionContext } from "@/core/types";

export type Agent = AgentDefinition;

export async function runAgent(agent: AgentDefinition, context: AgentExecutionContext) {
  const run = await createAgentRun({
    agent_id: agent.id,
    project_id: context.projectId,
    task_id: context.taskId,
    status: "running",
    input: {
      context,
    },
  });

  try {
    const projectContext = await getProjectContext(context.projectId);
    const result = await agent.execute({ ...context, projectContext });

    if (result.memories?.length) {
      for (const memory of result.memories) {
        await saveMemory({
          memory_type: memory.memory_type,
          scope: memory.scope,
          project_id: context.projectId,
          content: memory.content,
          tags: memory.tags,
        });
      }
    }

    if (result.events?.length) {
      for (const event of result.events) {
        await publishEvent({
          event_type: event.event_type,
          source_agent: agent.id,
          project_id: context.projectId,
          task_id: context.taskId,
          payload: event.payload,
        });
      }
    }

    const completedRun = await completeAgentRun(run.id, "completed", {
      summary: result.summary,
      recommendation: result.recommendation,
      data: result.data,
    });

    return completedRun;
  } catch (error) {
    const failedRun = await completeAgentRun(run.id, "failed", {
      error: error instanceof Error ? error.message : "Unknown agent runtime error",
    });

    await publishEvent({
      event_type: "agent.run.failed",
      source_agent: agent.id,
      project_id: context.projectId,
      task_id: context.taskId,
      payload: {
        runId: failedRun.id,
        error: failedRun.output.error,
      },
    });

    throw error;
  }
}

export async function runRegisteredAgent(agentId: string, context: AgentExecutionContext = {}) {
  const agent = getRegisteredAgentDefinitionById(agentId);

  if (!agent) {
    throw new Error("Agent not found in registry.");
  }

  return runAgent(agent, context);
}
