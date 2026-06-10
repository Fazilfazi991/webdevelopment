import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(2, "Enter a slug")
  .max(80, "Keep the slug under 80 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens");

export const websiteTypeStepSchema = z.object({
  siteId: z.string().uuid(),
  websiteType: z.literal("business_website")
});

export const industryStepSchema = z.object({
  siteId: z.string().uuid(),
  industryId: z.string().uuid()
});

export const categoryStepSchema = z.object({
  siteId: z.string().uuid(),
  categoryId: z.string().uuid()
});

export const templateSelectionSchema = z.object({
  siteId: z.string().uuid(),
  templateId: z.string().uuid()
});

export const industryAdminSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Enter an industry name").max(120),
  slug,
  description: z.string().trim().max(300).optional(),
  iconName: z.string().trim().max(60).optional(),
  displayOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean()
});

export const categoryAdminSchema = z.object({
  id: z.string().uuid().optional(),
  industryId: z.string().uuid("Choose an industry"),
  name: z.string().trim().min(2, "Enter a category name").max(120),
  slug,
  description: z.string().trim().max(300).optional(),
  iconName: z.string().trim().max(60).optional(),
  displayOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean()
});

export const templateAdminSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Enter a template name").max(120),
  slug,
  shortDescription: z.string().trim().max(180).optional(),
  longDescription: z.string().trim().max(800).optional(),
  styleLabel: z.string().trim().max(80).optional(),
  thumbnailUrl: z.string().trim().url("Enter a valid thumbnail URL").or(z.literal("")).optional(),
  desktopPreviewUrl: z.string().trim().url("Enter a valid desktop preview URL").or(z.literal("")).optional(),
  mobilePreviewUrl: z.string().trim().url("Enter a valid mobile preview URL").or(z.literal("")).optional(),
  displayOrder: z.coerce.number().int().min(0).max(9999),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  categoryIds: z.array(z.string().uuid()).min(1, "Assign at least one category"),
  pages: z.string().trim().min(2, "Add at least one page")
});
