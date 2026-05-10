import { getRegisteredAgentDefinitions } from "@/core/agents/registry";
import { subscribeToEvent } from "@/core/events/event-bus";
import { runRegisteredAgent } from "@/core/runtime/agentRunner";

let isInitialized = false;

export function initializeCrossAgentCoordination() {
  if (isInitialized) {
    return;
  }

  const agents = getRegisteredAgentDefinitions();

  for (const agent of agents) {
    for (const eventType of agent.subscribedEvents) {
      subscribeToEvent(eventType, async (event) => {
        await runRegisteredAgent(agent.id, {
          projectId: event.project_id ?? undefined,
          taskId: event.task_id ?? undefined,
          eventType: event.event_type,
          payload: event.payload,
        });
      });
    }
  }

  isInitialized = true;
}
