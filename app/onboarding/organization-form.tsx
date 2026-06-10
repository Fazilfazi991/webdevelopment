"use client";

import { useMemo, useState } from "react";
import { createOrganizationAction } from "@/app/actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";
import { countries, currencies, timezones } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export function OrganizationForm({ error }: { error?: string }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const suggested = useMemo(() => slugify(name), [name]);

  function updateName(value: string) {
    setName(value);
    if (!slug || slug === suggested) setSlug(slugify(value));
  }

  return (
    <form action={createOrganizationAction} className="grid gap-4">
      <StatusMessage error={error} />
      <Field label="Organisation name">
        <input className={inputClassName} name="name" value={name} onChange={(event) => updateName(event.target.value)} placeholder="Zorx Media" required />
      </Field>
      <Field label="Organisation slug">
        <input className={inputClassName} name="slug" value={slug} onChange={(event) => setSlug(slugify(event.target.value))} placeholder="zorx-media" required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Country">
          <select className={inputClassName} name="countryCode" defaultValue="IN">
            {countries.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Currency">
          <select className={inputClassName} name="defaultCurrency" defaultValue="INR">
            {currencies.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Timezone">
          <select className={inputClassName} name="timezone" defaultValue="Asia/Kolkata">
            {timezones.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Button type="submit" className="mt-2">
        Continue to dashboard
      </Button>
    </form>
  );
}
