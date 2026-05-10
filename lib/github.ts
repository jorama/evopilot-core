import type { ImprovementTask, Project } from "./types";

type GitHubIssue = {
  number: number;
  html_url: string;
  created_at: string;
};

type GitHubLabel = {
  name: string;
};

const ISSUE_LABEL_COLORS: Record<string, string> = {
  evopilot: "5319e7",
  "severity:low": "0e8a16",
  "severity:medium": "fbca04",
  "severity:high": "d93f0b",
  "severity:critical": "b60205",
  "type:bug": "d73a4a",
  "type:ux": "a2eeef",
  "type:performance": "0366d6",
  "type:security": "b60205",
  "type:revenue": "0052cc",
  "type:test": "6f42c1",
  "type:feature": "0e8a16",
};

function getToken() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("Missing GitHub token. Set GITHUB_TOKEN in server environment variables.");
  }

  return token;
}

async function parseGitHubResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
}

function mapGitHubError(response: Response, payload: unknown) {
  if (response.status === 401) {
    return new Error("GitHub API authentication failed. Verify GITHUB_TOKEN.");
  }

  if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") {
    return new Error("GitHub API rate limit exceeded. Please retry later.");
  }

  if (response.status === 403) {
    return new Error("GitHub API permission error. Ensure token has repository issue permissions.");
  }

  if (response.status === 404) {
    return new Error("GitHub repository not found or token lacks access.");
  }

  if (response.status >= 500) {
    return new Error("GitHub API is temporarily unavailable. Please retry.");
  }

  const message =
    payload && typeof payload === "object" && "message" in payload
      ? String((payload as { message: string }).message)
      : `GitHub API request failed with status ${response.status}.`;

  return new Error(message);
}

async function githubRequest<T>(
  path: string,
  init: RequestInit = {},
  allowNotFound = false,
): Promise<T | null> {
  const token = getToken();

  let response: Response;
  try {
    response = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown network error";
    throw new Error(`Network error while contacting GitHub API: ${message}`);
  }

  if (allowNotFound && response.status === 404) {
    return null;
  }

  const payload = await parseGitHubResponse(response);

  if (!response.ok) {
    throw mapGitHubError(response, payload);
  }

  return payload as T;
}

async function ensureLabel(owner: string, repo: string, label: string) {
  const existing = await githubRequest<GitHubLabel>(
    `/repos/${owner}/${repo}/labels/${encodeURIComponent(label)}`,
    { method: "GET" },
    true,
  );

  if (existing) {
    return;
  }

  await githubRequest<GitHubLabel>(`/repos/${owner}/${repo}/labels`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: label,
      color: ISSUE_LABEL_COLORS[label] ?? "ededed",
    }),
  });
}

export async function ensureRepoLabels(owner: string, repo: string, labels: string[]) {
  for (const label of labels) {
    await ensureLabel(owner, repo, label);
  }
}

function mapTaskTypeToLabel(type: ImprovementTask["type"]) {
  const map: Record<ImprovementTask["type"], string> = {
    Bug: "bug",
    "UX Improvement": "ux",
    "Revenue Leak": "revenue",
    Performance: "performance",
    Security: "security",
    "Test Failure": "test",
    "Feature Improvement": "feature",
  };

  return map[type];
}

export function buildIssueLabels(task: ImprovementTask) {
  return [
    "evopilot",
    `severity:${task.severity.toLowerCase()}`,
    `type:${mapTaskTypeToLabel(task.type)}`,
  ];
}

export function buildIssueTitle(task: ImprovementTask) {
  return `[EvoPilot] ${task.severity} - ${task.title}`;
}

export function buildIssueBody(project: Project, task: ImprovementTask) {
  return `## EvoPilot Improvement Task

- **Project name:** ${project.name}
- **Production URL:** ${project.production_url || "Not provided"}
- **Task type:** ${task.type}
- **Severity:** ${task.severity}
- **Source:** ${task.source}
- **Page URL:** ${task.page_url || "Not provided"}

## Error Details
- **Error message:** ${task.error_message || "Not provided"}
- **Steps to reproduce:** ${task.steps_to_reproduce || "Not provided"}
- **Expected behavior:** ${task.expected_behavior || "Not provided"}
- **Actual behavior:** ${task.actual_behavior || "Not provided"}
- **Logs:** ${task.logs || "Not provided"}
- **Screenshot URL:** ${task.screenshot_url || "Not provided"}

## Generated Fix Prompt
${task.fix_prompt || "No fix prompt generated yet."}

## Safety Reminder
- Create a new branch
- Do not modify unrelated files
- Run tests
- Open PR only
- Human approval required before deploy
`;
}

export async function createGitHubIssue(params: {
  owner: string;
  repo: string;
  title: string;
  body: string;
  labels: string[];
}) {
  const issue = await githubRequest<GitHubIssue>(`/repos/${params.owner}/${params.repo}/issues`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: params.title,
      body: params.body,
      labels: params.labels,
    }),
  });

  if (!issue) {
    throw new Error("GitHub issue creation failed.");
  }

  return issue;
}

export async function updateGitHubIssue(params: {
  owner: string;
  repo: string;
  issueNumber: number;
  title: string;
  body: string;
  labels: string[];
}) {
  const issue = await githubRequest<GitHubIssue>(
    `/repos/${params.owner}/${params.repo}/issues/${params.issueNumber}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: params.title,
        body: params.body,
        labels: params.labels,
      }),
    },
  );

  if (!issue) {
    throw new Error("GitHub issue update failed.");
  }

  return issue;
}
