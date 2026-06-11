"use client";

import { useState } from "react";
import { createOrganizationAutoAction } from "@/app/actions";
import { StatusMessage } from "@/app/auth/status-message";
import { Button } from "@/components/ui/button";
import { countries } from "@/lib/constants";

const fieldCls =
  "min-h-[52px] w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand-700 focus:ring-2 focus:ring-brand-100";

export function SimpleOrgForm({ error }: { error?: string }) {
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      action={createOrganizationAutoAction}
      onSubmit={() => setPending(true)}
      className="grid gap-5"
    >
      <StatusMessage error={error} />

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink">
          Business name <span className="text-brand-700">*</span>
        </span>
        <input
          className={fieldCls}
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Horizon Technical Services"
          autoComplete="organization"
          autoFocus
          required
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink">Country</span>
        <select className={fieldCls} name="countryCode" defaultValue="AE">
          {countries.map((c) => (
            <option key={c.value} value={c.value}>
              {c.value === "IN" ? "🇮🇳 India" : c.value === "AE" ? "🇦🇪 UAE" : "🌍 Other"} — {c.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted">
          Currency and timezone are set automatically from your country.
        </span>
      </label>

      <Button
        type="submit"
        disabled={!name.trim() || pending}
        className="min-h-[52px] w-full text-base font-bold disabled:opacity-50"
      >
        {pending ? "Setting up…" : "Continue →"}
      </Button>
    </form>
  );
}
