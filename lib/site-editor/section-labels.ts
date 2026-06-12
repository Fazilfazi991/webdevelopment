import type { TemplateSectionRecord } from "@/lib/site-renderer/template-types";

export const customerSectionLabels: Record<string, string> = {
  "header-topbar-standard": "Header",
  "header-clean": "Header",
  "hero-split-image": "Hero Banner",
  "hero-background-overlay": "Hero Banner",
  "hero-minimal-services": "Hero Banner",
  "service-highlights-row": "Key Benefits",
  "about-image-left": "About Us",
  "about-image-right": "About Us",
  "services-card-grid": "Services",
  "services-icon-grid": "Services",
  "services-alternating-rows": "Services",
  "why-choose-us-grid": "Why Choose Us",
  "project-gallery-grid": "Projects",
  "testimonials-cards": "Customer Reviews",
  "faq-accordion": "Questions",
  "contact-cta-banner": "Contact Form",
  "contact-map-form": "Contact Form",
  "footer-standard": "Footer",
  "floating-whatsapp": "WhatsApp Button"
};

export const customerSectionDescriptions: Record<string, string> = {
  "Hero Banner": "The first message customers see",
  "Key Benefits": "A quick summary of the business's strongest benefits",
  "About Us": "The business story and introduction",
  Services: "What the business offers",
  "Why Choose Us": "The reasons customers should choose this business",
  Projects: "Photos and examples of recent work",
  "Customer Reviews": "What customers say about the business",
  Questions: "Answers to common customer questions",
  "Contact Form": "Contact details, location, and the enquiry form",
  Footer: "Business details at the bottom of every page"
};

export function customerSectionLabel(section: Pick<TemplateSectionRecord, "section_key"> | string) {
  const key = typeof section === "string" ? section : section.section_key;
  return customerSectionLabels[key] ?? "Website Section";
}
