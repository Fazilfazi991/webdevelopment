"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Globe2, Phone, Smartphone } from "lucide-react";
import { createSiteWithProfileAction } from "@/app/actions";
import { ImageUploadSlot } from "@/components/onboarding/image-upload-slot";
import { ServiceChipPicker, TECHNICAL_SERVICES_PRESETS } from "@/components/onboarding/service-chip-picker";
import { cn } from "@/lib/utils";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DRAFT_KEY = "mow_draft";

const BUSINESS_CATEGORIES = [
  { id: "technical-services", label: "Technical Services", icon: "⚙️" },
  { id: "restaurant", label: "Restaurant / Café", icon: "🍽️" },
  { id: "retail", label: "Retail / Shop", icon: "🛍️" },
  { id: "beauty-wellness", label: "Beauty & Wellness", icon: "💆" },
  { id: "real-estate", label: "Real Estate", icon: "🏠" },
  { id: "education", label: "Education / Training", icon: "📚" },
  { id: "healthcare", label: "Healthcare / Clinic", icon: "🏥" },
  { id: "logistics", label: "Transport / Logistics", icon: "🚚" },
  { id: "professional-services", label: "Professional Services", icon: "💼" },
  { id: "other", label: "Other", icon: "✨" }
] as const;

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "ml", label: "Malayalam" }
] as const;

const COUNTRIES = [
  { value: "IN", label: "🇮🇳 India" },
  { value: "AE", label: "🇦🇪 UAE" },
  { value: "XX", label: "🌍 Other" }
] as const;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface WizardData {
  // Screen 1
  businessName: string;
  categoryId: string;
  city: string;
  language: string;
  country: string;
  slug: string;
  // Screen 2
  phone: string;
  whatsappSameAsPhone: boolean;
  whatsapp: string;
  email: string;
  address: string;
  mapsLink: string;
  workingHours: string;
  // Screen 3
  selectedServiceIds: string[];
  customServices: string[];
}

const INITIAL_DATA: WizardData = {
  businessName: "",
  categoryId: "",
  city: "",
  language: "en",
  country: "AE",
  slug: "",
  phone: "",
  whatsappSameAsPhone: true,
  whatsapp: "",
  email: "",
  address: "",
  mapsLink: "",
  workingHours: "",
  selectedServiceIds: [],
  customServices: []
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function loadDraft(): WizardData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as WizardData) : null;
  } catch { return null; }
}

function saveDraft(data: WizardData) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}

// ─── Progress Dots ─────────────────────────────────────────────────────────────

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i < step ? "w-6 bg-brand-700" : i === step ? "w-6 bg-brand-700" : "w-2 bg-line"
          )}
        />
      ))}
    </div>
  );
}

// ─── Input primitives ─────────────────────────────────────────────────────────

const fieldCls = "min-h-[52px] w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand-700 focus:ring-2 focus:ring-brand-100";

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-ink">
      {children}
      {required && <span className="ml-1 text-brand-700">*</span>}
    </label>
  );
}

// ─── Screen 1: Business Details ───────────────────────────────────────────────

function Screen1({
  data,
  onChange
}: {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">Tell us about your business</h1>
        <p className="mt-2 text-sm leading-6 text-muted">We&apos;ll prepare a website that matches your business in minutes.</p>
      </div>

      {/* Business name */}
      <div className="space-y-2">
        <FieldLabel required>Business name</FieldLabel>
        <input
          className={fieldCls}
          placeholder="e.g. Horizon Technical Services"
          value={data.businessName}
          onChange={(e) => {
            const name = e.target.value;
            onChange({ businessName: name, slug: slugify(name) });
          }}
          autoComplete="organization"
          autoFocus
        />
      </div>

      {/* Category chips */}
      <div className="space-y-2">
        <FieldLabel required>Business category</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {BUSINESS_CATEGORIES.map((cat) => {
            const selected = data.categoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ categoryId: cat.id })}
                className={cn(
                  "flex min-h-[52px] items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition active:scale-95",
                  selected
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-line bg-white text-ink hover:border-brand-600 hover:bg-brand-50"
                )}
                aria-pressed={selected}
              >
                <span className="text-xl leading-none">{cat.icon}</span>
                <span className="flex-1 leading-tight">{cat.label}</span>
                {selected && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* City */}
      <div className="space-y-2">
        <FieldLabel required>City or service location</FieldLabel>
        <input
          className={fieldCls}
          placeholder="e.g. Dubai, Sharjah, Mumbai"
          value={data.city}
          onChange={(e) => onChange({ city: e.target.value })}
          autoComplete="address-level2"
        />
      </div>

      {/* Country + Language */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <FieldLabel>Country</FieldLabel>
          <select
            className={fieldCls}
            value={data.country}
            onChange={(e) => onChange({ country: e.target.value })}
          >
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <FieldLabel>Language</FieldLabel>
          <select
            className={fieldCls}
            value={data.language}
            onChange={(e) => onChange({ language: e.target.value })}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Slug preview */}
      {data.slug && (
        <p className="rounded-xl border border-line bg-canvas px-4 py-3 text-xs text-muted">
          🔗 Your website address: <strong className="text-ink">{data.slug}.yourplatform.com</strong>
        </p>
      )}
    </div>
  );
}

