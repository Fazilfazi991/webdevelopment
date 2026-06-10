import { saveIndustryAction } from "@/app/admin/admin-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { requireAdmin } from "@/lib/data";
import type { Industry } from "@/lib/types";

export default async function AdminIndustriesPage({ searchParams }: { searchParams: { error?: string; message?: string; edit?: string } }) {
  const { supabase } = await requireAdmin();
  const { data: industries } = await supabase.from("industries").select("*").order("display_order", { ascending: true }).returns<Industry[]>();
  const edit = industries?.find((industry) => industry.id === searchParams.edit);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card className="p-5">
        <h2 className="text-lg font-bold text-ink">{edit ? "Edit industry" : "Add industry"}</h2>
        <form action={saveIndustryAction} className="mt-5 grid gap-4">
          <StatusMessage error={searchParams.error} message={searchParams.message} />
          <input type="hidden" name="id" value={edit?.id ?? ""} />
          <Field label="Name">
            <input className={inputClassName} name="name" defaultValue={edit?.name ?? ""} required />
          </Field>
          <Field label="Slug">
            <input className={inputClassName} name="slug" defaultValue={edit?.slug ?? ""} placeholder="construction-technical-services" />
          </Field>
          <Field label="Description">
            <textarea className={inputClassName} name="description" defaultValue={edit?.description ?? ""} rows={3} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Icon name">
              <input className={inputClassName} name="iconName" defaultValue={edit?.icon_name ?? ""} />
            </Field>
            <Field label="Display order">
              <input className={inputClassName} name="displayOrder" type="number" defaultValue={edit?.display_order ?? 0} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <input type="checkbox" name="isActive" defaultChecked={edit?.is_active ?? true} />
            Active
          </label>
          <Button type="submit">Save industry</Button>
        </form>
      </Card>

      <div className="grid gap-3">
        {industries?.length ? (
          industries.map((industry) => (
            <Card key={industry.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-ink">{industry.name}</h3>
                  <p className="mt-1 text-sm text-muted">/{industry.slug} - Order {industry.display_order} - {industry.is_active ? "Active" : "Inactive"}</p>
                </div>
                <a className="text-sm font-semibold text-brand-700" href={`/admin/industries?edit=${industry.id}`}>
                  Edit
                </a>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState title="No industries yet" description="Add industries to power customer template discovery." />
        )}
      </div>
    </div>
  );
}
