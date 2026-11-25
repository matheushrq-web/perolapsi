import { requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { reviewContent, sanitizeContent } from "@/content/validate";

export const dynamic = "force-dynamic";

/** Lê o rascunho atual */
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;
  const store = getStore();
  const [draft, published] = await Promise.all([store.getDraft(), store.getPublished()]);
  return Response.json({
    content: draft.content,
    draftUpdatedAt: draft.updatedAt,
    publishedUpdatedAt: published.updatedAt,
    review: reviewContent(draft.content),
    driver: store.driver,
  });
}

/** Salva o rascunho (não altera o site público) */
export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;
  let body: { content?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Conteúdo inválido." }, { status: 400 });
  }
  const content = sanitizeContent(body.content);
  try {
    const updatedAt = await getStore().saveDraft(content);
    return Response.json({ content, updatedAt, review: reviewContent(content) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Não foi possível salvar. Tente novamente." }, { status: 500 });
  }
}
