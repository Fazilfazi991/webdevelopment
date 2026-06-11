import { requireDashboardContext } from "@/lib/data";
import type { ContactLead } from "@/lib/types";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { supabase, organization } = await requireDashboardContext();
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");
  let query = supabase
    .from("contact_leads")
    .select("*")
    .eq("organization_id", organization.id)
    .order("submitted_at", { ascending: false });

  if (siteId) query = query.eq("site_id", siteId);

  const { data } = await query.returns<ContactLead[]>();
  const rows = [
    ["submitted_at", "name", "email", "phone", "whatsapp", "subject", "message", "status", "source_page", "source_url"],
    ...(data ?? []).map((lead) => [
      lead.submitted_at,
      lead.name,
      lead.email,
      lead.phone,
      lead.whatsapp,
      lead.subject,
      lead.message,
      lead.status,
      lead.source_page,
      lead.source_url
    ])
  ];

  return new Response(rows.map((row) => row.map(csvCell).join(",")).join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
