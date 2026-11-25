import "server-only";
import { cache } from "react";
import type { Metadata } from "next";
import { getStore } from "@/lib/store";
import { withDefaults } from "@/content/validate";
import { crpLine, instagramHref, plain } from "@/lib/site";
import type { SiteContent } from "@/content/types";

/** Conteúdo publicado (com fallback para o padrão se o banco estiver indisponível) */
export const getPublished = cache(async (): Promise<SiteContent> => {
  try {
    return (await getStore().getPublished()).content;
  } catch (e) {
    console.error("Falha ao ler o conteúdo publicado:", e);
    return withDefaults(null);
  }
});

export function siteUrl(c: SiteContent) {
  return c.seo.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function buildMetadata(c: SiteContent, opts: { title?: string; path?: string } = {}): Metadata {
  const base = siteUrl(c);
  const title = opts.title ?? c.seo.title;
  const og = c.seo.ogImageUrl || c.hero.image.url;
  return {
    metadataBase: new URL(base),
    title,
    description: c.seo.description,
    keywords: c.seo.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    alternates: { canonical: opts.path ?? "/" },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: opts.path ?? "/",
      siteName: c.brand.name,
      title,
      description: c.seo.description,
      images: og ? [{ url: og, width: 1200, height: 630, alt: c.hero.image.alt || c.brand.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description: c.seo.description, images: og ? [og] : undefined },
    icons: c.brand.faviconUrl ? { icon: c.brand.faviconUrl, apple: c.brand.faviconUrl } : undefined,
    robots: { index: true, follow: true },
  };
}

/** Dados estruturados apenas com informações reais e preenchidas */
export function jsonLd(c: SiteContent) {
  const url = siteUrl(c);
  const sameAs = [instagramHref(c), ...c.footer.socials.filter((s) => s.visible).map((s) => s.href)].filter(
    (v, i, a) => v && v !== "https://" && a.indexOf(v) === i,
  );
  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": `${url}/#pessoa`,
    name: c.brand.name,
    jobTitle: c.brand.role,
    url,
    description: plain(c.seo.description),
  };
  if (sameAs.length) person.sameAs = sameAs;
  const crp = crpLine(c);
  if (crp) person.identifier = { "@type": "PropertyValue", propertyID: "CRP", value: c.brand.crp.trim() };
  if (c.hero.image.url && !c.hero.image.standIn) person.image = c.hero.image.url;
  if (c.contato.email) person.email = c.contato.email;

  const graph: Record<string, unknown>[] = [
    person,
    { "@type": "WebSite", "@id": `${url}/#site`, url, name: c.seo.title, inLanguage: "pt-BR" },
  ];
  if (c.modalidades.address || c.modalidades.city) {
    graph.push({
      "@type": "ProfessionalService",
      name: `${c.brand.name} · ${c.brand.role}`,
      url,
      founder: { "@id": `${url}/#pessoa` },
      address: {
        "@type": "PostalAddress",
        ...(c.modalidades.address ? { streetAddress: c.modalidades.address } : {}),
        ...(c.modalidades.city ? { addressLocality: c.modalidades.city } : {}),
        addressCountry: "BR",
      },
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
