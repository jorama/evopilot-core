import { createSupabaseServerClient, isSupabaseConfigured } from "./supabase";
import type {
  AgentEvent,
  AgentMemory,
  AgentRegistryEntry,
  AgentRun,
  AgentStatus,
  SystemContext,
} from "@/core/types";

type CoreStore = {
  agent_registry: AgentRegistryEntry[];
  agent_runs: AgentRun[];
  agent_events: AgentEvent[];
  agent_memories: AgentMemory[];
  system_context: SystemContext[];
};

const defaultAgents = [
  {
    id: "builder-agent",
    name: "Builder Agent",
    type: "Builder",
    description: "Analyzes tasks and generates implementation recommendations.",
    enabled: true,
    capabilities: ["task-analysis", "repair-strategy", "prompt-generation"],
  },
  {
    id: "qa-agent",
    name: "QA Agent",
    type: "QA",
    description: "Analyzes test failures and proposes reliability fixes.",
    enabled: true,
    capabilities: ["failure-analysis", "test-classification", "fix-suggestion"],
  },
  {
    id: "growth-agent",
    name: "Growth Agent",
    type: "Growth",
    description: "Surfaces growth opportunities and funnel-drop recommendations.",
    enabled: true,
    capabilities: ["funnel-alerts", "growth-hypotheses", "experiment-ideas"],
  },
  {
    id: "support-agent",
    name: "Support Agent",
    type: "Support",
    description: "Tracks user issues and proposes customer-impact responses.",
    enabled: true,
    capabilities: ["ticket-triage", "issue-patterns", "response-drafts"],
  },
  {
    id: "operations-agent",
    name: "Operations Agent",
    type: "Operations",
    description: "Tracks system and workflow operational stability.",
    enabled: true,
    capabilities: ["ops-monitoring", "incident-highlights", "runbook-suggestions"],
  },
  {
    id: "founder-intelligence-agent",
    name: "Founder Intelligence Agent",
    type: "Founder Intelligence",
    description: "Synthesizes startup-wide signals into prioritized founder actions.",
    enabled: true,
    capabilities: ["priority-ranking", "strategy-summary", "decision-support"],
  },
];

const memoryStore: CoreStore = {
  agent_registry: [],
  agent_runs: [],
  agent_events: [],
  agent_memories: [],
  system_context: [],
};

function getStore() {
  return memoryStore;
}

