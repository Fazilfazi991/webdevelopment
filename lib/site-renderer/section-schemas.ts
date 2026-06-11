import { z } from "zod";

const actionSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1)
});

const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1)
});

const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1)
});

const headingBlockSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  body: z.string().optional()
});

const serviceItemSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  image: imageSchema.optional()
});

const textCardItemSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1)
});

export const headerSchema = z.object({
  companyName: z.string().min(1),
  tagline: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  location: z.string().optional(),
  nav: z.array(navItemSchema).default([]),
  primaryAction: actionSchema.optional()
});

export const heroSplitSchema = headingBlockSchema.extend({
  primaryAction: actionSchema.optional(),
  secondaryAction: actionSchema.optional(),
  image: imageSchema.optional(),
  proofPoints: z.array(z.string()).default([])
});

export const heroBackgroundSchema = headingBlockSchema.extend({
  image: imageSchema.optional()
});

export const heroMinimalSchema = headingBlockSchema.extend({
  services: z.array(z.string()).default([])
});

export const serviceHighlightsSchema = z.object({
  items: z.array(textCardItemSchema).default([])
});

export const aboutSchema = headingBlockSchema.extend({
  image: imageSchema.optional(),
  bullets: z.array(z.string()).default([])
});

export const servicesGridSchema = headingBlockSchema.extend({
  items: z.array(serviceItemSchema).default([])
});

export const servicesRowsSchema = headingBlockSchema.extend({
  items: z.array(serviceItemSchema).default([])
});

export const whyChooseSchema = headingBlockSchema.extend({
  items: z.array(textCardItemSchema).default([])
});

export const gallerySchema = headingBlockSchema.extend({
  items: z.array(serviceItemSchema).default([])
});

export const testimonialsSchema = headingBlockSchema.extend({
  items: z
    .array(
      z.object({
        quote: z.string().min(1),
        name: z.string().min(1),
        context: z.string().optional()
      })
    )
    .default([])
});

export const faqSchema = headingBlockSchema.extend({
  items: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1)
      })
    )
    .default([])
});

export const ctaSchema = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  primaryAction: actionSchema.optional(),
  secondaryAction: actionSchema.optional()
});

export const contactSchema = headingBlockSchema.extend({
  phone: z.string().optional(),
  email: z.string().optional(),
  location: z.string().optional(),
  formTitle: z.string().optional(),
  siteId: z.string().optional(),
  organizationId: z.string().optional(),
  returnPath: z.string().optional(),
  sourcePage: z.string().optional(),
  leadStatus: z.string().optional()
});

export const footerSchema = z.object({
  companyName: z.string().min(1),
  summary: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  links: z.array(navItemSchema).default([])
});

export const floatingActionSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1)
});

export const emptySettingsSchema = z.object({}).passthrough();

export const sectionSchemas = {
  "header-topbar-standard": headerSchema,
  "header-clean": headerSchema,
  "hero-split-image": heroSplitSchema,
  "hero-background-overlay": heroBackgroundSchema,
  "hero-minimal-services": heroMinimalSchema,
  "service-highlights-row": serviceHighlightsSchema,
  "about-image-left": aboutSchema,
  "about-image-right": aboutSchema,
  "services-card-grid": servicesGridSchema,
  "services-icon-grid": servicesGridSchema,
  "services-alternating-rows": servicesRowsSchema,
  "why-choose-us-grid": whyChooseSchema,
  "project-gallery-grid": gallerySchema,
  "testimonials-cards": testimonialsSchema,
  "faq-accordion": faqSchema,
  "contact-cta-banner": ctaSchema,
  "contact-map-form": contactSchema,
  "footer-standard": footerSchema,
  "floating-whatsapp": floatingActionSchema
} as const;

export function getSectionSchema(key: string) {
  return sectionSchemas[key as keyof typeof sectionSchemas];
}
