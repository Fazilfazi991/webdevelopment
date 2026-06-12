import { z } from "zod";
import { reservedSubdomains } from "@/lib/publishing/constants";

export const subdomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use at least 3 characters")
  .max(63, "Keep the subdomain under 63 characters")
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "Use lowercase letters, numbers, and hyphens")
  .refine((value) => !reservedSubdomains.has(value), "That subdomain is reserved");

export const publishSchema = z.object({
  siteId: z.string().uuid(),
  subdomain: subdomainSchema
});

export const unpublishSchema = z.object({
  siteId: z.string().uuid()
});

export const seoSchema = z.object({
  siteId: z.string().uuid(),
  seoTitle: z.string().trim().max(60, "Keep SEO titles under 60 characters").optional(),
  seoDescription: z.string().trim().max(160, "Keep descriptions under 160 characters").optional(),
  seoKeywords: z.string().trim().max(240).optional(),
  ogTitle: z.string().trim().max(70).optional(),
  ogDescription: z.string().trim().max(200).optional(),
  robotsIndex: z.enum(["on", "off"]),
  robotsFollow: z.enum(["on", "off"])
});

export const customDomainSchema = z.object({
  siteId: z.string().uuid(),
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .min(4)
    .max(253)
    .regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i, "Enter a valid domain")
});

export const leadSchema = z.object({
  siteId: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(160).or(z.literal("")).optional(),
  phone: z.string().trim().max(40).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  subject: z.string().trim().max(160).optional(),
  message: z.string().trim().min(5).max(2000),
  sourcePage: z.string().trim().max(80).optional(),
  sourceUrl: z.string().trim().max(500).optional(),
  honeypot: z.string().max(0).optional(),
  submittedAt: z.coerce.number()
});

export const leadUpdateSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(["new", "contacted", "qualified", "closed", "spam"]),
  isRead: z.enum(["true", "false"])
});
