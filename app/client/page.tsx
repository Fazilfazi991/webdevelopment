import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { requireClientSites } from "@/lib/access-control";

export default async function ClientPage() {
  const { sites } = await requireClientSites();
  if (sites.length === 1) redirect(`/client/websites/${sites[0].id}`);
  return (
    <div className="grid gap-4">
      {sites.length ? sites.map((site) => (
        <Card key={site.id} className="p-5">
          <h2 className="font-bold text-ink">{site.name}</h2>
          <p className="mt-1 text-sm text-muted">{site.publication_status}</p>
          <ButtonLink href={`/client/websites/${site.id}`} className="mt-4">Open website</ButtonLink>
        </Card>
      )) : <EmptyState title="No client websites yet" description="Accepted website invitations will appear here." />}
    </div>
  );
}
