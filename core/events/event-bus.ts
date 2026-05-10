import { saveAgentEvent } from "@/lib/core-store";
import type { AgentEvent } from "@/core/types";

type EventHandler = (event: AgentEvent) => Promise<void> | void;

const listeners = new Map<string, Set<EventHandler>>();

export async function publishEvent(event: {
  event_type: string;
  source_agent: string;
  project_id?: string;
  task_id?: string;
  payload?: Record<string, unknown>;
}) {
  const savedEvent = await saveAgentEvent({
    event_type: event.event_type,
    source_agent: event.source_agent,
    project_id: event.project_id ?? null,
    task_id: event.task_id ?? null,
    payload: event.payload ?? {},
  });

  const handlers = listeners.get(savedEvent.event_type);
  if (handlers) {
    for (const handler of handlers) {
      await handler(savedEvent);
    }
  }

  return savedEvent;
}

export function subscribeToEvent(eventType: string, handler: EventHandler) {
  if (!listeners.has(eventType)) {
    listeners.set(eventType, new Set());
  }

  listeners.get(eventType)?.add(handler);

  return () => {
    listeners.get(eventType)?.delete(handler);
  };
}
