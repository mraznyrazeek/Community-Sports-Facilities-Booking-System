import { ArrowUpRight } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
  href?: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon,
  href,
}: StatCardProps) {
  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-50 opacity-70 transition duration-300 group-hover:scale-125" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>

      {href && (
        <div className="relative mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
          View details
          <ArrowUpRight size={14} />
        </div>
      )}
    </div>
  );

  return href ? (
    <a href={href}>
      {content}
    </a>
  ) : (
    content
  );
}