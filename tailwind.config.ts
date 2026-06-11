import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18211f",
        muted: "#65716d",
        line: "#dfe7e2",
        canvas: "#f6f8f5",
        panel: "#ffffff",
        brand: {
          50: "#eef8f3",
          100: "#d8eee3",
          600: "#2f7f62",
          700: "#24654f",
          900: "#15382f"
        },
        gold: "#b7863b",
        danger: "#b42318",
        // Marketing homepage accent
        orange: {
          50: "#FEF0E8",
          100: "#FDDBC5",
          400: "#F0944A",
          500: "#E8611A",
          600: "#C4521A",
          700: "#9E3F10"
        }
      },
      boxShadow: {
        soft: "0 10px 28px rgba(24, 33, 31, 0.07)"
      },
      borderRadius: {
        app: "8px"
      }
    }
  },
  plugins: []
};

export default config;
