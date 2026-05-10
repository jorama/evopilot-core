import type { ImprovementTask, Project } from "./types";

export function buildFixPrompt(project: Project, task: ImprovementTask) {
  return `You are fixing an EvoPilot improvement task for ${project.name}.

Project Context
- Project name: ${project.name}
- Repository URL: ${project.repo_url || "Not provided"}
- Production URL: ${project.production_url || "Not provided"}
- Framework: ${project.framework || "Not provided"}
- Test command: ${project.test_command || "npm test"}
- Playwright command: ${project.playwright_command || "npx playwright test"}

Problem Summary
- Title: ${task.title}
- Type: ${task.type}
- Severity: ${task.severity}
- Source: ${task.source}
- Page URL: ${task.page_url || "Not provided"}

Error Details
- Error message: ${task.error_message || "Not provided"}
- Logs: ${task.logs || "Not provided"}
- Screenshot URL: ${task.screenshot_url || "Not provided"}

Reproduction
- Steps to reproduce: ${task.steps_to_reproduce || "Not provided"}
- Expected behavior: ${task.expected_behavior || "Not provided"}
- Actual behavior: ${task.actual_behavior || "Not provided"}

Files likely affected
- [Placeholder] Identify likely files before editing.

Safety Instructions (mandatory)
1. Create a new branch before making changes.
2. Do not modify unrelated files.
3. Do not break existing user flows.
4. Run unit/integration tests with: ${project.test_command || "npm test"}.
5. Run Playwright tests with: ${project.playwright_command || "npx playwright test"}.
6. Commit only relevant changes.
7. Open a pull request for human review.
8. Do NOT auto-deploy to production.

Verification Checklist
- [ ] Bug/issue reproduced locally.
- [ ] Root cause identified.
- [ ] Minimal fix implemented.
- [ ] Existing tests pass.
- [ ] Playwright checks pass.
- [ ] No unrelated files changed.
- [ ] PR includes clear summary and test evidence.
`;
}
