import { saveCategoryAction } from "@/app/admin/admin-actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { requireAdmin } from "@/lib/data";
import type { BusinessCategory, Industry } from "@/lib/types";

export default async function AdminCategoriesPage({
  searchParams
}: {
  searchParams: { error?: string; message?: string; edit?: string; industry?: string };
}) {
  const { supabase } = await requireAdmin();
  const { data: industries } = await supabase.from("industries").select("*").order("display_order", { ascending: true }).returns<Industry[]>();
  let query = supabase.from("business_categories").select("*").order("display_order", { ascending: true });
  if (searchParams.industry) query = query.eq("industry_id", searchParams.industry);
  const { data: categories } = await query.returns<BusinessCategory[]>();
  const edit = categories?.find((category) => category.id === searchParams.edit);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card className="p-5">
        <h2 className="text-lg font-bold text-ink">{edit ? "Edit category" : "Add category"}</h2>
        <form action={saveCategoryAction} className="mt-5 grid gap-4">
          <StatusMessage error={searchParams.error} message={searchParams.message} />
          <input type="hidden" name="id" value={edit?.id ?? ""} />
          <Field label="Industry">
            <select className={inputClassName} name="industryId" defaultValue={edit?.industry_id ?? searchParams.industry ?? ""} required>
              <option value="">Choose industry</option>
              {industries?.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Name">
            <input className={inputClassName} name="name" defaultValue={edit?.name ?? ""} required />
          </Field>
          <Field label="Slug">
            <input className={inputClassName} name="slug" defaultValue={edit?.slug ?? ""} />
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
          <Button type="submit">Save category</Button>
        </form>
      </Card>

      <div className="grid gap-4">
        <form className="rounded-app border border-line bg-white p-4">
          <Field label="Filter by industry">
            <select className={inputClassName} name="industry" defaultValue={searchParams.industry ?? ""}>
              <option value="">All industries</option>
              {industries?.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" variant="secondary" className="mt-3">Filter</Button>
        </form>
        {categories?.length ? (
          categories.map((category) => {
            const industry = industries?.find((item) => item.id === category.industry_id);
            return (
              <Card key={category.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-ink">{category.name}</h3>
                    <p className="mt-1 text-sm text-muted">{industry?.name ?? "Industry"} - /{category.slug} - {category.is_active ? "Active" : "Inactive"}</p>
                  </div>
                  <a className="text-sm font-semibold text-brand-700" href={`/admin/business-categories?edit=${category.id}`}>
                    Edit
                  </a>
                </div>
              </Card>
            );
          })
        ) : (
          <EmptyState title="No categories yet" description="Add business categories under each industry." />
        )}
      </div>
    </div>
  );
}
