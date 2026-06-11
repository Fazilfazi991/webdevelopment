import { Card } from "@/components/ui/card";

export default function EditorLoading() {
  return (
    <div className="min-h-screen bg-canvas p-4">
      <div className="mx-auto grid max-w-7xl gap-4 xl:grid-cols-[390px_1fr]">
        <Card className="h-96 animate-pulse" />
        <Card className="h-[70vh] animate-pulse" />
      </div>
    </div>
  );
}
