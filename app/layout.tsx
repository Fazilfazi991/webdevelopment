import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Create your business website from your phone in five minutes",
  description: "A mobile-first guided website builder for business owners to prepare, preview, publish, and manage leads from their phone."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