// ─── Screen 2: Contact Details ────────────────────────────────────────────────

function Screen2({
  data,
  onChange
}: {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">How can customers reach you?</h1>
        <p className="mt-2 text-sm leading-6 text-muted">This information appears on your website so customers can contact you directly.</p>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <FieldLabel required>Phone number</FieldLabel>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 focus-within:border-brand-700 focus-within:ring-2 focus-within:ring-brand-100 transition">
          <Phone size={18} className="shrink-0 text-muted" />
          <input
            className="min-h-[52px] flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            type="tel"
            placeholder="+971 50 000 0000"
            value={data.phone}
            onChange={(e) => {
              const phone = e.target.value;
              onChange({
                phone,
                whatsapp: data.whatsappSameAsPhone ? phone : data.whatsapp
              });
            }}
            autoComplete="tel"
            inputMode="tel"
          />
        </div>
      </div>

      {/* WhatsApp toggle */}
      <label className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
        <div
          onClick={() => onChange({ whatsappSameAsPhone: !data.whatsappSameAsPhone })}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
            data.whatsappSameAsPhone ? "bg-brand-700" : "bg-line"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
              data.whatsappSameAsPhone ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">WhatsApp same as phone</p>
          {!data.whatsappSameAsPhone && (
            <input
              className="mt-2 min-h-[44px] w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
              type="tel"
              placeholder="WhatsApp number"
              value={data.whatsapp}
              onChange={(e) => onChange({ whatsapp: e.target.value })}
              inputMode="tel"
            />
          )}
        </div>
      </label>

      {/* Email */}
      <div className="space-y-2">
        <FieldLabel>Email address</FieldLabel>
        <input
          className={fieldCls}
          type="email"
          placeholder="hello@yourbusiness.com"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          autoComplete="email"
          inputMode="email"
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <FieldLabel>Business address</FieldLabel>
        <textarea
          className={cn(fieldCls, "min-h-[80px] resize-none")}
          placeholder="Shop 12, Building name, Street, City"
          value={data.address}
          onChange={(e) => onChange({ address: e.target.value })}
          autoComplete="street-address"
          rows={2}
        />
      </div>

      {/* Optional fields */}
      <details className="rounded-xl border border-line bg-white">
        <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-muted">
          Optional: Maps link &amp; working hours
          <ChevronRight size={16} className="transition-transform [[open]_details_&]:rotate-90" />
        </summary>
        <div className="space-y-4 border-t border-line px-4 pb-4 pt-3">
          <div className="space-y-2">
            <FieldLabel>Google Maps link</FieldLabel>
            <input
              className={fieldCls}
              placeholder="https://maps.google.com/..."
              value={data.mapsLink}
              onChange={(e) => onChange({ mapsLink: e.target.value })}
              type="url"
              inputMode="url"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Working hours</FieldLabel>
            <input
              className={fieldCls}
              placeholder="Mon–Sat 9am–6pm, Sun closed"
              value={data.workingHours}
              onChange={(e) => onChange({ workingHours: e.target.value })}
            />
          </div>
        </div>
      </details>
    </div>
  );
}

// ─── Screen 3: Services & Photos ──────────────────────────────────────────────

