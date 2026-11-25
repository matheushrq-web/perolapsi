import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { PreviewClient } from "./PreviewClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pré-visualização", robots: { index: false, follow: false } };

/** Mostra o RASCUNHO. Dentro do painel, é atualizado ao vivo a cada alteração. */
export default async function PreviewPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const { content } = await getStore().getDraft();
  return <PreviewClient initial={content} year={new Date().getFullYear()} />;
}
