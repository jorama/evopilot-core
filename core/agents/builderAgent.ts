import type { AgentDefinition } from "@/core/types";

export const builderAgent: AgentDefinition = {
  id: "builder-agent",
  name: "Builder Agent",
  type: "Builder",
  description: "Receives improvement tasks and returns structured repair recommendations.",
  capabilities: ["task-analysis", "repair-strategy", "coding-prompt"],
  subscribedEvents: ["task.created", "task.failed", "issue.created"],
  async execute(context) {
    const severity = String(context.payload?.severity ?? "Medium");
    const title = String(context.payload?.title ?? "Untitled task");

    return {
      summary: `Analyzed ${title} with ${severity} severity and generated implementation guidance.`,
      recommendation:
        "Create a scoped PR plan, preserve unrelated files, run lint/build/tests, and submit for founder approval.",
      data: {
        repairStrategy: [
          "Reproduce issue and isolate failing boundary",
          "Apply minimal fix in affected module",
          "Validate existing workflows and regression scope",
        ],
        codingPrompt: `Resolve: ${title}. Keep change minimal, preserve existing behavior, and include verification steps.`,
      },
      memories: [
        {
          memory_type: "pattern",
          scope: "project",
          content: {
            insight: `${title} is currently prioritized as ${severity}.`,
            source: "builder-agent",
          },
          tags: ["builder", "task-analysis"],
        },
      ],
      events: [
        {
          event_type: "agent.builder.recommendation",
          payload: {
            title,
            severity,
            recommendationType: "repair-strategy",
          },
        },
      ],
    };
  },
};
