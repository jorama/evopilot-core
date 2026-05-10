export type AgentStatus = "idle" | "running" | "completed" | "failed";

export type AgentRegistryEntry = {
  id: string;
  name: string;
  type: string;
  description: string;
  enabled: boolean;
  capabilities: string[];
  created_at: string;
};

export type AgentRun = {
  id: string;
  agent_id: string;
  project_id: string | null;
  task_id: string | null;
  status: AgentStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  started_at: string;
  completed_at: string;
};

export type AgentEvent = {
  id: string;
  event_type: string;
  source_agent: string;
  project_id: string | null;
  task_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type AgentMemory = {
  id: string;
  memory_type: string;
  scope: string;
  project_id: string | null;
  content: Record<string, unknown>;
  tags: string[];
  created_at: string;
};

export type SystemContext = {
  id: string;
  context_type: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
};

export type AgentExecutionContext = {
  projectId?: string;
  taskId?: string;
  eventType?: string;
  payload?: Record<string, unknown>;
  projectContext?: Record<string, unknown>;
};

export type AgentExecutionResult = {
  summary: string;
  recommendation?: string;
  data?: Record<string, unknown>;
  memories?: Array<{
    memory_type: string;
    scope: string;
    content: Record<string, unknown>;
    tags?: string[];
  }>;
  events?: Array<{
    event_type: string;
    payload: Record<string, unknown>;
  }>;
};

export type AgentDefinition = {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
  subscribedEvents: string[];
  execute: (context: AgentExecutionContext) => Promise<AgentExecutionResult>;
};
