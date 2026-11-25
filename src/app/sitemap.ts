import type { MetadataRoute } from "next";
import { getPublished, siteUrl } from "@/lib/published";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await getPublished();
  const base = siteUrl(c);
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/politica-de-privacidade`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
