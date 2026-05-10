import { buildIssueBody, buildIssueLabels, buildIssueTitle, createGitHubIssue, ensureRepoLabels, updateGitHubIssue } from "./github";
import { buildFixPrompt } from "./fix-prompt";
import { createSupabaseServerClient, isSupabaseConfigured } from "./supabase";
import type {
  GitHubIssueMode,
  ImprovementTask,
  ImprovementTaskWithProject,
  Project,
  TaskStatus,
} from "./types";

type Store = {
  projects: Project[];
  tasks: ImprovementTask[];
};

const defaultProjectValues = {
  repo_url: "",
  production_url: "",
  framework: "Other",
  test_command: "npm test",
  playwright_command: "npx playwright test",
  sentry_info: "",
  notes: "",
  github_owner: "",
  github_repo: "",
} as const;

const defaultTaskValues = {
  type: "Bug",
  severity: "Medium",
  source: "Manual",
  status: "New",
  page_url: "",
  error_message: "",
  steps_to_reproduce: "",
  expected_behavior: "",
  actual_behavior: "",
  logs: "",
  screenshot_url: "",
  fix_prompt: "",
  github_issue_url: "",
  github_issue_number: null,
  github_issue_created_at: "",
  github_issue_status: "Not Created",
} as const;

const memoryStore: Store = { projects: [], tasks: [] };

function getMemoryStore() {
  return memoryStore;
}

function parseGithubRepoFromUrl(repoUrl: string) {
  const normalized = repoUrl.trim();

  if (!normalized) {
    return null;
  }

  const httpsMatch = normalized.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2] };
  }

  const sshMatch = normalized.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }

  return null;
}

function withGithubRepoDetails(project: Project): Project {
  if (project.github_owner && project.github_repo) {
    return project;
  }

  const parsed = parseGithubRepoFromUrl(project.repo_url);

  if (!parsed) {
    return project;
  }

  return {
    ...project,
    github_owner: parsed.owner,
    github_repo: parsed.repo,
  };
}

function normalizeProject(row: Partial<Project>): Project {
  return withGithubRepoDetails({
    id: row.id ?? crypto.randomUUID(),
    name: row.name ?? "",
    repo_url: row.repo_url ?? defaultProjectValues.repo_url,
    production_url: row.production_url ?? defaultProjectValues.production_url,
    framework: (row.framework as Project["framework"]) ?? defaultProjectValues.framework,
    test_command: row.test_command ?? defaultProjectValues.test_command,
    playwright_command: row.playwright_command ?? defaultProjectValues.playwright_command,
    sentry_info: row.sentry_info ?? defaultProjectValues.sentry_info,
    notes: row.notes ?? defaultProjectValues.notes,
    github_owner: row.github_owner ?? defaultProjectValues.github_owner,
    github_repo: row.github_repo ?? defaultProjectValues.github_repo,
    created_at: row.created_at ?? new Date().toISOString(),
  });
}

function normalizeTask(row: Partial<ImprovementTask>): ImprovementTask {
  return {
    id: row.id ?? crypto.randomUUID(),
    project_id: row.project_id ?? "",
    title: row.title ?? "",
    type: (row.type as ImprovementTask["type"]) ?? defaultTaskValues.type,
    severity: (row.severity as ImprovementTask["severity"]) ?? defaultTaskValues.severity,
    source: (row.source as ImprovementTask["source"]) ?? defaultTaskValues.source,
    status: (row.status as ImprovementTask["status"]) ?? defaultTaskValues.status,
    page_url: row.page_url ?? defaultTaskValues.page_url,
    error_message: row.error_message ?? defaultTaskValues.error_message,
    steps_to_reproduce: row.steps_to_reproduce ?? defaultTaskValues.steps_to_reproduce,
    expected_behavior: row.expected_behavior ?? defaultTaskValues.expected_behavior,
    actual_behavior: row.actual_behavior ?? defaultTaskValues.actual_behavior,
    logs: row.logs ?? defaultTaskValues.logs,
    screenshot_url: row.screenshot_url ?? defaultTaskValues.screenshot_url,
    fix_prompt: row.fix_prompt ?? defaultTaskValues.fix_prompt,
    github_issue_url: row.github_issue_url ?? defaultTaskValues.github_issue_url,
    github_issue_number:
      typeof row.github_issue_number === "number"
        ? row.github_issue_number
        : defaultTaskValues.github_issue_number,
    github_issue_created_at:
      row.github_issue_created_at ?? defaultTaskValues.github_issue_created_at,
    github_issue_status:
      (row.github_issue_status as ImprovementTask["github_issue_status"]) ??
      defaultTaskValues.github_issue_status,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

function assertRepoConfigured(project: Project) {
  if (!project.github_owner || !project.github_repo) {
    throw new Error("Invalid repository URL. Provide a valid GitHub repo URL in the project settings.");
  }
}

export async function listProjects() {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(normalizeProject);
  }

  return getMemoryStore().projects;
}

export async function createProject(input: Partial<Project>) {
  const payload = normalizeProject(input);

  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: payload.name,
        repo_url: payload.repo_url,
        production_url: payload.production_url,
        framework: payload.framework,
        test_command: payload.test_command,
        playwright_command: payload.playwright_command,
        sentry_info: payload.sentry_info,
        notes: payload.notes,
        github_owner: payload.github_owner,
        github_repo: payload.github_repo,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return normalizeProject(data);
  }

  const store = getMemoryStore();
  store.projects.unshift(payload);
  return payload;
}

