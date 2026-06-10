import { Card } from "@/components/ui/card";

export function ComingSoonCard({ title }: { title: string }) {
  return (
    <Card className="p-5 opacity-60">
      <h3 className="font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted">Coming Soon</p>
    </Card>
  );
}
