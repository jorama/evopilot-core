import { PageHeader } from "@/components/page-header";
import { ProjectForm } from "@/components/project-form";

export default function NewProjectPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Add MVP"
        description="Connect an existing MVP and configure test + monitoring details."
      />
      <ProjectForm />
    </main>
  );
}
