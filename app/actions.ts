"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TASK_STATUS_OPTIONS } from "@/lib/constants";
import {
  createOrSyncGitHubIssue,
  createProject,
  createTask,
  generateAndSaveFixPrompt,
  updateTaskStatus,
} from "@/lib/data-store";
import type { ActionState, GitHubIssueMode } from "@/lib/types";

const initialActionState: ActionState = {
  success: false,
  message: "",
};

function isRedirectError(error: unknown) {
  return Boolean(error && typeof error === "object" && "digest" in error);
}

export async function createProjectAction(
  _prevState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void _prevState;
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    return { success: false, message: "Project name is required." };
  }

  try {
    const project = await createProject({
      name,
      repo_url: String(formData.get("repo_url") || "").trim(),
      production_url: String(formData.get("production_url") || "").trim(),
      framework: String(formData.get("framework") || "Other") as never,
      test_command: String(formData.get("test_command") || "npm test").trim(),
      playwright_command: String(formData.get("playwright_command") || "npx playwright test").trim(),
      sentry_info: String(formData.get("sentry_info") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
    });

    revalidatePath("/");
    revalidatePath("/tasks");
    redirect(`/projects/${project.id}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to create project.",
    };
  }
}

export async function createTaskAction(
  projectId: string,
  _prevState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void _prevState;
  const title = String(formData.get("title") || "").trim();

  if (!title) {
    return { success: false, message: "Task title is required." };
  }

  try {
    const task = await createTask({
      project_id: projectId,
      title,
      type: String(formData.get("type") || "Bug") as never,
      severity: String(formData.get("severity") || "Medium") as never,
      source: String(formData.get("source") || "Manual") as never,
      page_url: String(formData.get("page_url") || "").trim(),
      error_message: String(formData.get("error_message") || "").trim(),
      steps_to_reproduce: String(formData.get("steps_to_reproduce") || "").trim(),
      expected_behavior: String(formData.get("expected_behavior") || "").trim(),
      actual_behavior: String(formData.get("actual_behavior") || "").trim(),
      logs: String(formData.get("logs") || "").trim(),
      screenshot_url: String(formData.get("screenshot_url") || "").trim(),
    });

    revalidatePath("/");
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/tasks");
    redirect(`/tasks/${task.id}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to create task.",
    };
  }
}

export async function updateTaskStatusAction(taskId: string, formData: FormData) {
  const status = String(formData.get("status") || "");

  if (!TASK_STATUS_OPTIONS.includes(status as never)) {
    return;
  }

  try {
    await updateTaskStatus(taskId, status as never);
    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${taskId}`);
  } catch {
    // no-op
  }
}

export async function generateFixPromptAction(taskId: string) {
  try {
    const task = await generateAndSaveFixPrompt(taskId);
    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath(`/projects/${task.project_id}`);
    revalidatePath(`/tasks/${taskId}`);
  } catch {
    // no-op
  }
}

export async function createGitHubIssueAction(
  taskId: string,
  _prevState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void _prevState;

  const mode = String(formData.get("mode") || "create") as GitHubIssueMode;
  if (!["create", "update", "recreate"].includes(mode)) {
    return { success: false, message: "Invalid GitHub issue action mode." };
  }

  try {
    const task = await createOrSyncGitHubIssue(taskId, mode);

    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath(`/projects/${task.project_id}`);
    revalidatePath(`/tasks/${task.id}`);

    const verb = mode === "update" ? "updated" : "created";
    return {
      success: true,
      message: `GitHub issue ${verb} successfully: ${task.github_issue_url}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to sync GitHub issue.",
    };
  }
}
