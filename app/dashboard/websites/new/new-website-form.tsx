"use client";

import { useState } from "react";
import { createSiteAction } from "@/app/actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";
import { suggestedSlug } from "@/lib/validators/onboarding";

export function NewWebsiteForm({
  error,
  countries,
  languages,
  defaultCountry
}: {
  error?: string;
  countries: ReadonlyArray<{ value: string; label: string }>;
  languages: ReadonlyArray<{ value: string; label: string }>;
  defaultCountry: string;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={createSiteAction} className="grid gap-4">
      <StatusMessage error={error} />
      <Field label="Business / website name">
        <input
          className={inputClassName}
          name="name"
          value={name}
          onChange={(event) => {
            const next = event.target.value;
            setName(next);
            if (!slugTouched) setSlug(suggestedSlug(next));
          }}
          placeholder="Horizon Technical Services"
          required
        />
      </Field>
      <Field label="Website slug">
        <input
          className={inputClassName}
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(suggestedSlug(event.target.value));
          }}
          placeholder="horizon-technical-services"
          required
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Country">
          <select className={inputClassName} name="countryCode" defaultValue={defaultCountry}>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Primary language">
          <select className={inputClassName} name="defaultLanguage" defaultValue="en">
            {languages.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <input type="hidden" name="websiteType" value="business_website" />
      <Button type="submit">Prepare my website</Button>
    </form>
  );
}
