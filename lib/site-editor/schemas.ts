import { z } from "zod";

export const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a valid hex colour such as #0f766e");

export const businessProfileSchema = z.object({
  siteId: z.string().uuid(),
  companyName: z.string().trim().min(2, "Enter a company name").max(80),
  tagline: z.string().trim().max(120).optional(),
  shortDescription: z.string().trim().max(240).optional(),
  fullDescription: z.string().trim().max(800).optional(),
  phone: z.string().trim().max(40).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  email: z.string().trim().email("Enter a valid email").or(z.literal("")).optional(),
  addressLine1: z.string().trim().max(120).optional(),
  addressLine2: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  stateRegion: z.string().trim().max(80).optional(),
  countryCode: z.string().trim().length(2, "Use a two-letter country code").optional().or(z.literal("")),
  postalCode: z.string().trim().max(20).optional(),
  mapEmbedUrl: z.string().trim().url("Enter a valid map URL").or(z.literal("")).optional(),
  workingHours: z.string().trim().max(800).optional(),
  socialLinks: z.string().trim().max(800).optional()
});

export const themeOverrideSchema = z.object({
  siteId: z.string().uuid(),
  primaryColor: hexColorSchema,
  secondaryColor: hexColorSchema,
  accentColor: hexColorSchema,
  fontPreset: z.enum(["professional_sans", "modern_clean", "classic_corporate", "friendly_local"]),
  buttonStyle: z.enum(["square", "soft_rounded", "pill"]),
  radiusPreset: z.enum(["minimal", "balanced", "rounded"])
});

export const sectionOverrideSchema = z.object({
  siteId: z.string().uuid(),
  sectionId: z.string().uuid(),
  sectionKey: z.string().min(1),
  content: z.string().trim().min(2, "Section content is required")
});

export const sectionStateSchema = z.object({
  siteId: z.string().uuid(),
  sectionId: z.string().uuid(),
  isEnabled: z.enum(["true", "false"]),
  displayOrder: z.coerce.number().int().min(0).max(9999),
  isRequired: z.enum(["true", "false"])
});

export const mediaSchema = z.object({
  siteId: z.string().uuid(),
  storagePath: z.string().min(10),
  replaceMediaId: z.string().uuid().optional().or(z.literal("")),
  usageType: z.enum(["logo", "hero", "service", "gallery", "about", "favicon", "general"]),
  fileName: z.string().trim().min(2).max(160),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]),
  fileSize: z.coerce.number().int().min(1).max(5242880, "Keep images under 5 MB"),
  width: z.coerce.number().int().min(1).optional(),
  height: z.coerce.number().int().min(1).optional(),
  altText: z.string().trim().max(180).optional()
});

export const removeMediaSchema = z.object({
  siteId: z.string().uuid(),
  mediaId: z.string().uuid()
});

export const updateMediaDetailsSchema = z.object({
  siteId: z.string().uuid(),
  mediaId: z.string().uuid(),
  usageType: z.enum(["logo", "hero", "service", "gallery", "about", "favicon", "general"]),
  altText: z.string().trim().max(180).optional()
});

export const saveVersionSchema = z.object({
  siteId: z.string().uuid()
});
