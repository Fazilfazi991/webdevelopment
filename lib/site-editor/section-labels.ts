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
  "About Preview": "A short introduction that points customers to the full About page",
  "Services Preview": "A short service summary that points customers to the full Services page",
  "Projects Preview": "A short project summary that points customers to the full Projects page",
  "Contact Preview": "A simple contact prompt for the home page",
  "About Page Banner": "The first message on the About page",
  "Our Story": "The business story and company details",
  "What We Offer": "A clear summary of the main work the business handles",
  "Experience and Trust": "Reasons customers can feel confident choosing this business",
  "Call to Action": "A clear next step for customers",
  "Services Page Banner": "The first message on the Services page",
  "All Services": "The complete service list",
  "How We Work": "The business process and service approach",
  "Service Areas": "Where the business works",
  "Request a Quote": "A prompt for customers to ask for pricing or availability",
  "Projects Page Banner": "The first message on the Projects page",
  "Project Gallery": "Photos and examples of recent work",
  "Featured Projects": "Important work examples to highlight",
  "Before and After": "Visual proof of completed work",
  "Contact Page Banner": "The first message on the Contact page",
  "Contact Information": "Phone, email, address, and map details",
  "WhatsApp and Call Actions": "Fast ways for customers to get in touch",
  "Enquiry Form": "The form customers use to send a request",
  "Google Maps": "The location map customers use to find the business",
  "Working Hours": "Opening hours and availability",
  Services: "What the business offers",
  "Why Choose Us": "The reasons customers should choose this business",
  Projects: "Photos and examples of recent work",
  "Customer Reviews": "What customers say about the business",
  Questions: "Answers to common customer questions",
  "Contact Form": "Contact details, location, and the enquiry form",
  Footer: "Business details at the bottom of every page"
};

const pageAwareLabels: Record<string, Record<string, string>> = {
  home: {
    "about-image-left": "About Preview",
    "about-image-right": "About Preview",
    "services-card-grid": "Services Preview",
    "services-icon-grid": "Services Preview",
    "services-alternating-rows": "Services Preview",
    "project-gallery-grid": "Projects Preview",
    "contact-cta-banner": "Contact Preview",
    "contact-map-form": "Contact Preview"
  },
  about: {
    "hero-split-image": "About Page Banner",
    "hero-background-overlay": "About Page Banner",
    "hero-minimal-services": "About Page Banner",
    "about-image-left": "Our Story",
    "about-image-right": "Our Story",
    "service-highlights-row": "What We Offer",
    "services-card-grid": "What We Offer",
    "services-icon-grid": "What We Offer",
    "services-alternating-rows": "What We Offer",
    "why-choose-us-grid": "Experience and Trust",
    "testimonials-cards": "Experience and Trust",
    "contact-cta-banner": "Call to Action",
    "contact-map-form": "Call to Action"
  },
  services: {
    "hero-split-image": "Services Page Banner",
    "hero-background-overlay": "Services Page Banner",
    "hero-minimal-services": "Services Page Banner",
    "services-card-grid": "All Services",
    "services-icon-grid": "All Services",
    "services-alternating-rows": "All Services",
    "service-highlights-row": "Service Areas",
    "why-choose-us-grid": "How We Work",
    "contact-cta-banner": "Request a Quote",
    "contact-map-form": "Request a Quote"
  },
  projects: {
    "hero-split-image": "Projects Page Banner",
    "hero-background-overlay": "Projects Page Banner",
    "hero-minimal-services": "Projects Page Banner",
    "project-gallery-grid": "Project Gallery",
    "testimonials-cards": "Featured Projects",
    "service-highlights-row": "Before and After",
    "contact-cta-banner": "Call to Action",
    "contact-map-form": "Call to Action"
  },
  contact: {
    "hero-split-image": "Contact Page Banner",
    "hero-background-overlay": "Contact Page Banner",
    "hero-minimal-services": "Contact Page Banner",
    "contact-map-form": "Enquiry Form",
    "contact-cta-banner": "WhatsApp and Call Actions",
    "service-highlights-row": "Contact Information",
    "why-choose-us-grid": "Contact Information",
    "faq-accordion": "Working Hours"
  }
};

export function customerSectionLabel(section: Pick<TemplateSectionRecord, "section_key" | "page_slug"> | string) {
  const key = typeof section === "string" ? section : section.section_key;
  const pageSlug = typeof section === "string" ? null : section.page_slug;
  if (pageSlug) return pageAwareLabels[pageSlug]?.[key] ?? customerSectionLabels[key] ?? "Website Section";
  return customerSectionLabels[key] ?? "Website Section";
}
