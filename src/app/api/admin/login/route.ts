import { NextResponse } from "next/server";
import { authMode, checkCredentials, SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (authMode() === "unconfigured") {
    return NextResponse.json(
      { error: "O acesso ao painel ainda não foi configurado. Veja o README (variáveis de ambiente)." },
      { status: 503 },
    );
  }
  if (!rateLimit(`login:${clientIp(request)}`, 8, 15 * 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  }
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.slice(0, 200) : "";
  const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
  if (!email || !password) return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });

  const ok = await checkCredentials(email, password);
  if (!ok) return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, signSession(email.trim().toLowerCase()), sessionCookieOptions());
  return res;
}
