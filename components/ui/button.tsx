import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-brand-700 text-white hover:bg-brand-900 border-brand-700",
  secondary: "bg-white text-ink hover:bg-brand-50 border-line",
  ghost: "bg-transparent text-ink hover:bg-brand-50 border-transparent",
  danger: "bg-danger text-white hover:bg-red-800 border-danger"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-app border px-4 py-2 text-center text-sm font-semibold leading-snug transition disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: React.ComponentProps<typeof Link> & { variant?: ButtonProps["variant"] }) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-app border px-4 py-2 text-center text-sm font-semibold leading-snug transition",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
