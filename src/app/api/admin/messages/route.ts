import { requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;
  return Response.json({ messages: await getStore().listMessages() });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Mensagem não informada." }, { status: 400 });
  await getStore().deleteMessage(id);
  return Response.json({ ok: true });
}
