import { saveAgentMemory, upsertSystemContext } from "@/lib/core-store";

export async function saveMemory(input: {
  memory_type: string;
  scope: string;
  project_id?: string;
  content: Record<string, unknown>;
  tags?: string[];
}) {
  return saveAgentMemory({
    memory_type: input.memory_type,
    scope: input.scope,
    project_id: input.project_id ?? null,
    content: input.content,
    tags: input.tags ?? [],
  });
}

export async function saveSystemContext(input: {
  context_type: string;
  key: string;
  value: Record<string, unknown>;
}) {
  return upsertSystemContext(input);
}
