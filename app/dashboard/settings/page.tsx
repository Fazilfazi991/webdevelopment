import { updateProfileAction } from "@/app/actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";
import { countries, languages } from "@/lib/constants";
import { requireDashboardContext } from "@/lib/data";

export default async function SettingsPage({ searchParams }: { searchParams: { error?: string; message?: string } }) {
  const { profile, organization } = await requireDashboardContext();

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="p-6">
        <h2 className="text-lg font-bold text-ink">Profile</h2>
        <form action={updateProfileAction} className="mt-5 grid gap-4">
          <StatusMessage error={searchParams.error} message={searchParams.message} />
          <Field label="Full name">
            <input className={inputClassName} name="fullName" defaultValue={profile?.full_name ?? ""} required />
          </Field>
          <Field label="Phone">
            <input className={inputClassName} name="phone" defaultValue={profile?.phone ?? ""} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Country">
              <select className={inputClassName} name="countryCode" defaultValue={profile?.country_code ?? "IN"}>
                {countries.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Preferred language">
              <select className={inputClassName} name="preferredLanguage" defaultValue={profile?.preferred_language ?? "en"}>
                {languages.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Button type="submit">Save profile</Button>
        </form>
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-bold text-ink">Organisation</h2>
        <dl className="mt-5 grid gap-3 text-sm">
          {[
            ["Name", organization.name],
            ["Slug", organization.slug],
            ["Country", organization.country_code],
            ["Currency", organization.default_currency],
            ["Timezone", organization.timezone]
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-line pb-3 last:border-0">
              <dt className="font-semibold text-muted">{label}</dt>
              <dd className="text-right font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
