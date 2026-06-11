"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notifyAccessEvent } from "@/lib/publishing/email";
import { permissionLabels, permissionsForRole, requireAgencyContext } from "@/lib/access-control";
import { requireDashboardContext, requireUser } from "@/lib/data";
import { agencySchema, clientSchema, inviteClientSchema, ownershipTransferSchema, teamMemberSchema } from "@/lib/validators/agency";
import { siteSchema } from "@/lib/validators/onboarding";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function selectedPermissions(formData: FormData, role: Parameters<typeof permissionsForRole>[0]) {
  if (role === "client_owner" || role === "agency_owner" || role === "agency_admin") return permissionsForRole(role);
  if (role === "client_viewer") {
    return {
      preview_site: true,
      view_leads: formData.get("view_leads") === "on"
    };
  }
  if (role === "client_editor") {
    return {
      ...permissionsForRole(role),
      view_leads: formData.get("view_leads") === "on",
      update_leads: formData.get("update_leads") === "on"
    };
  }
  const allowed = new Set(Object.keys(permissionsForRole(role)));
  return Object.fromEntries(permissionLabels.map((item) => [item.key, allowed.has(item.key) && formData.get(item.key) === "on"]));
}

async function logActivity(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"], siteId: string, userId: string, actionType: string, actionSummary: string, metadata: Record<string, unknown> = {}) {
  await supabase.from("site_activity_log").insert({ site_id: siteId, actor_user_id: userId, action_type: actionType, action_summary: actionSummary, metadata });
}

export async function createAgencyWorkspaceAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const input = agencySchema.safeParse({
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    countryCode: value(formData, "countryCode"),
    website: value(formData, "website"),
    supportEmail: value(formData, "supportEmail")
  });
  if (!input.success) redirect(`/onboarding/agency?error=${encodeURIComponent(input.error.errors[0].message)}`);

  const { data: agencyExisting } = await supabase.from("agencies").select("id").eq("slug", input.data.slug).maybeSingle();
  if (agencyExisting) redirect("/onboarding/agency?error=That workspace slug is already taken.");

  const agencyId = crypto.randomUUID();
  const organizationId = crypto.randomUUID();
  const { error: orgError } = await supabase.from("organizations").insert({
    id: organizationId,
    name: input.data.name,
    slug: input.data.slug,
    country_code: input.data.countryCode,
    default_currency: "USD",
    timezone: "Asia/Dubai",
    created_by: user.id
  });
  if (orgError && orgError.code !== "23505") redirect(`/onboarding/agency?error=${encodeURIComponent("Could not prepare your workspace.")}`);
  if (!orgError) await supabase.from("organization_members").insert({ organization_id: organizationId, user_id: user.id, role: "owner" });

  const { error } = await supabase.from("agencies").insert({
    id: agencyId,
    name: input.data.name,
    slug: input.data.slug,
    country_code: input.data.countryCode,
    website: input.data.website || null,
    support_email: input.data.supportEmail || null,
    created_by: user.id
  });
  if (error) redirect(`/onboarding/agency?error=${encodeURIComponent(error.code === "23505" ? "That workspace slug is already taken." : "Could not create your workspace.")}`);

  await supabase.from("agency_members").insert({ agency_id: agencyId, user_id: user.id, role: "owner", invited_by: user.id, joined_at: new Date().toISOString() });
  revalidatePath("/", "layout");
  redirect("/agency");
}

