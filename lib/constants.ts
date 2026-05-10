import type {
  Framework,
  GitHubIssueStatus,
  Severity,
  TaskSource,
  TaskStatus,
  TaskType,
} from "./types";

export const FRAMEWORK_OPTIONS: Framework[] = ["Next.js", "React", "Node", "Other"];
export const TASK_TYPE_OPTIONS: TaskType[] = [
  "Bug",
  "UX Improvement",
  "Revenue Leak",
  "Performance",
  "Security",
  "Test Failure",
  "Feature Improvement",
];
export const SEVERITY_OPTIONS: Severity[] = ["Low", "Medium", "High", "Critical"];
export const TASK_SOURCE_OPTIONS: TaskSource[] = [
  "Manual",
  "Sentry",
  "Vercel",
  "User Feedback",
  "Stripe",
  "Analytics",
  "Playwright",
];
export const TASK_STATUS_OPTIONS: TaskStatus[] = [
  "New",
  "Investigating",
  "Fix Prompt Generated",
  "Branch Created",
  "Tests Running",
  "PR Ready",
  "Approved",
  "Deployed",
  "Rejected",
];

export const GITHUB_ISSUE_STATUS_OPTIONS: GitHubIssueStatus[] = [
  "Not Created",
  "Created",
  "Updated",
  "Failed",
];
