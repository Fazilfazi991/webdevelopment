"use client";

import { Card } from "@/components/ui/card";

export default function ErrorPage() {
  return <Card className="p-6 text-sm text-muted">AI admin data could not load. No provider secrets are shown here.</Card>;
}