function Screen3({
  data,
  onChange,
  logoFile,
  heroFile,
  onLogoChange,
  onHeroChange
}: {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
  logoFile: File | null;
  heroFile: File | null;
  onLogoChange: (f: File | null) => void;
  onHeroChange: (f: File | null) => void;
}) {
  const isTechnical = data.categoryId === "technical-services";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Services &amp; photos</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Choose your services and optionally add your logo and a photo. You can change these anytime.</p>
      </div>

      {/* Service chips */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-ink">
          {isTechnical ? "Select your services" : "What do you offer?"}
        </p>
        {isTechnical ? (
          <ServiceChipPicker
            presets={TECHNICAL_SERVICES_PRESETS}
            selectedIds={data.selectedServiceIds}
            onToggle={(id) =>
              onChange({
                selectedServiceIds: data.selectedServiceIds.includes(id)
                  ? data.selectedServiceIds.filter((s) => s !== id)
                  : [...data.selectedServiceIds, id]
              })
            }
            customServices={data.customServices}
            onAddCustom={(s) => onChange({ customServices: [...data.customServices, s] })}
            onRemoveCustom={(s) => onChange({ customServices: data.customServices.filter((x) => x !== s) })}
          />
        ) : (
          <ServiceChipPicker
            presets={[]}
            selectedIds={[]}
            onToggle={() => {}}
            customServices={data.customServices}
            onAddCustom={(s) => onChange({ customServices: [...data.customServices, s] })}
            onRemoveCustom={(s) => onChange({ customServices: data.customServices.filter((x) => x !== s) })}
          />
        )}
      </div>

      {/* Logo upload */}
      <ImageUploadSlot
        label="Business logo"
        hint="Optional — a square or landscape logo works best."
        value={logoFile}
        onChange={onLogoChange}
      />

      {/* Hero image upload */}
      <ImageUploadSlot
        label="Main photo"
        hint="Optional — shows at the top of your website. Landscape photos look great."
        value={heroFile}
        onChange={onHeroChange}
        preferCamera
      />
    </div>
  );
}

// ─── Screen 4: Website Ready ──────────────────────────────────────────────────

function Screen4({ data, submitting }: { data: WizardData; submitting: boolean }) {
  const category = BUSINESS_CATEGORIES.find((c) => c.id === data.categoryId);
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl">🎉</div>
        <h1 className="text-2xl font-bold text-ink">Your website is ready!</h1>
        <p className="mx-auto max-w-xs text-sm leading-6 text-muted">
          We selected a professional design for your business. You can publish now or make changes anytime.
        </p>
      </div>

      {/* Design badge */}
      <div className="rounded-xl border border-brand-100 bg-brand-50 px-5 py-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">Recommended design</p>
        <p className="mt-1 text-base font-bold text-ink">
          {category ? `${category.label} — Modern` : "Business Modern"}
        </p>
        <p className="mt-1 text-sm text-muted">{data.businessName}</p>
      </div>

      {/* Phone mockup */}
      <div className="relative mx-auto w-[200px]">
        <div className="relative rounded-[28px] border-4 border-ink bg-ink shadow-xl">
          <div className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-ink/80" />
          <div className="overflow-hidden rounded-[24px] bg-white">
            <div className="h-[320px] bg-gradient-to-b from-brand-700 to-brand-900 p-4 text-white">
              <div className="mt-6 space-y-2">
                <div className="h-2 w-12 rounded-full bg-white/30" />
                <div className="h-5 w-36 rounded-full bg-white/90" />
                <div className="h-3 w-28 rounded-full bg-white/60" />
              </div>
              <div className="mt-4 h-20 w-full rounded-xl bg-white/10" />
              <div className="mt-3 h-8 w-32 rounded-xl bg-white/20" />
            </div>
            <div className="space-y-2 p-3">
              <div className="h-3 w-full rounded-full bg-canvas" />
              <div className="h-3 w-3/4 rounded-full bg-canvas" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="h-12 rounded-xl bg-canvas" />
                <div className="h-12 rounded-xl bg-canvas" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview toggles */}
      <div className="flex items-center justify-center gap-2">
        <button type="button" className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-brand-700 bg-brand-700 px-4 text-xs font-semibold text-white">
          <Smartphone size={13} /> Mobile
        </button>
        <button type="button" className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-line bg-white px-4 text-xs font-semibold text-muted">
          <Globe2 size={13} /> Desktop
        </button>
      </div>

      {submitting && (
        <p className="text-sm font-semibold text-brand-700 animate-pulse">Publishing your website…</p>
      )}
    </div>
  );
}

