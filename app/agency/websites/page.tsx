import { ExternalLink, Pencil } from "lucide-react";
import { cancelOwnershipTransferAction, createAgencyWebsiteAction, requestOwnershipTransferAction } from "@/app/agency-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { requireAgencyContext } from "@/lib/access-control";
import { publicSitePath } from "@/lib/publishing/constants";
import type { AgencySiteClient, Client, Site, SiteOwnershipTransfer } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function AgencyWebsitesPage({ searchParams }: { searchParams: { error?: string; message?: string } }) {
  const { supabase, agency } = await requireAgencyContext();
  const [{ data: clients }, { data: ownership }, { data: assignments }, { data: transfers }] = await Promise.all([
    supabase.from("clients").select("*").eq("agency_id", agency.id).returns<Client[]>(),
    supabase.from("site_ownership").select("*, sites(*)").eq("owner_agency_id", agency.id),
    supabase.from("agency_site_clients").select("*").eq("agency_id", agency.id).returns<AgencySiteClient[]>(),
    supabase.from("site_ownership_transfers").select("*").eq("status", "pending").returns<SiteOwnershipTransfer[]>()
  ]);
  const sites = (ownership ?? []).map((item) => item.sites).filter(Boolean) as Site[];
  return (
    <div className="grid gap-6">
      <StatusMessage error={searchParams.error} message={searchParams.message} />
      <Card className="p-5">
        <h2 className="text-lg font-bold text-ink">Create website for a client</h2>
        <form action={createAgencyWebsiteAction} className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Client">
            <select className={inputClassName} name="clientId" required>
              <option value="">Select client</option>
              {clients?.map((client) => <option key={client.id} value={client.id}>{client.company_name || client.name}</option>)}
            </select>
          </Field>
          <Field label="Website name"><input className={inputClassName} name="name" required /></Field>
          <Field label="Slug"><input className={inputClassName} name="slug" required /></Field>
          <Button type="submit" className="md:col-span-3">Create and choose category</Button>
        </form>
      </Card>
      <div className="grid gap-3">
        {sites.length ? sites.map((site) => (
          <Card key={site.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-ink">{site.name}</h3>
                <p className="mt-1 text-sm text-muted">
                  {clients?.find((client) => client.id === assignments?.find((item) => item.site_id === site.id)?.client_id)?.company_name ?? clients?.find((client) => client.id === assignments?.find((item) => item.site_id === site.id)?.client_id)?.name ?? "No client linked"} - {site.status} - Updated {formatDate(site.updated_at)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href={`/dashboard/websites/${site.id}/editor`}><Pencil size={16} /> Edit Website</ButtonLink>
                <ButtonLink href={`/dashboard/websites/${site.id}/preview`} variant="secondary">Preview</ButtonLink>
                {site.primary_subdomain ? <ButtonLink href={publicSitePath(site.primary_subdomain)} variant="secondary"><ExternalLink size={16} /> Live</ButtonLink> : null}
              </div>
            </div>
            {transfers?.find((transfer) => transfer.site_id === site.id) ? (
              <form action={cancelOwnershipTransferAction} className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                <input type="hidden" name="siteId" value={site.id} />
                <input type="hidden" name="transferId" value={transfers.find((transfer) => transfer.site_id === site.id)?.id} />
                <Button type="submit" variant="secondary">Cancel pending transfer</Button>
              </form>
            ) : (
              <form action={requestOwnershipTransferAction} className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_auto]">
                <input type="hidden" name="siteId" value={site.id} />
                <label className="grid gap-1 text-sm font-semibold text-ink">
                  Developer access after handover
                  <select className={inputClassName} name="preserveDeveloperAccess" defaultValue="true">
                    <option value="true">Keep developer access</option>
                    <option value="false">Remove agency/developer access</option>
                  </select>
                </label>
                <Button type="submit" variant="secondary" className="self-end">Request ownership transfer</Button>
              </form>
            )}
          </Card>
        )) : <EmptyState title="No agency websites yet" description="Create a website for a client to start the guided setup." />}
      </div>
    </div>
  );
}
