import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guided Website Builder",
  description: "A guided multi-tenant website builder for professional business websites."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
