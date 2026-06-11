"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const TECHNICAL_SERVICES_PRESETS = [
  { id: "ac-maintenance", label: "AC Maintenance", icon: "❄️" },
  { id: "electrical", label: "Electrical Services", icon: "⚡" },
  { id: "plumbing", label: "Plumbing", icon: "🔧" },
  { id: "painting", label: "Painting", icon: "🎨" },
  { id: "interior-repairs", label: "Interior Repairs", icon: "🏠" },
  { id: "preventive-maintenance", label: "Preventive Maintenance", icon: "🛡️" },
  { id: "cleaning", label: "Cleaning", icon: "✨" },
  { id: "mep-services", label: "MEP Services", icon: "⚙️" }
] as const;

interface ServiceChipPickerProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  customServices: string[];
  onAddCustom: (service: string) => void;
  onRemoveCustom: (service: string) => void;
  presets?: readonly { id: string; label: string; icon: string; }[];
}

export function ServiceChipPicker({
  selectedIds,
  onToggle,
  customServices,
  onAddCustom,
  onRemoveCustom,
  presets = TECHNICAL_SERVICES_PRESETS
}: ServiceChipPickerProps) {
  const [addingCustom, setAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  function submitCustom() {
    const trimmed = customInput.trim();
    if (trimmed && !customServices.includes(trimmed)) {
      onAddCustom(trimmed);
    }
    setCustomInput("");
    setAddingCustom(false);
  }

  return (
    <div className="space-y-3">
      {/* Preset chips */}
      <div className="flex flex-wrap gap-2">
        {presets.map((service) => {
          const selected = selectedIds.includes(service.id);
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onToggle(service.id)}
              className={cn(
                "inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95",
                selected
                  ? "border-brand-700 bg-brand-700 text-white shadow-sm"
                  : "border-line bg-white text-ink hover:border-brand-600 hover:bg-brand-50"
              )}
              aria-pressed={selected}
            >
              <span className="text-base leading-none">{service.icon}</span>
              <span>{service.label}</span>
              {selected && <Check size={14} className="shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Custom services added by user */}
      {customServices.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customServices.map((service) => (
            <span
              key={service}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-brand-700 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700"
            >
              {service}
              <button
                type="button"
                onClick={() => onRemoveCustom(service)}
                className="ml-1 rounded-full p-0.5 hover:bg-brand-100"
                aria-label={`Remove ${service}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add custom service */}
      {addingCustom ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitCustom(); } }}
            placeholder="e.g. CCTV Installation"
            autoFocus
            className="min-h-[44px] flex-1 rounded-xl border border-line bg-white px-4 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="button"
            onClick={submitCustom}
            className="min-h-[44px] rounded-xl border border-brand-700 bg-brand-700 px-4 text-sm font-semibold text-white transition hover:bg-brand-900"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setAddingCustom(false); setCustomInput(""); }}
            className="min-h-[44px] rounded-xl border border-line bg-white px-3 text-sm font-semibold text-muted transition hover:bg-canvas"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingCustom(true)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-dashed border-line bg-canvas px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand-600 hover:text-ink"
        >
          <Plus size={14} />
          Add another service
        </button>
      )}
    </div>
  );
}
