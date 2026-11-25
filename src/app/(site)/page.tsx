import type { Metadata } from "next";
import { Site } from "@/components/site/Site";
import { buildMetadata, getPublished, jsonLd } from "@/lib/published";

// Página estática, regenerada ao publicar pelo painel (revalidatePath) ou a cada hora.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPublished());
}

export default async function Home() {
  const c = await getPublished();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(c)).replace(/</g, "\\u003c") }}
      />
      <Site c={c} year={new Date().getFullYear()} />
    </>
  );
}