function normalizeAgent(row: Partial<AgentRegistryEntry>): AgentRegistryEntry {
  return {
    id: row.id ?? crypto.randomUUID(),
    name: row.name ?? "",
    type: row.type ?? "",
    description: row.description ?? "",
    enabled: row.enabled ?? true,
    capabilities: Array.isArray(row.capabilities) ? row.capabilities.map(String) : [],
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

function normalizeAgentRun(row: Partial<AgentRun>): AgentRun {
  return {
    id: row.id ?? crypto.randomUUID(),
    agent_id: row.agent_id ?? "",
    project_id: row.project_id ?? null,
    task_id: row.task_id ?? null,
    status: (row.status as AgentStatus) ?? "idle",
    input: (row.input as Record<string, unknown>) ?? {},
    output: (row.output as Record<string, unknown>) ?? {},
    started_at: row.started_at ?? new Date().toISOString(),
    completed_at: row.completed_at ?? "",
  };
}

function normalizeAgentEvent(row: Partial<AgentEvent>): AgentEvent {
  return {
    id: row.id ?? crypto.randomUUID(),
    event_type: row.event_type ?? "",
    source_agent: row.source_agent ?? "system",
    project_id: row.project_id ?? null,
    task_id: row.task_id ?? null,
    payload: (row.payload as Record<string, unknown>) ?? {},
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

function normalizeAgentMemory(row: Partial<AgentMemory>): AgentMemory {
  return {
    id: row.id ?? crypto.randomUUID(),
    memory_type: row.memory_type ?? "",
    scope: row.scope ?? "global",
    project_id: row.project_id ?? null,
    content: (row.content as Record<string, unknown>) ?? {},
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

function normalizeSystemContext(row: Partial<SystemContext>): SystemContext {
  return {
    id: row.id ?? crypto.randomUUID(),
    context_type: row.context_type ?? "",
    key: row.key ?? "",
    value: (row.value as Record<string, unknown>) ?? {},
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

async function listSupabaseAgents() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("agent_registry")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeAgent);
}

export async function seedDefaultAgentRegistry() {
  if (isSupabaseConfigured) {
    const existing = await listSupabaseAgents();
    const existingIds = new Set(existing.map((agent) => agent.id));
    const payload = defaultAgents
      .filter((agent) => !existingIds.has(agent.id))
      .map((agent) => ({ ...agent, created_at: new Date().toISOString() }));

    if (payload.length === 0) {
      return;
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("agent_registry").insert(payload);
    if (error) throw new Error(error.message);
    return;
  }

  const store = getStore();
  if (store.agent_registry.length > 0) {
    return;
  }

  store.agent_registry = defaultAgents.map((agent) =>
    normalizeAgent({ ...agent, created_at: new Date().toISOString() }),
  );
}

export async function listAgentRegistry() {
  await seedDefaultAgentRegistry();

  if (isSupabaseConfigured) {
    return listSupabaseAgents();
  }

  return getStore().agent_registry;
}

export async function getAgentById(agentId: string) {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("agent_registry")
      .select("*")
      .eq("id", agentId)
      .single();

    if (error) return null;
    return normalizeAgent(data);
  }

  return getStore().agent_registry.find((agent) => agent.id === agentId) ?? null;
}

export async function updateAgentEnabled(agentId: string, enabled: boolean) {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("agent_registry")
      .update({ enabled })
      .eq("id", agentId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return normalizeAgent(data);
  }

  const store = getStore();
  const index = store.agent_registry.findIndex((agent) => agent.id === agentId);
  if (index === -1) throw new Error("Agent not found");

  store.agent_registry[index] = {
    ...store.agent_registry[index],
    enabled,
  };

  return store.agent_registry[index];
}

export async function createAgentRun(input: {
  agent_id: string;
  project_id?: string;
  task_id?: string;
  status: AgentStatus;
  input?: Record<string, unknown>;
}) {
  const payload = normalizeAgentRun({
    agent_id: input.agent_id,
    project_id: input.project_id ?? null,
    task_id: input.task_id ?? null,
    status: input.status,
    input: input.input ?? {},
    output: {},
    started_at: new Date().toISOString(),
  });

  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("agent_runs")
      .insert({
        agent_id: payload.agent_id,
        project_id: payload.project_id,
        task_id: payload.task_id,
        status: payload.status,
        input: payload.input,
        output: payload.output,
        started_at: payload.started_at,
        completed_at: null,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return normalizeAgentRun(data);
  }

  const store = getStore();
  store.agent_runs.unshift(payload);
  return payload;
}

export async function completeAgentRun(
  runId: string,
  status: AgentStatus,
  output: Record<string, unknown>,
) {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("agent_runs")
      .update({
        status,
        output,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return normalizeAgentRun(data);
  }

  const store = getStore();
  const index = store.agent_runs.findIndex((run) => run.id === runId);
  if (index === -1) throw new Error("Agent run not found");

  store.agent_runs[index] = {
    ...store.agent_runs[index],
    status,
    output,
    completed_at: new Date().toISOString(),
  };

  return store.agent_runs[index];
}

export async function listAgentRuns(params?: { agentId?: string; limit?: number }) {
  const agentId = params?.agentId;
  const limit = params?.limit ?? 20;

  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("agent_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(limit);

    if (agentId) {
      query = query.eq("agent_id", agentId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(normalizeAgentRun);
  }

  const source = agentId
    ? getStore().agent_runs.filter((run) => run.agent_id === agentId)
    : getStore().agent_runs;

  return source.slice(0, limit);
}

export async function saveAgentEvent(event: Partial<AgentEvent>) {
  const payload = normalizeAgentEvent(event);

  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("agent_events")
      .insert({
        event_type: payload.event_type,
        source_agent: payload.source_agent,
        project_id: payload.project_id,
        task_id: payload.task_id,
        payload: payload.payload,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return normalizeAgentEvent(data);
  }

  const store = getStore();
  store.agent_events.unshift(payload);
  return payload;
}

export async function listAgentEvents(params?: { projectId?: string; limit?: number }) {
  const projectId = params?.projectId;
  const limit = params?.limit ?? 30;

  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("agent_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(normalizeAgentEvent);
  }

  const source = projectId
    ? getStore().agent_events.filter((event) => event.project_id === projectId)
    : getStore().agent_events;

  return source.slice(0, limit);
}

export async function saveAgentMemory(memory: Partial<AgentMemory>) {
  const payload = normalizeAgentMemory(memory);

  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("agent_memories")
      .insert({
        memory_type: payload.memory_type,
        scope: payload.scope,
        project_id: payload.project_id,
        content: payload.content,
        tags: payload.tags,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return normalizeAgentMemory(data);
  }

  const store = getStore();
  store.agent_memories.unshift(payload);
  return payload;
}

export async function listAgentMemories(params?: { projectId?: string; limit?: number }) {
  const projectId = params?.projectId;
  const limit = params?.limit ?? 30;

  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("agent_memories")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(normalizeAgentMemory);
  }

  const source = projectId
    ? getStore().agent_memories.filter((memory) => memory.project_id === projectId)
    : getStore().agent_memories;

  return source.slice(0, limit);
}

export async function upsertSystemContext(input: {
  context_type: string;
  key: string;
  value: Record<string, unknown>;
}) {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("system_context")
      .upsert(
        {
          context_type: input.context_type,
          key: input.key,
          value: input.value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "context_type,key" },
      )
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return normalizeSystemContext(data);
  }

  const store = getStore();
  const index = store.system_context.findIndex(
    (item) => item.context_type === input.context_type && item.key === input.key,
  );

  const payload = normalizeSystemContext({
    context_type: input.context_type,
    key: input.key,
    value: input.value,
    updated_at: new Date().toISOString(),
  });

  if (index === -1) {
    store.system_context.unshift(payload);
    return payload;
  }

  store.system_context[index] = {
    ...store.system_context[index],
    value: payload.value,
    updated_at: payload.updated_at,
  };

  return store.system_context[index];
}

export async function listSystemContext(limit = 20) {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("system_context")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []).map(normalizeSystemContext);
  }

  return getStore().system_context.slice(0, limit);
}
