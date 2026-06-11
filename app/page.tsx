import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { HeroSection } from "@/components/marketing/hero-section";
import { BenefitsStrip } from "@/components/marketing/benefits-strip";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { IndustryStrip } from "@/components/marketing/industry-strip";
import { TemplateShowcase } from "@/components/marketing/template-showcase";
import { FeaturesSection } from "@/components/marketing/features-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const metadata: Metadata = {
  title: "YourPlatform – Build a Professional Business Website in Minutes",
  description:
    "Choose a design, add your business details, and launch a polished website without coding or complicated tools. Trusted by service businesses worldwide."
};

/**
 * Public marketing homepage – loads at /
 * Authenticated users who prefer to go to their dashboard can use the nav.
 */
export default function HomePage() {
  return (
    <div className="overflow-x-hidden bg-white">
      <MarketingHeader />
      <main>
        <HeroSection />
        <BenefitsStrip />
        <HowItWorks />
        <IndustryStrip />
        <TemplateShowcase />
        <FeaturesSection />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
