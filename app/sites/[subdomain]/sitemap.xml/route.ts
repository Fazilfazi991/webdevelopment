import { publicSiteUrl } from "@/lib/publishing/constants";
import { loadPublicSite } from "@/lib/publishing/public-loader";

export async function GET(_: Request, { params }: { params: { subdomain: string } }) {
  const { site, preview } = await loadPublicSite(params.subdomain);
  const urls = preview.pages.map((page) => {
    const loc = publicSiteUrl(params.subdomain, page.page_slug);
    return `<url><loc>${loc}</loc><lastmod>${site.published_at ?? site.updated_at}</lastmod></url>`;
  });
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`, {
    headers: { "content-type": "application/xml; charset=utf-8" }
  });
}
