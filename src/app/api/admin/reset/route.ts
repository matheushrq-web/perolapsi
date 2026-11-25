import { requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { DEFAULT_CONTENT } from "@/content/defaults";
import { reviewContent, sanitizeContent } from "@/content/validate";

/** Restaura o RASCUNHO para o conteúdo padrão. O site público só muda ao publicar. */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;
  const content = sanitizeContent(structuredClone(DEFAULT_CONTENT));
  const updatedAt = await getStore().saveDraft(content);
  return Response.json({ content, updatedAt, review: reviewContent(content) });
}
