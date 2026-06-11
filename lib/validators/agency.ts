import { z } from "zod";

const slug = z.string().trim().toLowerCase().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.");

export const agencySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug,
  countryCode: z.string().length(2),
  website: z.string().trim().url().or(z.literal("")).optional(),
  supportEmail: z.string().trim().email().or(z.literal("")).optional()
});

export const clientSchema = z.object({
  clientId: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  companyName: z.string().trim().max(160).optional(),
  email: z.string().trim().email().or(z.literal("")).optional(),
  phone: z.string().trim().max(40).optional(),
  countryCode: z.string().length(2).or(z.literal("")).optional(),
  notes: z.string().trim().max(2000).optional()
});

export const inviteClientSchema = z.object({
  clientId: z.string().uuid(),
  siteId: z.string().uuid(),
  email: z.string().trim().email(),
  accessRole: z.enum(["client_owner", "client_editor", "client_viewer"]),
  expiresInDays: z.coerce.number().int().min(1).max(60)
});

export const teamMemberSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum(["admin", "developer", "viewer"])
});

export const ownershipTransferSchema = z.object({
  siteId: z.string().uuid(),
  toUserId: z.string().uuid().optional(),
  preserveDeveloperAccess: z.enum(["true", "false"]).default("true")
});
