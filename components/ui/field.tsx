import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      <span>{label}</span>
      {children}
      {error ? <span className="text-sm font-medium text-danger">{error}</span> : null}
    </label>
  );
}

export const inputClassName = cn(
  "min-h-11 w-full rounded-app border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition",
  "placeholder:text-muted focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
);
