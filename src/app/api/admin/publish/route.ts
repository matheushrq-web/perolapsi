import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { reviewContent, sanitizeContent } from "@/content/validate";

/** Publica o rascunho. Bloqueia se houver informação profissional pendente ou provisória. */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;
  let body: { content?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Conteúdo inválido." }, { status: 400 });
  }
  const content = sanitizeContent(body.content);
  const review = reviewContent(content);
  if (review.blockers.length) {
    await getStore().saveDraft(content);
    return Response.json({ error: "Há pendências que impedem a publicação.", review }, { status: 422 });
  }
  try {
    const updatedAt = await getStore().publish(content);
    revalidatePath("/", "layout");
    return Response.json({ content, updatedAt, review });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Não foi possível publicar. Tente novamente." }, { status: 500 });
  }
}
