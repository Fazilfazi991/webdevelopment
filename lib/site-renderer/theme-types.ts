export type SiteThemeTokens = {
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    ink: string;
    muted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  radius: {
    card: string;
    button: string;
  };
  shadow: string;
  buttonStyle: "solid" | "outline";
  spacing: "compact" | "comfortable";
};

export const defaultSiteTheme: SiteThemeTokens = {
  colors: {
    primary: "#0f766e",
    primaryDark: "#134e4a",
    secondary: "#d8c3a5",
    background: "#ffffff",
    surface: "#f7f5f0",
    ink: "#111827",
    muted: "#4b5563",
    border: "#e5e1d8"
  },
  fonts: {
    heading: "Inter, Arial, sans-serif",
    body: "Inter, Arial, sans-serif"
  },
  radius: {
    card: "8px",
    button: "6px"
  },
  shadow: "0 14px 34px rgba(17, 24, 39, 0.10)",
  buttonStyle: "solid",
  spacing: "comfortable"
};
