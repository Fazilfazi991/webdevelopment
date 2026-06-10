import { createSiteAction } from "@/app/actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName } from "@/components/ui/field";
import { websiteTypes } from "@/lib/constants";
import { requireDashboardContext } from "@/lib/data";

export default async function NewWebsitePage({ searchParams }: { searchParams: { error?: string } }) {
  await requireDashboardContext();

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-xl font-bold text-ink">Create website project</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Start with a draft, then choose your business category and design template.
      </p>
      <Card className="mt-5 p-6">
        <form action={createSiteAction} className="grid gap-4">
          <StatusMessage error={searchParams.error} />
          <Field label="Website name">
            <input className={inputClassName} name="name" placeholder="Acme Technical Services" required />
          </Field>
          <Field label="Website slug">
            <input className={inputClassName} name="slug" placeholder="acme-technical-services" required />
          </Field>
          <Field label="Website type">
            <select className={inputClassName} name="websiteType" defaultValue="business_website">
              {websiteTypes.map((type) => (
                <option key={type.value} value={type.value} disabled={type.disabled}>
                  {type.label}
                  {type.disabled ? " - Coming Soon" : ""}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit">Create draft website</Button>
        </form>
      </Card>
    </div>
  );
}
