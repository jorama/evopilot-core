import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function PageHeader({ title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
