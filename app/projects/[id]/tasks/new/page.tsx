import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/task-form";
import { getProjectById } from "@/lib/data-store";

export default async function NewTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return (
      <main>
        <EmptyState title="Project not found" description="Cannot create a task without a valid project." />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <PageHeader title={`Add Issue for ${project.name}`} description="Create a structured improvement task." />
      <TaskForm projectId={project.id} />
    </main>
  );
}
