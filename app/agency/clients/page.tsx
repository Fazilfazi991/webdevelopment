import { archiveClientAction, saveClientAction } from "@/app/agency-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { requireAgencyContext } from "@/lib/access-control";
import { countries } from "@/lib/constants";
import type { Client } from "@/lib/types";

export default async function AgencyClientsPage({ searchParams }: { searchParams: { error?: string; message?: string } }) {
  const { supabase, agency } = await requireAgencyContext();
  const { data: clients } = await supabase.from("clients").select("*").eq("agency_id", agency.id).order("created_at", { ascending: false }).returns<Client[]>();
  return (
    <div className="grid gap-6">
      <StatusMessage error={searchParams.error} message={searchParams.message} />
      <Card className="p-5">
        <h2 className="text-lg font-bold text-ink">Add client</h2>
        <form action={saveClientAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Client name"><input className={inputClassName} name="name" required /></Field>
          <Field label="Company"><input className={inputClassName} name="companyName" /></Field>
          <Field label="Email"><input className={inputClassName} name="email" type="email" /></Field>
          <Field label="Phone"><input className={inputClassName} name="phone" /></Field>
          <Field label="Country">
            <select className={inputClassName} name="countryCode" defaultValue="">
              <option value="">Not set</option>
              {countries.map((country) => <option key={country.value} value={country.value}>{country.label}</option>)}
            </select>
          </Field>
          <Field label="Notes"><textarea className={inputClassName} name="notes" rows={3} /></Field>
          <Button type="submit" className="md:col-span-2">Save client</Button>
        </form>
      </Card>
      <div className="grid gap-3">
        {clients?.length ? clients.map((client) => (
          <Card key={client.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-ink">{client.company_name || client.name}</h3>
                <p className="mt-1 text-sm text-muted">{client.name}{client.email ? ` - ${client.email}` : ""}</p>
              </div>
              <form action={archiveClientAction}>
                <input type="hidden" name="clientId" value={client.id} />
                <Button type="submit" variant="secondary">Archive</Button>
              </form>
            </div>
          </Card>
        )) : <EmptyState title="No clients yet" description="Add a client before creating their website." />}
      </div>
    </div>
  );
}
