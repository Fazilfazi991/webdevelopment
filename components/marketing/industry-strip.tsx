import { INDUSTRIES } from "./marketing-content";

export function IndustryStrip() {
  return (
    <section
      className="border-y border-gray-100 bg-gray-50 py-12 sm:py-16"
      aria-label="Supported industries"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-2xl font-extrabold text-gray-900 sm:text-3xl">
          Designed for Service Businesses
        </h2>

        <div className="grid grid-cols-5 gap-4 sm:grid-cols-10">
          {INDUSTRIES.map((industry) => (
            <div
              key={industry.label}
              className="flex flex-col items-center gap-2 text-center"
            >
              {/* Icon box */}
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl text-xl shadow-sm"
                style={{ backgroundColor: "#FEF0E8", border: "1px solid #FDDBC5" }}
                aria-hidden="true"
              >
                {industry.icon}
              </span>
              <span className="text-xs font-medium text-gray-600">{industry.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
