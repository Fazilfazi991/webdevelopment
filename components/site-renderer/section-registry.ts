import type { ComponentType } from "react";
import type { SectionComponentProps } from "@/lib/site-renderer/template-types";
import { AboutImageLeft } from "@/components/site-renderer/sections/about-image-left";
import { AboutImageRight } from "@/components/site-renderer/sections/about-image-right";
import { ContactCtaBanner } from "@/components/site-renderer/sections/contact-cta-banner";
import { ContactMapForm } from "@/components/site-renderer/sections/contact-map-form";
import { FaqAccordion } from "@/components/site-renderer/sections/faq-accordion";
import { FloatingWhatsapp } from "@/components/site-renderer/sections/floating-whatsapp";
import { FooterStandard } from "@/components/site-renderer/sections/footer-standard";
import { HeaderClean } from "@/components/site-renderer/sections/header-clean";
import { HeaderTopbarStandard } from "@/components/site-renderer/sections/header-topbar-standard";
import { HeroBackgroundOverlay } from "@/components/site-renderer/sections/hero-background-overlay";
import { HeroMinimalServices } from "@/components/site-renderer/sections/hero-minimal-services";
import { HeroSplitImage } from "@/components/site-renderer/sections/hero-split-image";
import { ProjectGalleryGrid } from "@/components/site-renderer/sections/project-gallery-grid";
import { ServiceHighlightsRow } from "@/components/site-renderer/sections/service-highlights-row";
import { ServicesAlternatingRows } from "@/components/site-renderer/sections/services-alternating-rows";
import { ServicesCardGrid } from "@/components/site-renderer/sections/services-card-grid";
import { ServicesIconGrid } from "@/components/site-renderer/sections/services-icon-grid";
import { TestimonialsCards } from "@/components/site-renderer/sections/testimonials-cards";
import { WhyChooseUsGrid } from "@/components/site-renderer/sections/why-choose-us-grid";

type RegisteredSection = ComponentType<SectionComponentProps<unknown, unknown>>;

export const sectionRegistry: Record<string, RegisteredSection> = {
  "header-topbar-standard": HeaderTopbarStandard as RegisteredSection,
  "header-clean": HeaderClean as RegisteredSection,
  "hero-split-image": HeroSplitImage as RegisteredSection,
  "hero-background-overlay": HeroBackgroundOverlay as RegisteredSection,
  "hero-minimal-services": HeroMinimalServices as RegisteredSection,
  "service-highlights-row": ServiceHighlightsRow as RegisteredSection,
  "about-image-left": AboutImageLeft as RegisteredSection,
  "about-image-right": AboutImageRight as RegisteredSection,
  "services-card-grid": ServicesCardGrid as RegisteredSection,
  "services-icon-grid": ServicesIconGrid as RegisteredSection,
  "services-alternating-rows": ServicesAlternatingRows as RegisteredSection,
  "why-choose-us-grid": WhyChooseUsGrid as RegisteredSection,
  "project-gallery-grid": ProjectGalleryGrid as RegisteredSection,
  "testimonials-cards": TestimonialsCards as RegisteredSection,
  "faq-accordion": FaqAccordion as RegisteredSection,
  "contact-cta-banner": ContactCtaBanner as RegisteredSection,
  "contact-map-form": ContactMapForm as RegisteredSection,
  "footer-standard": FooterStandard as RegisteredSection,
  "floating-whatsapp": FloatingWhatsapp as RegisteredSection
};
