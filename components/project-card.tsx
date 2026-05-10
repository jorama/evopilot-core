import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{project.framework}</p>
        </div>
        <Link href={`/projects/${project.id}`} className="text-sm font-medium text-slate-700 underline">
          View
        </Link>
      </div>
      <p className="mt-3 text-sm text-slate-600">{project.repo_url || "Repository URL not provided"}</p>
    </article>
  );
}
