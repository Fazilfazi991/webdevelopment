import { Globe, Grid, Smartphone, Clock, Shield } from "lucide-react";
import { STATS } from "./marketing-content";

const ICONS = [Globe, Grid, Smartphone, Clock, Shield];

export function BenefitsStrip() {
  return (
    <section
      className="border-y border-gray-100 bg-white py-10"
      aria-label="Platform statistics"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-gray-400">
          Trusted by Business Owners Worldwide
        </p>
        <div className="grid grid-cols-1 gap-6 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((stat, i) => {
            const Icon = ICONS[i];
            return (
              <div key={stat.label} className="flex min-w-0 flex-col items-center gap-2 text-center">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "#FEF0E8" }}
                  aria-hidden="true"
                >
                  <Icon size={20} style={{ color: "#E8611A" }} />
                </span>
                <span className="break-words text-xl font-extrabold text-gray-900">{stat.value}</span>
                <span className="break-words text-xs font-medium text-gray-500">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