export async function getProjectById(id: string) {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return normalizeProject(data);
  }

  return getMemoryStore().projects.find((project) => project.id === id) ?? null;
}

export async function listTasks(projectId?: string) {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("improvement_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const tasks = (data ?? []).map(normalizeTask);
    const projects = await listProjects();
    const projectMap = new Map(projects.map((project) => [project.id, project.name]));

    return tasks.map((task) => ({
      ...task,
      project_name: projectMap.get(task.project_id),
    }));
  }

  const store = getMemoryStore();
  const projects = new Map(store.projects.map((project) => [project.id, project.name]));
  const source = projectId
    ? store.tasks.filter((task) => task.project_id === projectId)
    : store.tasks;

  return source.map((task) => ({
    ...task,
    project_name: projects.get(task.project_id),
  }));
}

export async function createTask(input: Partial<ImprovementTask>) {
  const payload = normalizeTask(input);

  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("improvement_tasks")
      .insert({
        project_id: payload.project_id,
        title: payload.title,
        type: payload.type,
        severity: payload.severity,
        source: payload.source,
        status: payload.status,
        page_url: payload.page_url,
        error_message: payload.error_message,
        steps_to_reproduce: payload.steps_to_reproduce,
        expected_behavior: payload.expected_behavior,
        actual_behavior: payload.actual_behavior,
        logs: payload.logs,
        screenshot_url: payload.screenshot_url,
        fix_prompt: payload.fix_prompt,
        github_issue_url: payload.github_issue_url,
        github_issue_number: payload.github_issue_number,
        github_issue_created_at: payload.github_issue_created_at || null,
        github_issue_status: payload.github_issue_status,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return normalizeTask(data);
  }

  const store = getMemoryStore();
  store.tasks.unshift(payload);
  return payload;
}

export async function getTaskById(id: string) {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("improvement_tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return normalizeTask(data);
  }

  return getMemoryStore().tasks.find((task) => task.id === id) ?? null;
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("improvement_tasks")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return normalizeTask(data);
  }

  const store = getMemoryStore();
  const index = store.tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    throw new Error("Task not found");
  }

  store.tasks[index] = {
    ...store.tasks[index],
    status,
    updated_at: new Date().toISOString(),
  };

  return store.tasks[index];
}

export async function generateAndSaveFixPrompt(taskId: string) {
  const task = await getTaskById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const project = await getProjectById(task.project_id);

  if (!project) {
    throw new Error("Project not found");
  }

  const fixPrompt = buildFixPrompt(project, task);

  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("improvement_tasks")
      .update({
        fix_prompt: fixPrompt,
        status: "Fix Prompt Generated",
      })
      .eq("id", taskId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return normalizeTask(data);
  }

  const store = getMemoryStore();
  const index = store.tasks.findIndex((item) => item.id === taskId);

  if (index === -1) {
    throw new Error("Task not found");
  }

  store.tasks[index] = {
    ...store.tasks[index],
    fix_prompt: fixPrompt,
    status: "Fix Prompt Generated",
    updated_at: new Date().toISOString(),
  };

  return store.tasks[index];
}

export async function createOrSyncGitHubIssue(taskId: string, mode: GitHubIssueMode) {
  const task = await getTaskById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const project = await getProjectById(task.project_id);

  if (!project) {
    throw new Error("Project not found");
  }

  assertRepoConfigured(project);

  if (mode === "create" && task.github_issue_url.trim()) {
    throw new Error("Duplicate issue attempt blocked. Use Update Issue or Recreate Issue.");
  }

  if (mode === "update" && !task.github_issue_number) {
    throw new Error("No existing GitHub issue found. Create one first.");
  }

  const title = buildIssueTitle(task);
  const body = buildIssueBody(project, task);
  const labels = buildIssueLabels(task);

  await ensureRepoLabels(project.github_owner, project.github_repo, labels);

  const issue =
    mode === "update"
      ? await updateGitHubIssue({
          owner: project.github_owner,
          repo: project.github_repo,
          issueNumber: task.github_issue_number as number,
          title,
          body,
          labels,
        })
      : await createGitHubIssue({
          owner: project.github_owner,
          repo: project.github_repo,
          title,
          body,
          labels,
        });

  const githubIssueStatus = mode === "update" ? "Updated" : "Created";

  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("improvement_tasks")
      .update({
        github_issue_url: issue.html_url,
        github_issue_number: issue.number,
        github_issue_created_at: issue.created_at,
        github_issue_status: githubIssueStatus,
      })
      .eq("id", task.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return normalizeTask(data);
  }

  const store = getMemoryStore();
  const index = store.tasks.findIndex((item) => item.id === task.id);

  if (index === -1) {
    throw new Error("Task not found");
  }

  store.tasks[index] = {
    ...store.tasks[index],
    github_issue_url: issue.html_url,
    github_issue_number: issue.number,
    github_issue_created_at: issue.created_at,
    github_issue_status: githubIssueStatus,
    updated_at: new Date().toISOString(),
  };

  return store.tasks[index];
}

export async function getDashboardSummary() {
  const [projects, tasks] = await Promise.all([listProjects(), listTasks()]);

  return {
    connectedMVPs: projects.length,
    openIssues: tasks.filter((task) => task.status !== "Deployed" && task.status !== "Rejected")
      .length,
    fixPromptsGenerated: tasks.filter((task) => task.fix_prompt.trim()).length,
    prsReady: tasks.filter((task) => task.status === "PR Ready").length,
  };
}

export async function getRecentTasks(limit = 5): Promise<ImprovementTaskWithProject[]> {
  const tasks = await listTasks();
  return tasks.slice(0, limit);
}
