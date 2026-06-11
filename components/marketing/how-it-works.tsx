import { HOW_IT_WORKS_STEPS } from "./marketing-content";

type StepIconProps = { className?: string };

function IconChooseIndustry({ className }: StepIconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" className={className}>
      <rect x="2" y="2" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="2" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="12" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="12" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconPickTemplate({ className }: StepIconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" className={className}>
      <rect x="2" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 2v4M15 2v4M2 9h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="5" y="12" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="13" y="12" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function IconAddDetails({ className }: StepIconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" className={className}>
      <path d="M16 3l3 3L7 18H4v-3L16 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13 6l3 3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconPreview({ className }: StepIconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" className={className}>
      <path d="M1 11s4-7 10-7 10 7 10 7-4 7-10 7S1 11 1 11z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconPublish({ className }: StepIconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" className={className}>
      <path d="M11 2s5 4 5 10v5h-3l-2-3-2 3H6v-5C6 6 11 2 11 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 17c-1 1-2 2-3 3M14 17c1 1 2 2 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const STEP_ICON_COMPONENTS = [
  IconChooseIndustry,
  IconPickTemplate,
  IconAddDetails,
  IconPreview,
  IconPublish
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-white py-16 sm:py-20"
      aria-label="How it works"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How It Works</h2>
          <p className="mt-3 text-base text-gray-500">
            A simple, guided process to get your website live
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Horizontal connector line (desktop only) */}
          <div
            className="absolute left-0 right-0 top-[28px] hidden h-px lg:block"
            style={{
              background:
                "linear-gradient(to right, transparent 5%, #e5e7eb 20%, #e5e7eb 80%, transparent 95%)"
            }}
            aria-hidden="true"
          />

          <div className="relative grid gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {HOW_IT_WORKS_STEPS.map((step, i) => {
              const Icon = STEP_ICON_COMPONENTS[i];
              return (
                <div key={step.number} className="flex flex-col items-center gap-3 text-center">
                  {/* Icon circle */}
                  <div
                    className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-white"
                    style={{
                      color: "#E8611A",
                      boxShadow: "0 0 0 4px #FEF0E8, 0 4px 12px rgba(0,0,0,0.08)"
                    }}
                  >
                    <Icon />
                  </div>

                  {/* Step number + title */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Step {step.number}
                    </p>
                    <h3 className="mt-1 text-sm font-bold text-gray-900">{step.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