// ─── Wizard shell ─────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;
const STEP_LABELS = [
  "Business details",
  "Contact details",
  "Services & photos",
  "Your website is ready"
];
const NEXT_LABELS = ["Continue", "Add Services", "Prepare My Website", "Publish Website"];
const NEXT_ICONS = [undefined, undefined, undefined, Globe2];

export function MobileOnboardingWizard({ error }: { error?: string }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resumeBanner, setResumeBanner] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft?.businessName) {
      setData(draft);
      setResumeBanner(true);
    }
  }, []);

  // Save draft on data change
  useEffect(() => { saveDraft(data); }, [data]);

  function update(partial: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  function canAdvance(): boolean {
    if (step === 0) return Boolean(data.businessName.trim() && data.categoryId && data.city.trim());
    if (step === 1) return Boolean(data.phone.trim());
    return true;
  }

  function handleNext() {
    if (!canAdvance()) return;
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Final submit — fill a hidden form and submit it
      formRef.current?.requestSubmit();
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const NextIcon = NEXT_ICONS[step];

  return (
    <div className="relative flex min-h-[calc(100svh-72px)] flex-col">
      {/* Resume banner */}
      {resumeBanner && step === 0 && (
        <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
          <p className="text-sm font-semibold text-brand-700">Welcome back — continue where you left off.</p>
          <button
            type="button"
            onClick={() => { setData(INITIAL_DATA); clearDraft(); setResumeBanner(false); }}
            className="shrink-0 text-xs font-semibold text-muted underline"
          >
            Start over
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Progress dots + step label */}
      <div className="px-4 pt-6 pb-2 text-center">
        <ProgressDots step={step} total={TOTAL_STEPS} />
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted">
          Step {step + 1} of {TOTAL_STEPS} — {STEP_LABELS[step]}
        </p>
      </div>

      {/* Screen content */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-32">
        {step === 0 && <Screen1 data={data} onChange={update} />}
        {step === 1 && <Screen2 data={data} onChange={update} />}
        {step === 2 && (
          <Screen3
            data={data}
            onChange={update}
            logoFile={logoFile}
            heroFile={heroFile}
            onLogoChange={setLogoFile}
            onHeroChange={setHeroFile}
          />
        )}
        {step === 3 && <Screen4 data={data} submitting={submitting} />}
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-line bg-white/95 px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex min-h-[52px] min-w-[52px] items-center justify-center rounded-xl border border-line bg-white text-ink transition hover:bg-canvas active:scale-95"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance() || submitting}
            className={cn(
              "flex flex-1 min-h-[52px] items-center justify-center gap-2 rounded-xl text-sm font-bold transition active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              step === TOTAL_STEPS - 1
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-brand-700 text-white hover:bg-brand-900"
            )}
          >
            {NextIcon && <NextIcon size={16} />}
            {NEXT_LABELS[step]}
          </button>
        </div>
      </div>

      {/* Hidden form for final submission */}
      <form
        ref={formRef}
        action={createSiteWithProfileAction}
        className="hidden"
        onSubmit={() => setSubmitting(true)}
      >
        <input name="name" defaultValue={data.businessName} />
        <input name="slug" defaultValue={data.slug} />
        <input name="countryCode" defaultValue={data.country} />
        <input name="defaultLanguage" defaultValue={data.language} />
        <input name="phone" defaultValue={data.phone} />
        <input
          name="whatsapp"
          defaultValue={data.whatsappSameAsPhone ? data.phone : data.whatsapp}
        />
        <input name="email" defaultValue={data.email} />
        <input name="address" defaultValue={data.address} />
        <input name="city" defaultValue={data.city} />
        <input name="mapEmbedUrl" defaultValue={data.mapsLink} />
        <input name="workingHours" defaultValue={data.workingHours} />
        <input name="services" defaultValue={[...data.selectedServiceIds, ...data.customServices].join(",")} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
