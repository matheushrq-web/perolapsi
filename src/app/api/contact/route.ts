import { getStore } from "@/lib/store";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Formulário de contato. Só aceita envios quando o formulário está ATIVO no conteúdo publicado.
 * Coleta o mínimo: nome, canal de contato e mensagem opcional.
 */
export async function POST(request: Request) {
  const store = getStore();
  const { content } = await store.getPublished();
  if (!content.contato.form.enabled) {
    return Response.json({ error: "O formulário está desativado." }, { status: 403 });
  }
  if (!rateLimit(`contact:${clientIp(request)}`, 5, 10 * 60_000)) {
    return Response.json({ error: "Muitos envios em pouco tempo. Tente mais tarde." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Envio inválido." }, { status: 400 });
  }

  // campo-armadilha para robôs
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true });

  const name = String(body.name ?? "").trim();
  const channel = String(body.channel ?? "").trim();
  const message = String(body.message ?? "").trim();
  const consent = body.consent === true;

  const errors: Record<string, string> = {};
  if (name.length < 2 || name.length > 80) errors.name = "Informe seu nome (até 80 caracteres).";
  if (channel.length < 6 || channel.length > 120)
    errors.channel = "Informe um telefone, WhatsApp ou e-mail para o retorno.";
  if (message.length > 1000) errors.message = "A mensagem pode ter até 1000 caracteres.";
  if (!consent) errors.consent = "É preciso concordar com o aviso de privacidade.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

  try {
    await store.addMessage({ name, channel, message });
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Não foi possível enviar agora. Tente pelos outros canais." }, { status: 500 });
  }
}
