import { builderAgent } from "@/core/agents/builderAgent";
import { qaAgent } from "@/core/agents/qaAgent";
import type { AgentDefinition, AgentExecutionResult } from "@/core/types";

function passiveAgent(params: {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
  subscribedEvents: string[];
}) {
  const agent: AgentDefinition = {
    ...params,
    async execute() {
      const result: AgentExecutionResult = {
        summary: `${params.name} foundation is active and waiting for richer event integrations.`,
        recommendation: "Collect more system signals and execute in guided mode.",
        data: {
          readiness: "foundation",
          nextStep: "Integrate source-specific event streams",
        },
      };
      return result;
    },
  };

  return agent;
}

const registeredAgents: AgentDefinition[] = [
  builderAgent,
  qaAgent,
  passiveAgent({
    id: "growth-agent",
    name: "Growth Agent",
    type: "Growth",
    description: "Coordinates growth insights and conversion opportunities.",
    capabilities: ["growth-signals", "funnel-analysis", "experiment-recommendations"],
    subscribedEvents: ["onboarding.dropoff", "payment.failed"],
  }),
  passiveAgent({
    id: "support-agent",
    name: "Support Agent",
    type: "Support",
    description: "Aggregates issue trends and customer-facing recommendations.",
    capabilities: ["issue-triage", "support-prioritization"],
    subscribedEvents: ["issue.created", "issue.resolved"],
  }),
  passiveAgent({
    id: "operations-agent",
    name: "Operations Agent",
    type: "Operations",
    description: "Monitors platform operations and incident signals.",
    capabilities: ["incident-detection", "ops-workflow"],
    subscribedEvents: ["deployment.failed", "test.failed"],
  }),
  passiveAgent({
    id: "founder-intelligence-agent",
    name: "Founder Intelligence Agent",
    type: "Founder Intelligence",
    description: "Synthesizes company signals into action-ready recommendations.",
    capabilities: ["strategic-summary", "action-ranking"],
    subscribedEvents: ["task.created", "qa.failure", "payment.failed"],
  }),
];

export function getRegisteredAgentDefinitions() {
  return registeredAgents;
}

export function getRegisteredAgentDefinitionById(agentId: string) {
  return registeredAgents.find((agent) => agent.id === agentId) ?? null;
}