export async function saveClientAction(formData: FormData) {
  const { supabase, user, agency } = await requireAgencyContext();
  const input = clientSchema.safeParse({
    clientId: value(formData, "clientId") || undefined,
    name: value(formData, "name"),
    companyName: value(formData, "companyName"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    countryCode: value(formData, "countryCode"),
    notes: value(formData, "notes")
  });
  if (!input.success) redirect(`/agency/clients?error=${encodeURIComponent(input.error.errors[0].message)}`);
  const payload = {
    agency_id: agency.id,
    name: input.data.name,
    company_name: input.data.companyName || null,
    email: input.data.email || null,
    phone: input.data.phone || null,
    country_code: input.data.countryCode || null,
    notes: input.data.notes || null,
    created_by: user.id
  };
  const result = input.data.clientId
    ? await supabase.from("clients").update(payload).eq("id", input.data.clientId).eq("agency_id", agency.id)
    : await supabase.from("clients").insert(payload);
  if (result.error) redirect("/agency/clients?error=Could not save client.");
  revalidatePath("/agency/clients");
  redirect("/agency/clients?message=Client saved.");
}

export async function archiveClientAction(formData: FormData) {
  const { supabase, agency } = await requireAgencyContext();
  await supabase.from("clients").update({ status: "archived" }).eq("id", value(formData, "clientId")).eq("agency_id", agency.id);
  revalidatePath("/agency/clients");
  redirect("/agency/clients?message=Client archived.");
}

export async function createAgencyWebsiteAction(formData: FormData) {
  const agencyContext = await requireAgencyContext();
  const dashboard = await requireDashboardContext();
  const input = siteSchema.safeParse({ name: value(formData, "name"), slug: value(formData, "slug"), websiteType: "business_website" });
  const clientId = value(formData, "clientId");
  if (!input.success) redirect(`/agency/websites?error=${encodeURIComponent(input.error.errors[0].message)}`);
  const { data: client } = await agencyContext.supabase.from("clients").select("id").eq("id", clientId).eq("agency_id", agencyContext.agency.id).maybeSingle();
  if (!client) redirect("/agency/websites?error=Choose a valid client for this workspace.");

  const { data: site, error } = await agencyContext.supabase
    .from("sites")
    .insert({
      organization_id: dashboard.organization.id,
      name: input.data.name,
      slug: input.data.slug,
      website_type: "business_website",
      status: "draft",
      country_code: dashboard.organization.country_code,
      default_language: "en",
      setup_step: "website_type",
      created_by: agencyContext.user.id
    })
    .select("id")
    .single();
  if (error || !site) redirect("/agency/websites?error=Could not create website.");

  await agencyContext.supabase.from("site_ownership").upsert({ site_id: site.id, ownership_type: "agency", owner_agency_id: agencyContext.agency.id }, { onConflict: "site_id" });
  await agencyContext.supabase.from("agency_site_clients").insert({
    agency_id: agencyContext.agency.id,
    client_id: client.id,
    site_id: site.id,
    created_by: agencyContext.user.id
  });
  await agencyContext.supabase.from("site_access_members").upsert({
    site_id: site.id,
    user_id: agencyContext.user.id,
    access_role: "agency_owner",
    permissions: permissionsForRole("agency_owner"),
    granted_by: agencyContext.user.id
  }, { onConflict: "site_id,user_id" });
  await logActivity(agencyContext.supabase, site.id, agencyContext.user.id, "member_added", "Agency owner access created", { clientId: clientId || null });
  redirect(`/dashboard/websites/${site.id}/setup/type`);
}

export async function inviteClientAction(formData: FormData) {
  const { supabase, user } = await requireAgencyContext();
  const input = inviteClientSchema.safeParse({
    clientId: value(formData, "clientId"),
    siteId: value(formData, "siteId"),
    email: value(formData, "email"),
    accessRole: value(formData, "accessRole"),
    expiresInDays: value(formData, "expiresInDays") || "14"
  });
  if (!input.success) redirect(`/agency/invitations?error=${encodeURIComponent(input.error.errors[0].message)}`);
  const permissions = selectedPermissions(formData, input.data.accessRole);
  const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const expiresAt = new Date(Date.now() + input.data.expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from("client_invitations").insert({
    client_id: input.data.clientId,
    site_id: input.data.siteId,
    email: input.data.email,
    invitation_token: token,
    invitation_status: "pending",
    access_role: input.data.accessRole,
    permissions,
    keep_developer_access: value(formData, "keepDeveloperAccess") !== "false",
    expires_at: expiresAt,
    invited_by: user.id
  });
  if (error) redirect("/agency/invitations?error=Could not create invitation.");
  await logActivity(supabase, input.data.siteId, user.id, "client_invited", "Client invited", { accessRole: input.data.accessRole });
  await notifyAccessEvent("client_invitation", input.data.email, { invitationUrl: `/invitations/${token}` });
  revalidatePath("/agency/invitations");
  redirect(`/agency/invitations?message=Invitation created. Share /invitations/${token} with the client.`);
}

export async function cancelInvitationAction(formData: FormData) {
  const { supabase } = await requireAgencyContext();
  await supabase.from("client_invitations").update({ invitation_status: "cancelled" }).eq("id", value(formData, "invitationId"));
  revalidatePath("/agency/invitations");
  redirect("/agency/invitations?message=Invitation cancelled.");
}

export async function inviteTeamMemberAction(formData: FormData) {
  const { agency } = await requireAgencyContext();
  const input = teamMemberSchema.safeParse({ email: value(formData, "email"), role: value(formData, "role") });
  if (!input.success) redirect("/agency/team?error=Enter a valid team invitation.");
  await notifyAccessEvent("agency_team_invitation", input.data.email, { agencyId: agency.id, role: input.data.role });
  redirect("/agency/team?message=Team invitation prepared. Email delivery can be connected later.");
}

export async function requestOwnershipTransferAction(formData: FormData) {
  const { supabase, user } = await requireAgencyContext();
  const input = ownershipTransferSchema.safeParse({
    siteId: value(formData, "siteId"),
    toUserId: value(formData, "toUserId") || undefined,
    preserveDeveloperAccess: value(formData, "preserveDeveloperAccess") || "true"
  });
  if (!input.success) redirect("/agency/websites?error=Could not request transfer.");
  await supabase.from("site_ownership_transfers").insert({
    site_id: input.data.siteId,
    from_ownership_type: "agency",
    to_ownership_type: "client",
    from_owner_reference: "agency",
    to_owner_reference: input.data.toUserId ?? "pending-client",
    preserve_developer_access: input.data.preserveDeveloperAccess === "true",
    requested_by: user.id
  });
  await logActivity(supabase, input.data.siteId, user.id, "ownership_transfer_requested", "Ownership transfer requested", { preserveDeveloperAccess: input.data.preserveDeveloperAccess });
  redirect("/agency/websites?message=Ownership transfer requested.");
}

export async function cancelOwnershipTransferAction(formData: FormData) {
  const { supabase, user } = await requireAgencyContext();
  const transferId = value(formData, "transferId");
  const siteId = value(formData, "siteId");
  const { error } = await supabase
    .from("site_ownership_transfers")
    .update({ status: "cancelled", approved_by: user.id })
    .eq("id", transferId)
    .eq("site_id", siteId)
    .eq("status", "pending");
  if (error) redirect("/agency/websites?error=Could not cancel transfer.");
  await logActivity(supabase, siteId, user.id, "ownership_transfer_cancelled", "Ownership transfer cancelled");
  redirect("/agency/websites?message=Ownership transfer cancelled.");
}

export async function acceptInvitationAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const token = value(formData, "token");
  const { data: invitation } = await supabase.from("client_invitations").select("*").eq("invitation_token", token).maybeSingle();
  if (!invitation || invitation.invitation_status !== "pending" || new Date(invitation.expires_at).getTime() < Date.now()) {
    redirect(`/invitations/${token}?error=This invitation is no longer available.`);
  }
  const permissions = Object.keys(invitation.permissions ?? {}).length ? invitation.permissions : permissionsForRole(invitation.access_role);
  const { error: accessError } = await supabase.from("site_access_members").insert({
    site_id: invitation.site_id,
    user_id: user.id,
    access_role: invitation.access_role,
    permissions,
    granted_by: invitation.invited_by
  });
  if (accessError) redirect(`/invitations/${token}?error=Could not accept invitation.`);
  await supabase.from("client_invitations").update({ invitation_status: "accepted", accepted_by: user.id, accepted_at: new Date().toISOString() }).eq("id", invitation.id);
  await logActivity(supabase, invitation.site_id, user.id, "client_invitation_accepted", "Client invitation accepted");
  await notifyAccessEvent("client_invitation_accepted", invitation.email, { siteId: invitation.site_id });
  redirect("/client");
}

export async function acceptOwnershipTransferAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const transferId = value(formData, "transferId");
  const { data: transfer } = await supabase.from("site_ownership_transfers").select("*").eq("id", transferId).eq("status", "pending").maybeSingle();
  if (!transfer) redirect("/client?error=This transfer is no longer available.");

  const { data: access } = await supabase
    .from("site_access_members")
    .select("access_role, permissions")
    .eq("site_id", transfer.site_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!access || access.access_role !== "client_owner") redirect(`/client/websites/${transfer.site_id}?error=Only the client owner can accept this transfer.`);

  const completedAt = new Date().toISOString();
  const { error: ownershipError } = await supabase
    .from("site_ownership")
    .update({
      ownership_type: "client",
      owner_client_user_id: user.id,
      transferred_by: transfer.requested_by,
      transferred_at: completedAt
    })
    .eq("site_id", transfer.site_id);
  if (ownershipError) redirect(`/client/websites/${transfer.site_id}?error=Could not complete ownership transfer.`);

  await supabase.from("site_ownership_transfers").update({ status: "completed", approved_by: user.id, completed_at: completedAt }).eq("id", transfer.id);
  if (transfer.preserve_developer_access === false) {
    await supabase.from("site_access_members").delete().eq("site_id", transfer.site_id).in("access_role", ["agency_owner", "agency_admin", "developer"]);
  }
  await logActivity(supabase, transfer.site_id, user.id, "ownership_transferred", "Ownership transferred to client");
  await notifyAccessEvent("ownership_transfer_completed", undefined, { siteId: transfer.site_id });
  redirect(`/client/websites/${transfer.site_id}?message=Ownership transfer completed.`);
}
