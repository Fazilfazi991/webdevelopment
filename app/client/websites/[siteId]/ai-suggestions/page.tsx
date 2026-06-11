import { AiSuggestionsPage } from "@/app/ai-pages";

export default function ClientAiSuggestionsRoute({
  params,
  searchParams
}: {
  params: { siteId: string };
  searchParams: { message?: string; error?: string };
}) {
  return <AiSuggestionsPage siteId={params.siteId} searchParams={searchParams} />;
}
