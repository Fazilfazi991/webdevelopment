import { publicSiteUrl } from "@/lib/publishing/constants";
import { loadPublicSite } from "@/lib/publishing/public-loader";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { subdomain: string } }) {
  const { site } = await loadPublicSite(params.subdomain);
  const rules = site.robots_index ? "User-agent: *\nAllow: /" : "User-agent: *\nDisallow: /";
  return new Response(`${rules}\nSitemap: ${publicSiteUrl(params.subdomain, "sitemap.xml")}\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" }
  });
}
