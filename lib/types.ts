export type Framework = "Next.js" | "React" | "Node" | "Other";

export type TaskType =
  | "Bug"
  | "UX Improvement"
  | "Revenue Leak"
  | "Performance"
  | "Security"
  | "Test Failure"
  | "Feature Improvement";

export type Severity = "Low" | "Medium" | "High" | "Critical";

export type TaskSource =
  | "Manual"
  | "Sentry"
  | "Vercel"
  | "User Feedback"
  | "Stripe"
  | "Analytics"
  | "Playwright";

export type TaskStatus =
  | "New"
  | "Investigating"
  | "Fix Prompt Generated"
  | "Branch Created"
  | "Tests Running"
  | "PR Ready"
  | "Approved"
  | "Deployed"
  | "Rejected";

export type GitHubIssueStatus = "Not Created" | "Created" | "Updated" | "Failed";

export type Project = {
  id: string;
  name: string;
  repo_url: string;
  production_url: string;
  framework: Framework;
  test_command: string;
  playwright_command: string;
  sentry_info: string;
  notes: string;
  github_owner: string;
  github_repo: string;
  created_at: string;
};

export type ImprovementTask = {
  id: string;
  project_id: string;
  title: string;
  type: TaskType;
  severity: Severity;
  source: TaskSource;
  status: TaskStatus;
  page_url: string;
  error_message: string;
  steps_to_reproduce: string;
  expected_behavior: string;
  actual_behavior: string;
  logs: string;
  screenshot_url: string;
  fix_prompt: string;
  github_issue_url: string;
  github_issue_number: number | null;
  github_issue_created_at: string;
  github_issue_status: GitHubIssueStatus;
  created_at: string;
  updated_at: string;
};

export type ImprovementTaskWithProject = ImprovementTask & {
  project_name?: string;
};

export type ActionState = {
  success: boolean;
  message: string;
};

export type GitHubIssueMode = "create" | "update" | "recreate";
