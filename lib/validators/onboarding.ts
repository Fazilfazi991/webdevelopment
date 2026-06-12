import { z } from "zod";
import { slugify } from "@/lib/utils";
import { reservedSubdomains } from "@/lib/publishing/constants";

export const organizationSchema = z.object({
  name: z.string().trim().min(2, "Enter an organisation name").max(90),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a slug")
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens")
    .refine((value) => !reservedSubdomains.has(value), "That website address is reserved"),
  countryCode: z.string().min(2),
  defaultCurrency: z.string().min(3),
  timezone: z.string().min(2)
});

export const siteSchema = z.object({
  name: z.string().trim().min(2, "Enter a website name").max(90),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a slug")
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  websiteType: z.literal("business_website"),
  countryCode: z.string().min(2),
  defaultLanguage: z.string().min(2)
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.string().trim().max(30).optional(),
  countryCode: z.string().min(2),
  preferredLanguage: z.string().min(2)
});

export function suggestedSlug(value: string) {
  return slugify(value);
}

export type OrganizationInput = z.infer<typeof organizationSchema>;
export type SiteInput = z.infer<typeof siteSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
