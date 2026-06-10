import type { CSSProperties, ReactNode } from "react";
import type { SiteThemeTokens } from "@/lib/site-renderer/theme-types";

type SiteStyle = CSSProperties & {
  "--site-primary": string;
  "--site-primary-dark": string;
  "--site-secondary": string;
  "--site-background": string;
  "--site-surface": string;
  "--site-ink": string;
  "--site-muted": string;
  "--site-border": string;
  "--site-heading-font": string;
  "--site-body-font": string;
  "--site-card-radius": string;
  "--site-button-radius": string;
  "--site-shadow": string;
};

export function SiteThemeProvider({ theme, children }: { theme: SiteThemeTokens; children: ReactNode }) {
  const style: SiteStyle = {
    "--site-primary": theme.colors.primary,
    "--site-primary-dark": theme.colors.primaryDark,
    "--site-secondary": theme.colors.secondary,
    "--site-background": theme.colors.background,
    "--site-surface": theme.colors.surface,
    "--site-ink": theme.colors.ink,
    "--site-muted": theme.colors.muted,
    "--site-border": theme.colors.border,
    "--site-heading-font": theme.fonts.heading,
    "--site-body-font": theme.fonts.body,
    "--site-card-radius": theme.radius.card,
    "--site-button-radius": theme.radius.button,
    "--site-shadow": theme.shadow
  };

  return (
    <div className="site-preview min-h-full bg-[var(--site-background)] text-[var(--site-ink)]" style={style}>
      {children}
    </div>
  );
}
