import { Card } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="h-28 animate-pulse" />
        <Card className="h-28 animate-pulse" />
        <Card className="h-28 animate-pulse" />
        <Card className="h-28 animate-pulse" />
        <Card className="h-28 animate-pulse" />
      </section>
      <Card className="h-52 animate-pulse" />
    </div>
  );
}
