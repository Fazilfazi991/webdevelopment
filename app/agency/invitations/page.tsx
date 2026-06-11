import { cancelInvitationAction, inviteClientAction } from "@/app/agency-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { permissionLabels, permissionPresets, requireAgencyContext } from "@/lib/access-control";
import type { Client, ClientInvitation, Site } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function AgencyInvitationsPage({ searchParams }: { searchParams: { error?: string; message?: string } }) {
  const { supabase, agency } = await requireAgencyContext();
  const [{ data: clients }, { data: ownership }, { data: invitations }] = await Promise.all([
    supabase.from("clients").select("*").eq("agency_id", agency.id).returns<Client[]>(),
    supabase.from("site_ownership").select("*, sites(*)").eq("owner_agency_id", agency.id),
    supabase.from("client_invitations").select("*").order("created_at", { ascending: false }).returns<ClientInvitation[]>()
  ]);
  const sites = (ownership ?? []).map((item) => item.sites).filter(Boolean) as Site[];
  return (
    <div className="grid gap-6">
      <StatusMessage error={searchParams.error} message={searchParams.message} />
      <Card className="p-5">
        <h2 className="text-lg font-bold text-ink">Invite client</h2>
        <form action={inviteClientAction} className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Client"><select className={inputClassName} name="clientId" required><option value="">Select client</option>{clients?.map((client) => <option key={client.id} value={client.id}>{client.company_name || client.name}</option>)}</select></Field>
            <Field label="Website"><select className={inputClassName} name="siteId" required><option value="">Select website</option>{sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}</select></Field>
            <Field label="Email"><input className={inputClassName} name="email" type="email" required /></Field>
            <Field label="Access level"><select className={inputClassName} name="accessRole" defaultValue="client_editor"><option value="client_owner">Client owner</option><option value="client_editor">Client editor</option><option value="client_viewer">Client viewer</option></select></Field>
            <Field label="Expires in days"><input className={inputClassName} name="expiresInDays" type="number" min={1} max={60} defaultValue={14} /></Field>
          </div>
          <div className="grid gap-2 rounded-app bg-canvas p-3 md:grid-cols-2">
            {permissionLabels.map((item) => (
              <label key={item.key} className="flex items-center gap-2 text-sm font-semibold text-ink">
                <input type="checkbox" name={item.key} defaultChecked={permissionPresets.client_editor[item.key] === true} />
                {item.label}
              </label>
            ))}
          </div>
          <Button type="submit">Create invitation</Button>
        </form>
      </Card>
      <div className="grid gap-3">
        {invitations?.length ? invitations.map((invitation) => (
          <Card key={invitation.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-ink">{invitation.email}</p>
                <p className="mt-1 text-sm text-muted">{invitation.access_role} - {invitation.invitation_status} - Expires {formatDate(invitation.expires_at)}</p>
              </div>
              {invitation.invitation_status === "pending" ? (
                <form action={cancelInvitationAction}>
                  <input type="hidden" name="invitationId" value={invitation.id} />
                  <Button type="submit" variant="secondary">Cancel</Button>
                </form>
              ) : null}
            </div>
          </Card>
        )) : <EmptyState title="No invitations yet" description="Invite a client when the website is ready for review or handover." />}
      </div>
    </div>
  );
}
