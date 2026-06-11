import Link from "next/link";
import { Check } from "lucide-react";
import type { SetupStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const customerSteps: Array<{ label: string; keys: SetupStep[]; hrefPart: string }> = [
  { label: "Business Basics", keys: ["website_type", "industry", "business_category"], hrefPart: "category" },
  { label: "Website Ready", keys: ["template", "template_selected"], hrefPart: "complete" },
  { label: "Edit Details", keys: ["content"], hrefPart: "editor" }
];

export function SetupProgress({ siteId, currentStep }: { siteId: string; currentStep: SetupStep }) {
  const currentIndex = Math.max(
    customerSteps.findIndex((step) => step.keys.includes(currentStep)),
    0
  );

  return (
    <nav aria-label="Website setup progress" className="overflow-x-auto">
      <ol className="flex min-w-max gap-2 rounded-app border border-line bg-white p-2">
        {customerSteps.map((step, index) => {
          const completed = index < currentIndex;
          const active = step.keys.includes(currentStep);
          const href = step.hrefPart === "editor" ? `/dashboard/websites/${siteId}/editor` : `/dashboard/websites/${siteId}/setup/${step.hrefPart}`;
          return (
            <li key={step.label}>
              <Link
                href={href}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-app px-3 text-sm font-semibold",
                  active && "bg-brand-700 text-white",
                  completed && !active && "bg-brand-50 text-brand-700",
                  !active && !completed && "text-muted hover:bg-brand-50 hover:text-ink"
                )}
              >
                <span className="flex size-6 items-center justify-center rounded-full border border-current text-xs">
                  {completed ? <Check size={14} /> : index + 1}
                </span>
                {step.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
