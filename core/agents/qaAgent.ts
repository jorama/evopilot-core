import type { AgentDefinition } from "@/core/types";

export const qaAgent: AgentDefinition = {
  id: "qa-agent",
  name: "QA Agent",
  type: "QA",
  description: "Analyzes failed tests/logs and returns suggested fix classification.",
  capabilities: ["log-analysis", "failure-classification", "fix-suggestion"],
  subscribedEvents: ["test.failed", "deployment.failed"],
  async execute(context) {
    const logs = String(context.payload?.logs ?? "");
    const normalizedLogs = logs.toLowerCase();
    const hasTypeErrorSignal =
      normalizedLogs.includes("typeerror") ||
      normalizedLogs.includes("cannot read properties") ||
      normalizedLogs.includes("is not a function");
    const failureType =
      normalizedLogs.includes("timeout") || normalizedLogs.includes("timed out")
        ? "timeout"
        : hasTypeErrorSignal
          ? "type-error"
          : "assertion";

    return {
      summary: `Classified QA failure as ${failureType} and produced a remediation suggestion.`,
      recommendation:
        "Stabilize flaky conditions, capture deterministic reproduction, and rerun test pipeline before PR approval.",
      data: {
        classification: failureType,
        suggestedFix:
          failureType === "timeout"
            ? "Increase synchronization reliability and verify async waits around unstable boundaries."
            : failureType === "type-error"
              ? "Fix input/output typing assumptions and add safeguards around null/undefined values."
              : "Review assertion expectations and update behavior or tests to match intended output.",
      },
      memories: [
        {
          memory_type: "failure-pattern",
          scope: "project",
          content: {
            classification: failureType,
            observedAt: new Date().toISOString(),
          },
          tags: ["qa", "failure"],
        },
      ],
      events: [
        {
          event_type: "qa.failure",
          payload: {
            classification: failureType,
          },
        },
      ],
    };
  },
};
