import { cn } from "@/lib/utils";

const tone = {
  draft: "bg-amber-50 text-amber-800 border-amber-200",
  published: "bg-emerald-50 text-emerald-800 border-emerald-200",
  suspended: "bg-red-50 text-red-800 border-red-200",
  archived: "bg-slate-100 text-slate-700 border-slate-200"
};

export function StatusBadge({ status }: { status: keyof typeof tone }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize", tone[status])}>
      {status}
    </span>
  );
}
