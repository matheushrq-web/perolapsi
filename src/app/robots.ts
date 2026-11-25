import type { MetadataRoute } from "next";
import { getPublished, siteUrl } from "@/lib/published";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = siteUrl(await getPublished());
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/preview", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
