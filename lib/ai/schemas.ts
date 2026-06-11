import { z } from "zod";
import { aiRequestTypes } from "@/lib/ai/types";

const shortText = z.string().trim().min(1).max(240);
const titleText = z.string().trim().min(1).max(80);
const longText = z.string().trim().min(1).max(800);

export const aiProfileFormSchema = z.object({
  siteId: z.string().uuid(),
  businessName: titleText,
  businessType: z.string().trim().max(80).optional(),
  industry: z.string().trim().max(80).optional(),
  targetAudience: z.string().trim().max(180).optional(),
  primaryLocation: z.string().trim().max(120).optional(),
  serviceAreas: z.string().trim().max(800).optional(),
  services: z.string().trim().max(1200).optional(),
  uniqueSellingPoints: z.string().trim().max(1200).optional(),
  tone: z.enum(["Professional", "Friendly", "Premium", "Simple and direct", "Technical"]),
  preferredLanguage: z.string().trim().min(2).max(40),
  additionalLanguages: z.array(z.string().trim().max(40)).default([]),
  primaryGoal: z.string().trim().max(160).optional(),
  ctaPreference: z.string().trim().max(80).optional(),
  contactPreference: z.string().trim().max(80).optional(),
  specialNotes: z.string().trim().max(1000).optional()
});

export const aiActionSchema = z.object({
  siteId: z.string().uuid(),
  requestType: z.enum(aiRequestTypes),
  sectionKey: z.string().trim().max(120).optional(),
  fieldKey: z.string().trim().min(1).max(120),
  currentValue: z.string().trim().max(1200).optional(),
  language: z.string().trim().max(40).optional()
});

export const aiSuggestionIdSchema = z.object({
  siteId: z.string().uuid(),
  suggestionId: z.string().uuid()
});

const ctaSchema = z.object({
  label: z.string().trim().min(1).max(30),
  href: z.string().trim().min(1).max(120)
});

export const controlledContentOutputSchema = z.object({
  businessProfile: z
    .object({
      companyName: titleText.optional(),
      tagline: z.string().trim().max(120).optional(),
      shortDescription: shortText.optional(),
      fullDescription: longText.optional()
    })
    .default({}),
  hero: z
    .object({
      heading: titleText.optional(),
      description: shortText.optional(),
      primaryCtaLabel: z.string().trim().max(30).optional(),
      secondaryCtaLabel: z.string().trim().max(30).optional()
    })
    .default({}),
  about: z
    .object({
      heading: titleText.optional(),
      description: longText.optional(),
      bullets: z.array(z.string().trim().min(1).max(120)).max(6).optional()
    })
    .default({}),
  services: z
    .array(
      z.object({
        title: titleText,
        description: shortText
      })
    )
    .max(8)
    .default([]),
  whyChooseUs: z
    .array(
      z.object({
        title: titleText,
        description: shortText
      })
    )
    .max(6)
    .default([]),
  faq: z
    .array(
      z.object({
        question: titleText,
        answer: shortText
      })
    )
    .max(8)
    .default([]),
  cta: z
    .object({
      title: titleText.optional(),
      body: shortText.optional(),
      primaryAction: ctaSchema.optional()
    })
    .default({}),
  seo: z
    .object({
      title: z.string().trim().min(1).max(70).optional(),
      description: z.string().trim().min(1).max(160).optional(),
      ogTitle: z.string().trim().max(70).optional(),
      ogDescription: z.string().trim().max(160).optional(),
      keywords: z.array(z.string().trim().min(1).max(40)).max(8).optional()
    })
    .default({}),
  recommendedSections: z
    .array(
      z.object({
        sectionKey: z.string().trim().min(1).max(120),
        reason: z.string().trim().min(1).max(180)
      })
    )
    .max(8)
    .default([]),
  imageChecklist: z
    .array(
      z.object({
        slot: z.string().trim().min(1).max(80),
        requirement: z.string().trim().min(1).max(180)
      })
    )
    .max(12)
    .default([])
});

export type ControlledContentOutput = z.infer<typeof controlledContentOutputSchema>;

export const rewriteOutputSchema = z.object({
  value: z.string().trim().min(1).max(1200)
});

export const promptAdminSchema = z.object({
  id: z.string().uuid(),
  purpose: z.string().trim().min(5).max(240),
  promptTemplate: z.string().trim().min(20).max(5000),
  isActive: z.enum(["on", "off"]).optional()
});

export const usageLimitAdminSchema = z.object({
  id: z.string().uuid(),
  requestLimit: z.coerce.number().int().min(0).max(100000),
  tokenLimit: z.coerce.number().int().min(0).max(100000000)
});
