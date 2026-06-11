import { FEATURES } from "./marketing-content";

type IconProps = { className?: string };

function IconGuidedSetup({ className }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 8h4M7 12h1M7 16h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function IconMobileFriendly({ className }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="6" y="2" width="12" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
      <path d="M9 6h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function IconContactReady({ className }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 10h8M8 13h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function IconCustomDomain({ className }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3C9.5 7 9.5 17 12 21M12 3C14.5 7 14.5 17 12 21" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.5 9h17M3.5 15h17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function IconEasyToEdit({ className }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const FEATURE_ICON_COMPONENTS = [
  IconGuidedSetup,
  IconMobileFriendly,
  IconContactReady,
  IconCustomDomain,
  IconEasyToEdit
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-white py-16 sm:py-20"
      aria-label="Platform features"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Everything You Need to Succeed Online
          </h2>
          <p className="mt-3 text-base text-gray-500">
            Powerful features to help you build, launch and grow your business website.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {FEATURES.map((feature, i) => {
            const Icon = FEATURE_ICON_COMPONENTS[i];
            return (
              <div key={feature.title} className="flex flex-col items-center gap-3 text-center">
                {/* Icon */}
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "#FEF0E8", color: "#E8611A" }}
                >
                  <Icon />
                </span>
                <h3 className="text-sm font-bold text-gray-900">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
